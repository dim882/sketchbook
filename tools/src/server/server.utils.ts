import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { Result, Future } from '@swan-io/boxed';
import type { Response } from 'express';

import * as Errors from './server.errors';

export const readFile = (filePath: string) => Future.fromPromise(fs.readFile(filePath, 'utf-8'));

export const writeFile = (filePath: string, content: string) =>
  Future.fromPromise(fs.writeFile(filePath, content, 'utf-8'));

export const readDir = (dirPath: string) =>
  Future.fromPromise(fs.readdir(dirPath, { withFileTypes: true }));

export const sendFile = (res: Response, filePath: string): Future<Result<void, Errors.ServerError>> =>
  Future.fromPromise(
    new Promise<void>((resolve, reject) => {
      res.sendFile(filePath, (err) => (err ? reject(err) : resolve()));
    })
  ).mapError((err: unknown) =>
    Errors.isErrnoException(err) && err.code === 'ENOENT'
      ? Errors.notFound(`File not found: ${path.basename(filePath)}`)
      : Errors.serverError('Failed to send file', err)
  );

export const sendResult =
  <T>(res: Response, onOk: (value: T) => void) =>
    (result: Result<T, Errors.ServerError>) =>
      result.match({
        Ok: onOk,
        Error: Errors.handleError(res),
      });
