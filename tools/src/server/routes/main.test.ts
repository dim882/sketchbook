import { it, expect, vi } from 'vitest';

vi.mock('node:fs/promises');
vi.mock('fast-glob');

import fs from 'node:fs/promises';
import fg from 'fast-glob';

import * as Main from './main';
import type { IDir } from '../../lib/types';

it('getSketchDirsData returns sorted list of sketches by path', async () => {
  vi.mocked(fg).mockImplementation(((pattern: string) => {
    if (pattern === '**/package.json') {
      return Promise.resolve(['sketch-b/package.json', 'sketch-a/package.json']);
    }
    return Promise.resolve([]);
  }) as typeof fg);

  const result = await Main.getSketchDirsData('/path/to/sketches').toPromise();

  expect(result.isOk()).toBe(true);
  const dirs = (result as { value: unknown }).value as IDir[];
  expect(dirs).toHaveLength(2);
  expect(dirs[0].path).toBe('sketch-a');
  expect(dirs[1].path).toBe('sketch-b');
  expect(dirs[0].name).toBe('sketch-a');
  expect(dirs[0].isSketch).toBe(true);
});

it('getSketchDirsData discovers nested sketches', async () => {
  vi.mocked(fg).mockImplementation(((pattern: string) => {
    if (pattern === '**/package.json') {
      return Promise.resolve(['flat/package.json', 'experiments/nested/package.json']);
    }
    return Promise.resolve([]);
  }) as typeof fg);

  const result = await Main.getSketchDirsData('/path/to/sketches').toPromise();

  expect(result.isOk()).toBe(true);
  const dirs = (result as { value: unknown }).value as IDir[];
  expect(dirs).toHaveLength(2);
  expect(dirs[0].path).toBe('experiments/nested');
  expect(dirs[0].name).toBe('nested');
  expect(dirs[1].path).toBe('flat');
  expect(dirs[1].name).toBe('flat');
});

it('getSketchDirsData returns lastModified of 0 when no ts/tsx/html files exist', async () => {
  vi.mocked(fg).mockImplementation(((pattern: string) => {
    if (pattern === '**/package.json') {
      return Promise.resolve(['empty-sketch/package.json']);
    }
    return Promise.resolve([]);
  }) as typeof fg);

  const result = await Main.getSketchDirsData('/path/to/sketches').toPromise();

  expect(result.isOk()).toBe(true);
  const dirs = (result as { value: unknown }).value as IDir[];
  expect(dirs[0].lastModified).toBe(0);
});

it('getSketchDirsData returns latest mtime when ts/tsx/html files exist', async () => {
  vi.mocked(fg).mockImplementation(((pattern: string) => {
    if (pattern === '**/package.json') {
      return Promise.resolve(['sketch/package.json']);
    }
    return Promise.resolve(['/path/file1.ts', '/path/file2.ts']);
  }) as typeof fg);
  vi.mocked(fs.stat)
    .mockResolvedValueOnce({ mtime: { getTime: () => 1000 } } as unknown as Awaited<ReturnType<typeof fs.stat>>)
    .mockResolvedValueOnce({ mtime: { getTime: () => 2000 } } as unknown as Awaited<ReturnType<typeof fs.stat>>);

  const result = await Main.getSketchDirsData('/path/to/sketches').toPromise();

  expect(result.isOk()).toBe(true);
  const dirs = (result as { value: unknown }).value as IDir[];
  expect(dirs[0].lastModified).toBe(2000);
});
