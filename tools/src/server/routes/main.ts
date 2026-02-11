import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import fg from 'fast-glob';
import { Result, Future } from '@swan-io/boxed';

import * as LibTypes from '../../lib/types';
import * as ServerPaths from '../server.paths';
import * as ServerErrors from '../server.errors';
import * as ServerUtils from '../server.utils';

// --- Route Handlers ---

export const handleMainPage = (initialSketch?: string) => renderMainPage(initialSketch);

// --- Supporting Functions ---

interface IInitialData {
  dirs: LibTypes.IDir[];
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
    .map((result) => result.getOr([]))
    .flatMap((files) =>
      files.length === 0
        ? Future.value(0)
        : Future.fromPromise(Promise.all(files.map((file) => fs.stat(file))))
          .map((result) => result.getOr([]))
          .map((stats) => (stats.length > 0 ? Math.max(...stats.map((s) => s.mtime.getTime())) : 0))
    );
}

export function getSketchDirsData(sketchesDir: string): Future<Result<LibTypes.IDir[], ServerErrors.ServerError>> {
  return ServerUtils.readDir(sketchesDir)
    .mapError((err) => ServerErrors.serverError(`Failed to read sketches directory`, err))
    .flatMapOk((files) =>
      Future.all(
        files
          .filter((file) => file.isDirectory())
          .map((dir) =>
            getLastModifiedTime(path.join(sketchesDir, dir.name))
              .map((lastModified) => ({ name: dir.name, lastModified }))
          )
      ).map((dirs) => Result.Ok(dirs.sort((a, b) => a.name.localeCompare(b.name))))
    );
}

function renderMainPage(initialSketch?: string): Future<Result<string, ServerErrors.ServerError>> {
  return ServerUtils.readFile(ServerPaths.paths.uiIndex())
    .mapError((err) => ServerErrors.serverError('Failed to read UI template', err))
    .flatMapOk((template) =>
      getSketchDirsData(ServerPaths.paths.sketches())
        .mapOk((dirs) => injectInitialData(template, { dirs, initialSketch }))
    );
}
