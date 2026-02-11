import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { Result, Future } from '@swan-io/boxed';
import type { Request, Response, NextFunction } from 'express';

import { IDir } from '../ui/SketchList';
import { SketchServerHandler, SketchParams } from '../server.sketch.types';
import { escapeRegex } from './string';

export function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err;
}

function isValidServerHandler(module: unknown): module is { default: SketchServerHandler } {
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

const readFile = (filePath: string) => Future.fromPromise(fs.readFile(filePath, 'utf-8'));

const writeFile = (filePath: string, content: string) =>
  Future.fromPromise(fs.writeFile(filePath, content, 'utf-8'));

const readDir = (dirPath: string) =>
  Future.fromPromise(fs.readdir(dirPath, { withFileTypes: true }));

export interface ServerError {
  status: number;
  message: string;
  cause?: Error;
}

export const notFound = (message: string): ServerError => ({ status: 404, message });

export const badRequest = (message: string): ServerError => ({ status: 400, message });

const serverError = (message: string, cause?: unknown): ServerError => ({
  status: 500,
  message,
  cause: cause instanceof Error ? cause : undefined,
});

// Wraps res.sendFile in a Future at the I/O boundary
export const sendFile = (res: Response, filePath: string): Future<Result<void, ServerError>> =>
  Future.fromPromise(
    new Promise<void>((resolve, reject) => {
      res.sendFile(filePath, (err) => (err ? reject(err) : resolve()));
    })
  ).mapError((err: unknown) =>
    isErrnoException(err) && err.code === 'ENOENT'
      ? notFound(`File not found: ${path.basename(filePath)}`)
      : serverError('Failed to send file', err)
  );

// Pure validation for params body
export function validateParamsBody(body: unknown): Result<Record<string, string>, ServerError> {
  if (!body || typeof body !== 'object') {
    return Result.Error(badRequest('Invalid request body: expected object'));
  }

  const { params } = body as { params?: unknown };

  if (!params || typeof params !== 'object') {
    return Result.Error(badRequest('Invalid parameters: expected object'));
  }

  return Result.Ok(params as Record<string, string>);
}

export const handleError = (res: Response) => (err: ServerError) => {
  if (err.cause) {
    console.error(`${err.message}:`, err.cause);
  }

  res.status(err.status).json({ error: err.message });
};

interface IInitialData {
  dirs: IDir[];
  initialSketch?: string;
}

const injectInitialData = (template: string, data: IInitialData) =>
  template.replace('${initialData}', JSON.stringify(data));

const applyTemplateParams = (template: string, params: Record<string, string>) =>
  Object.entries(params).reduce(
    (tpl, [key, value]) => tpl.replace(new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, 'g'), value),
    template
  );

const sketchesPath = path.join(__dirname, '../../../sketches');

export interface SketchPaths {
  base: string;
  dist: string;
  src: string;
  html: string;
  params: string;
  template: string;
  serverHandler: string;
}

function createSketchPaths(name: string): SketchPaths {
  const base = path.join(sketchesPath, name);
  const dist = path.join(base, 'dist');
  const src = path.join(base, 'src');

  return {
    base,
    dist,
    src,
    html: path.join(dist, `${name}.html`),
    params: path.join(src, `${name}.params.ts`),
    template: path.join(src, `${name}.params.tpl`),
    serverHandler: path.join(src, `${name}.server.js`),
  };
}

// Path utilities
export const paths = {
  public: () => path.join(__dirname, '../../public'),
  uiIndex: () => path.join(__dirname, '../ui/index.html.tpl'),
  sketches: () => sketchesPath,
  sketch: (name: string) => createSketchPaths(name),
};

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

export function getSketchDirsData(sketchesDir: string): Future<Result<IDir[], ServerError>> {
  return readDir(sketchesDir)
    .mapError((err) => serverError(`Failed to read sketches directory`, err))
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

export function fetchSketchParams(sketchName: string): Future<Result<SketchParams, ServerError>> {
  const sketchPaths = paths.sketch(sketchName);

  console.log(`[fetchSketchParams] Loading params for sketch: ${sketchName}`);

  return readFile(sketchPaths.params)
    .tapOk(() => console.log(`[fetchSketchParams] Read params file: ${sketchPaths.params}`))
    .tapError((err) => console.log(`[fetchSketchParams] Failed to read params file:`, err))
    .mapError((err: unknown) =>
      isErrnoException(err) && err.code === 'ENOENT'
        ? notFound(`Parameters not found for sketch '${sketchName}'`)
        : serverError('Failed to read parameters', err)
    )
    .flatMapOk((fileContent) =>
      Future.fromPromise(import(sketchPaths.serverHandler))
        .tapOk((module) =>
          console.log(`[fetchSketchParams] Loaded server handler, has default export: ${'default' in module}`)
        )
        .tapError((err) => console.log(`[fetchSketchParams] Failed to load server handler:`, err))
        .mapError((err: unknown) =>
          isErrnoException(err) && err.code === 'MODULE_NOT_FOUND'
            ? notFound(`Server handler not found for sketch '${sketchName}'`)
            : serverError('Failed to load server handler', err)
        )
        .mapOkToResult((module) =>
          !isValidServerHandler(module)
            ? Result.Error(
              serverError(
                `Server handler for sketch '${sketchName}' is invalid: must export default object with getParams function`
              )
            )
            : Result.fromExecution(() => module.default.getParams(fileContent))
              .mapError((err) =>
                serverError(`Failed to parse params for sketch '${sketchName}'`, err))
        )
    );
}

// Validates a sketch name to prevent path traversal attacks.
export function validateSketchName(name: unknown): Result<string, string> {
  if (!name || typeof name !== 'string') {
    return Result.Error('Sketch name is required');
  }

  // Check for path traversal attempts
  if (name.includes('/') || name.includes('\\') || name.includes('..')) {
    return Result.Error('Invalid sketch name: path traversal not allowed');
  }

  // Only allow alphanumeric, hyphen, underscore, and dot
  if (!/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/.test(name)) {
    return Result.Error('Invalid sketch name: only alphanumeric, hyphen, underscore allowed');
  }

  return Result.Ok(name);
}


// Middleware to validate sketch name parameter
export function requireValidSketchName(req: Request, res: Response, next: NextFunction) {
  validateSketchName(req.params.sketchName).match({
    Ok: (validName) => {
      req.params.sketchName = validName;
      next();
    },
    Error: (message) => {
      res.status(400).json({ error: message });
    },
  });
}

export function renderMainPage(initialSketch?: string): Future<Result<string, ServerError>> {
  return readFile(paths.uiIndex())
    .mapError((err) => serverError('Failed to read UI template', err))
    .flatMapOk((template) =>
      getSketchDirsData(paths.sketches())
        .mapOk((dirs) => injectInitialData(template, { dirs, initialSketch }))
    );
}

// Update parameters for a sketch by applying values to a template.
export function updateSketchParams(
  sketchName: string,
  params: Record<string, string>
): Future<Result<void, ServerError>> {
  const sketchPaths = paths.sketch(sketchName);

  return readFile(sketchPaths.template)
    .mapError((err: unknown) =>
      isErrnoException(err) && err.code === 'ENOENT'
        ? notFound(`Template not found for sketch '${sketchName}'`)
        : serverError('Failed to read template', err)
    )
    .flatMapOk((template) =>
      writeFile(sketchPaths.params, applyTemplateParams(template, params))
        .mapError((err) => serverError('Failed to write parameters', err))
    );
}
