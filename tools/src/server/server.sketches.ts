import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import fg from 'fast-glob';
import { Result, Future } from '@swan-io/boxed';

import * as LibString from '../lib/string';
import * as LibTypes from '../lib/types';
import * as ServerPaths from './server.paths';
import * as ServerMiddleware from './server.middleware';

const readFile = (filePath: string) => Future.fromPromise(fs.readFile(filePath, 'utf-8'));

const writeFile = (filePath: string, content: string) =>
  Future.fromPromise(fs.writeFile(filePath, content, 'utf-8'));

const readDir = (dirPath: string) =>
  Future.fromPromise(fs.readdir(dirPath, { withFileTypes: true }));

function isValidServerHandler(module: unknown): module is { default: LibTypes.SketchServerHandler } {
  return (
    module !== null &&
    typeof module === 'object' &&
    'default' in module &&
    module.default !== null &&
    typeof module.default === 'object' &&
    'getParams' in module.default &&
    typeof (module.default as Record<string, unknown>).getParams === 'function'
  );
}

interface IInitialData {
  dirs: LibTypes.IDir[];
  initialSketch?: string;
}

const injectInitialData = (template: string, data: IInitialData) =>
  template.replace('${initialData}', JSON.stringify(data));

const applyTemplateParams = (template: string, params: Record<string, string>) =>
  Object.entries(params).reduce(
    (tpl, [key, value]) => tpl.replace(new RegExp(`\\{\\{${LibString.escapeRegex(key)}\\}\\}`, 'g'), value),
    template
  );

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

export function getSketchDirsData(sketchesDir: string): Future<Result<LibTypes.IDir[], ServerMiddleware.ServerError>> {
  return readDir(sketchesDir)
    .mapError((err) => ServerMiddleware.serverError(`Failed to read sketches directory`, err))
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

export function fetchSketchParams(sketchName: string): Future<Result<LibTypes.SketchParams, ServerMiddleware.ServerError>> {
  const sketchPaths = ServerPaths.paths.sketch(sketchName);

  console.log(`[fetchSketchParams] Loading params for sketch: ${sketchName}`);

  return readFile(sketchPaths.params)
    .tapOk(() => console.log(`[fetchSketchParams] Read params file: ${sketchPaths.params}`))
    .tapError((err) => console.log(`[fetchSketchParams] Failed to read params file:`, err))
    .mapError((err: unknown) =>
      ServerMiddleware.isErrnoException(err) && err.code === 'ENOENT'
        ? ServerMiddleware.notFound(`Parameters not found for sketch '${sketchName}'`)
        : ServerMiddleware.serverError('Failed to read parameters', err)
    )
    .flatMapOk((fileContent) =>
      Future.fromPromise(import(sketchPaths.serverHandler))
        .tapOk((module) =>
          console.log(`[fetchSketchParams] Loaded server handler, has default export: ${'default' in module}`)
        )
        .tapError((err) => console.log(`[fetchSketchParams] Failed to load server handler:`, err))
        .mapError((err: unknown) =>
          ServerMiddleware.isErrnoException(err) && err.code === 'MODULE_NOT_FOUND'
            ? ServerMiddleware.notFound(`Server handler not found for sketch '${sketchName}'`)
            : ServerMiddleware.serverError('Failed to load server handler', err)
        )
        .mapOkToResult((module) =>
          !isValidServerHandler(module)
            ? Result.Error(
              ServerMiddleware.serverError(
                `Server handler for sketch '${sketchName}' is invalid: must export default object with getParams function`
              )
            )
            : Result.fromExecution(() => module.default.getParams(fileContent))
              .mapError((err) =>
                ServerMiddleware.serverError(`Failed to parse params for sketch '${sketchName}'`, err))
        )
    );
}

export function renderMainPage(initialSketch?: string): Future<Result<string, ServerMiddleware.ServerError>> {
  return readFile(ServerPaths.paths.uiIndex())
    .mapError((err) => ServerMiddleware.serverError('Failed to read UI template', err))
    .flatMapOk((template) =>
      getSketchDirsData(ServerPaths.paths.sketches())
        .mapOk((dirs) => injectInitialData(template, { dirs, initialSketch }))
    );
}

// Update parameters for a sketch by applying values to a template.
export function updateSketchParams(
  sketchName: string,
  params: Record<string, string>
): Future<Result<void, ServerMiddleware.ServerError>> {
  const sketchPaths = ServerPaths.paths.sketch(sketchName);

  return readFile(sketchPaths.template)
    .mapError((err: unknown) =>
      ServerMiddleware.isErrnoException(err) && err.code === 'ENOENT'
        ? ServerMiddleware.notFound(`Template not found for sketch '${sketchName}'`)
        : ServerMiddleware.serverError('Failed to read template', err)
    )
    .flatMapOk((template) =>
      writeFile(sketchPaths.params, applyTemplateParams(template, params))
        .mapError((err) => ServerMiddleware.serverError('Failed to write parameters', err))
    );
}
