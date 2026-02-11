import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { Result, Future } from '@swan-io/boxed';
import type { Request, Response, NextFunction } from 'express';
import { SketchServerHandler, SketchParams } from '../server.sketch.types';
import { IDir } from '../ui/SketchList';
import { escapeRegex } from './string';

export function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err;
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

const notFound = (message: string): ServerError => ({ status: 404, message });

const badRequest = (message: string): ServerError => ({ status: 400, message });

const serverError = (message: string, cause?: unknown): ServerError => ({
  status: 500,
  message,
  cause: cause instanceof Error ? cause : undefined,
});

export const handleError = (res: Response) => (err: ServerError) => {
  if (err.cause) {
    console.error(`${err.message}:`, err.cause);
  }

  res.status(err.status).json({ error: err.message });
};

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

function getLastModifiedTime(dirPath: string): Future<Result<number, ServerError>> {
  return Future.fromPromise(
    fg(['**/*.{ts,tsx,html}'], {
      cwd: dirPath,
      absolute: true,
      ignore: ['node_modules/**'],
      dot: false,
    })
  ).mapError((err) => serverError(`Failed to glob files in ${dirPath}`, err))
    .flatMapOk((tsFiles) => {
      if (tsFiles.length === 0) {
        return Future.value(Result.Ok(0));
      }

      return Future.fromPromise(Promise.all(tsFiles.map((file) => fs.stat(file))))
        .mapError((err) => serverError('Failed to stat files', err))
        .mapOk((tsStats) => Math.max(...tsStats.map((stat) => stat.mtime.getTime())));
    });
}

export function getSketchDirsData(sketchesDir: string): Future<Result<IDir[], ServerError>> {
  return readDir(sketchesDir)
    .mapError((err) => serverError(`Failed to read sketches directory`, err))
    .flatMapOk((files) => {
      const futures = files
        .filter((file) => file.isDirectory())
        .map((dir) =>
          getLastModifiedTime(path.join(sketchesDir, dir.name))
            .mapOk((lastModified) => ({
              name: dir.name,
              lastModified,
            }))
        );

      return Future.all(futures).map(Result.all);
    })
    .mapOk((dirs) => dirs.sort((a, b) => a.name.localeCompare(b.name)));
}

export function fetchSketchParams(sketchName: string): Future<Result<SketchParams, ServerError>> {
  const sketchPaths = paths.sketch(sketchName);

  return readFile(sketchPaths.params)
    .mapError((err: unknown) =>
      isErrnoException(err) && err.code === 'ENOENT'
        ? notFound(`Parameters not found for sketch '${sketchName}'`)
        : serverError('Failed to read parameters', err)
    )
    .flatMapOk((fileContent) =>
      Future.fromPromise(import(sketchPaths.serverHandler) as Promise<{ default: SketchServerHandler }>)
        .mapError((err: unknown) =>
          isErrnoException(err) && err.code === 'MODULE_NOT_FOUND'
            ? notFound(`Server handler not found for sketch '${sketchName}'`)
            : serverError('Failed to load server handler', err)
        )
        .mapOk((module) => module.default.getParams(fileContent))
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
    .mapError((err) =>
      serverError('Failed to read UI template', err)
    )
    .flatMapOk((htmlTemplate) =>
      getSketchDirsData(paths.sketches()).mapOk((dirs) =>
        htmlTemplate.replace('${initialData}', JSON.stringify({ dirs, initialSketch, })))
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
      writeFile(
        sketchPaths.params,
        Object.entries(params).reduce(
          (tpl, [key, value]) =>
            tpl.replace(new RegExp(`\\{\\{${escapeRegex(key)}\\}\\}`, 'g'), value),
          template
        )
      ).mapError((err) =>
        serverError('Failed to write parameters', err)
      )
    );
}
