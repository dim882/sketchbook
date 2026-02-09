import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('node:fs/promises');
vi.mock('fast-glob');

import { paths, getSketchDirsData } from './server.utils';
import fs from 'node:fs/promises';
import fg from 'fast-glob';

describe('server.utils', () => {
  describe('paths', () => {
    it('public() returns path containing public', () => {
      expect(paths.public()).toContain('public');
    });

    it('uiIndex() returns path to index template', () => {
      expect(paths.uiIndex()).toContain('index.html.tpl');
    });

    it('sketches() returns path containing sketches', () => {
      expect(paths.sketches()).toContain('sketches');
    });

    it('sketch(name) returns path to specific sketch', () => {
      const result = paths.sketch('my-sketch');

      expect(result).toContain('sketches');
      expect(result).toContain('my-sketch');
    });

    it('dist(name) returns path to sketch dist directory', () => {
      const result = paths.dist('my-sketch');

      expect(result).toContain('my-sketch');
      expect(result).toContain('dist');
    });

    it('src(name) returns path to sketch src directory', () => {
      const result = paths.src('my-sketch');

      expect(result).toContain('my-sketch');
      expect(result).toContain('src');
    });

    it('html(name) returns path to sketch HTML file', () => {
      const result = paths.html('my-sketch');

      expect(result).toContain('dist');
      expect(result).toContain('my-sketch.html');
    });

    it('params(name) returns path to sketch params file', () => {
      const result = paths.params('my-sketch');

      expect(result).toContain('src');
      expect(result).toContain('my-sketch.params.ts');
    });

    it('template(name) returns path to sketch template file', () => {
      const result = paths.template('my-sketch');

      expect(result).toContain('src');
      expect(result).toContain('my-sketch.params.tpl');
    });

    it('serverHandler(name) returns path to server handler', () => {
      const result = paths.serverHandler('my-sketch');

      expect(result).toContain('src');
      expect(result).toContain('my-sketch.server.js');
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
