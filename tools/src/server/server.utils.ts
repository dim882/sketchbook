import * as fs from 'node:fs/promises';
import { Future } from '@swan-io/boxed';

export const readFile = (filePath: string) => Future.fromPromise(fs.readFile(filePath, 'utf-8'));

export const writeFile = (filePath: string, content: string) =>
  Future.fromPromise(fs.writeFile(filePath, content, 'utf-8'));

export const readDir = (dirPath: string) =>
  Future.fromPromise(fs.readdir(dirPath, { withFileTypes: true }));
