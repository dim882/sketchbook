import { it, expect, vi } from 'vitest';

vi.mock('node:fs/promises');
vi.mock('fast-glob');

import { paths, getSketchDirsData } from './server.utils';
import fs from 'node:fs/promises';
import fg from 'fast-glob';

const sketchesPath = paths.sketches();

it('paths.sketch returns chained path object', () => {
  const sketch = paths.sketch('my-sketch');
  expect(sketch.base).toBe(`${sketchesPath}/my-sketch`);
  expect(sketch.dist).toBe(`${sketchesPath}/my-sketch/dist`);
  expect(sketch.src).toBe(`${sketchesPath}/my-sketch/src`);
  expect(sketch.html).toBe(`${sketchesPath}/my-sketch/dist/my-sketch.html`);
  expect(sketch.params).toBe(`${sketchesPath}/my-sketch/src/my-sketch.params.ts`);
  expect(sketch.template).toBe(`${sketchesPath}/my-sketch/src/my-sketch.params.tpl`);
  expect(sketch.serverHandler).toBe(`${sketchesPath}/my-sketch/src/my-sketch.server.js`);
});

it('getSketchDirsData returns sorted list of directories', async () => {
  vi.mocked(fs.readdir).mockResolvedValue([
    { name: 'sketch-b', isDirectory: () => true, isFile: () => false },
    { name: 'sketch-a', isDirectory: () => true, isFile: () => false },
  ] as unknown as Awaited<ReturnType<typeof fs.readdir>>);
  vi.mocked(fg).mockResolvedValue([]);

  const result = await getSketchDirsData('/path/to/sketches').toPromise();

  expect(result.isOk()).toBe(true);
  const dirs = (result as { value: unknown }).value as { name: string }[];
  expect(dirs).toHaveLength(2);
  expect(dirs[0].name).toBe('sketch-a');
  expect(dirs[1].name).toBe('sketch-b');
});

it('getSketchDirsData filters out non-directory entries', async () => {
  vi.mocked(fs.readdir).mockResolvedValue([
    { name: 'sketch', isDirectory: () => true, isFile: () => false },
    { name: 'file.txt', isDirectory: () => false, isFile: () => true },
  ] as unknown as Awaited<ReturnType<typeof fs.readdir>>);
  vi.mocked(fg).mockResolvedValue([]);

  const result = await getSketchDirsData('/path/to/sketches').toPromise();

  expect(result.isOk()).toBe(true);
  const dirs = (result as { value: unknown }).value as { name: string }[];
  expect(dirs).toHaveLength(1);
  expect(dirs[0].name).toBe('sketch');
});

it('getSketchDirsData returns lastModified of 0 when no ts/tsx/html files exist', async () => {
  vi.mocked(fs.readdir).mockResolvedValue([
    { name: 'empty-sketch', isDirectory: () => true, isFile: () => false },
  ] as unknown as Awaited<ReturnType<typeof fs.readdir>>);
  vi.mocked(fg).mockResolvedValue([]);

  const result = await getSketchDirsData('/path/to/sketches').toPromise();

  expect(result.isOk()).toBe(true);
  const dirs = (result as { value: unknown }).value as { lastModified: number }[];
  expect(dirs[0].lastModified).toBe(0);
});

it('getSketchDirsData returns latest mtime when ts/tsx/html files exist', async () => {
  vi.mocked(fs.readdir).mockResolvedValue([
    { name: 'sketch', isDirectory: () => true, isFile: () => false },
  ] as unknown as Awaited<ReturnType<typeof fs.readdir>>);
  vi.mocked(fg).mockResolvedValue(['/path/file1.ts', '/path/file2.ts']);
  vi.mocked(fs.stat)
    .mockResolvedValueOnce({ mtime: { getTime: () => 1000 } } as unknown as Awaited<ReturnType<typeof fs.stat>>)
    .mockResolvedValueOnce({ mtime: { getTime: () => 2000 } } as unknown as Awaited<ReturnType<typeof fs.stat>>);

  const result = await getSketchDirsData('/path/to/sketches').toPromise();

  expect(result.isOk()).toBe(true);
  const dirs = (result as { value: unknown }).value as { lastModified: number }[];
  expect(dirs[0].lastModified).toBe(2000);
});
