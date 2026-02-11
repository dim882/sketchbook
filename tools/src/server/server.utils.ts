import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { Result, Future } from '@swan-io/boxed';
import type { Response } from 'express';

import * as ServerErrors from './server.errors';

export const readFile = (filePath: string) => Future.fromPromise(fs.readFile(filePath, 'utf-8'));

export const writeFile = (filePath: string, content: string) =>
  Future.fromPromise(fs.writeFile(filePath, content, 'utf-8'));

export const readDir = (dirPath: string) =>
  Future.fromPromise(fs.readdir(dirPath, { withFileTypes: true }));

// Wraps res.sendFile in a Future at the I/O boundary
export const sendFile = (res: Response, filePath: string): Future<Result<void, ServerErrors.ServerError>> =>
  Future.fromPromise(
    new Promise<void>((resolve, reject) => {
      res.sendFile(filePath, (err) => (err ? reject(err) : resolve()));
    })
  ).mapError((err: unknown) =>
    ServerErrors.isErrnoException(err) && err.code === 'ENOENT'
      ? ServerErrors.notFound(`File not found: ${path.basename(filePath)}`)
      : ServerErrors.serverError('Failed to send file', err)
  );

// Helper to handle Result responses, reducing .tap(result.match({Ok, Error})) boilerplate
export const sendResult =
  <T>(res: Response, onOk: (value: T) => void) =>
    (result: Result<T, ServerErrors.ServerError>) =>
      result.match({
        Ok: onOk,
        Error: ServerErrors.handleError(res),
      });