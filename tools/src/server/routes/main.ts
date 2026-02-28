import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import fg from 'fast-glob';
import { Result, Future } from '@swan-io/boxed';
import type { Request, Response } from 'express';

import * as Types from '../../lib/types';
import * as Paths from '../server.paths';
import * as Errors from '../server.errors';
import * as Utils from '../server.utils';
import { SKETCH_GLOB, SKETCH_GLOB_IGNORE } from '../../build/build.utils';
import { createLogger } from '../../lib/logger';
import { getOrLog } from '../../lib/result-logging';

const log = createLogger('routes/main');

// --- Route Handlers ---

export const route = (req: Request, res: Response) => {
  renderMainPage(req.params.sketchName).tap(Utils.sendResult(res, (html) => res.send(html)));
};

// --- Supporting Functions ---

interface IInitialData {
  dirs: Types.IDir[];
  initialSketch?: string;
}

const injectInitialData = (template: string, data: IInitialData) =>
  template.replace('${initialData}', JSON.stringify(data));

// Returns the most recent mtime of source files in a directory, or 0 on error
function getLastModifiedTime(dirPath: string): Future<number> {
  const fgConfig = {
    cwd: dirPath,
    ignore: ['node_modules/**'],
    absolute: true,
    dot: false
  };

  return Future.fromPromise(
    fg(['**/*.{ts,tsx,html}'], fgConfig))
    .map(getOrLog(log, 'fast-glob file search', []))
    .flatMap((files) =>
      files.length === 0
        ? Future.value(0)
        : Future.fromPromise(Promise.all(files.map((file) => fs.stat(file))))
          .map(getOrLog(log, 'fs.stat files', []))
          .map((stats) => (stats.length > 0 ? Math.max(...stats.map((s) => s.mtime.getTime())) : 0))
    );
}

export function getSketchDirsData(sketchesDir: string): Future<Result<Types.IDir[], Errors.ServerError>> {
  return Future.fromPromise(
    fg(SKETCH_GLOB, {
      cwd: sketchesDir,
      ignore: SKETCH_GLOB_IGNORE,
    })
  )
    .mapError((err) => Errors.serverError('Failed to discover sketches', err))
    .flatMapOk((configPaths) => {
      const sketchPaths = configPaths.map((cp) => path.dirname(cp));
      return Future.all(
        sketchPaths.map((dirPath) =>
          getLastModifiedTime(path.join(sketchesDir, dirPath)).map(
            (lastModified): Types.IDir => ({
              name: path.basename(dirPath),
              path: dirPath,
              lastModified,
              isSketch: true,
            })
          )
        )
      ).map((dirs) => Result.Ok(dirs.sort((a, b) => a.path.localeCompare(b.path))));
    });
}

function renderMainPage(initialSketch?: string): Future<Result<string, Errors.ServerError>> {
  return Utils.readFile(Paths.paths.uiIndex())
    .mapError((err) => Errors.serverError('Failed to read UI template', err))
    .flatMapOk((template) =>
      getSketchDirsData(Paths.paths.sketches())
        .mapOk((dirs) => injectInitialData(template, { dirs, initialSketch }))
    );
}
