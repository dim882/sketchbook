import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:fs/promises');
vi.mock('fast-glob');

import { paths, getSketchDirsData } from './server.utils';
import fs from 'node:fs/promises';
import fg from 'fast-glob';

describe('server.utils', () => {
  describe('paths', () => {
    const sketchesPath = paths.sketches();

    it('sketch(name) returns sketches/name', () => {
      expect(paths.sketch('my-sketch')).toBe(`${sketchesPath}/my-sketch`);
    });

    it('dist(name) returns sketches/name/dist', () => {
      expect(paths.dist('my-sketch')).toBe(`${sketchesPath}/my-sketch/dist`);
    });

    it('src(name) returns sketches/name/src', () => {
      expect(paths.src('my-sketch')).toBe(`${sketchesPath}/my-sketch/src`);
    });

    it('html(name) returns sketches/name/dist/name.html', () => {
      expect(paths.html('my-sketch')).toBe(`${sketchesPath}/my-sketch/dist/my-sketch.html`);
    });

    it('params(name) returns sketches/name/src/name.params.ts', () => {
      expect(paths.params('my-sketch')).toBe(`${sketchesPath}/my-sketch/src/my-sketch.params.ts`);
    });

    it('template(name) returns sketches/name/src/name.params.tpl', () => {
      expect(paths.template('my-sketch')).toBe(`${sketchesPath}/my-sketch/src/my-sketch.params.tpl`);
    });

    it('serverHandler(name) returns sketches/name/src/name.server.js', () => {
      expect(paths.serverHandler('my-sketch')).toBe(`${sketchesPath}/my-sketch/src/my-sketch.server.js`);
    });
  });

  describe('getSketchDirsData', () => {
    beforeEach(() => {
      vi.mocked(fs.readdir).mockReset();
      vi.mocked(fg).mockReset();
      vi.mocked(fs.stat).mockReset();
    });

    it('returns sorted list of directories', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'sketch-b', isDirectory: () => true, isFile: () => false },
        { name: 'sketch-a', isDirectory: () => true, isFile: () => false },
      ] as unknown as Awaited<ReturnType<typeof fs.readdir>>);

      vi.mocked(fg).mockResolvedValue([]);

      const result = await getSketchDirsData('/path/to/sketches');

      expect(result).toHaveLength(2);
      expect(result[0].name).toBe('sketch-a');
      expect(result[1].name).toBe('sketch-b');
    });

    it('filters out non-directory entries', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'sketch', isDirectory: () => true, isFile: () => false },
        { name: 'file.txt', isDirectory: () => false, isFile: () => true },
      ] as unknown as Awaited<ReturnType<typeof fs.readdir>>);

      vi.mocked(fg).mockResolvedValue([]);

      const result = await getSketchDirsData('/path/to/sketches');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('sketch');
    });

    it('returns lastModified of 0 when no ts/tsx/html files exist', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'empty-sketch', isDirectory: () => true, isFile: () => false },
      ] as unknown as Awaited<ReturnType<typeof fs.readdir>>);

      vi.mocked(fg).mockResolvedValue([]);

      const result = await getSketchDirsData('/path/to/sketches');

      expect(result[0].lastModified).toBe(0);
    });

    it('returns latest mtime when ts/tsx/html files exist', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([
        { name: 'sketch', isDirectory: () => true, isFile: () => false },
      ] as unknown as Awaited<ReturnType<typeof fs.readdir>>);

      vi.mocked(fg).mockResolvedValue(['/path/file1.ts', '/path/file2.ts']);

      vi.mocked(fs.stat)
        .mockResolvedValueOnce({ mtime: { getTime: () => 1000 } } as unknown as Awaited<ReturnType<typeof fs.stat>>)
        .mockResolvedValueOnce({ mtime: { getTime: () => 2000 } } as unknown as Awaited<ReturnType<typeof fs.stat>>);

      const result = await getSketchDirsData('/path/to/sketches');

      expect(result[0].lastModified).toBe(2000);
    });
  });
});
