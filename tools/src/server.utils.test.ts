import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

vi.mock('node:fs/promises');
vi.mock('fast-glob');

import { paths, getSketchDirsData } from './server.utils';
import fs from 'node:fs/promises';
import fg from 'fast-glob';

describe('server.utils', () => {
  describe('paths', () => {
    it('public() ends with tools/public', () => {
      expect(paths.public()).toMatch(/tools\/public$/);
    });

    it('uiIndex() ends with src/ui/index.html.tpl', () => {
      expect(paths.uiIndex()).toMatch(/src\/ui\/index\.html\.tpl$/);
    });

    it('sketches() ends with /sketches', () => {
      expect(paths.sketches()).toMatch(/\/sketches$/);
    });

    it('sketch(name) is sketches() + sketchName', () => {
      expect(paths.sketch('my-sketch')).toBe(path.join(paths.sketches(), 'my-sketch'));
    });

    it('dist(name) is sketch(name) + dist', () => {
      expect(paths.dist('my-sketch')).toBe(path.join(paths.sketch('my-sketch'), 'dist'));
    });

    it('src(name) is sketch(name) + src', () => {
      expect(paths.src('my-sketch')).toBe(path.join(paths.sketch('my-sketch'), 'src'));
    });

    it('html(name) is dist(name) + sketchName.html', () => {
      expect(paths.html('my-sketch')).toBe(path.join(paths.dist('my-sketch'), 'my-sketch.html'));
    });

    it('params(name) is src(name) + sketchName.params.ts', () => {
      expect(paths.params('my-sketch')).toBe(path.join(paths.src('my-sketch'), 'my-sketch.params.ts'));
    });

    it('template(name) is src(name) + sketchName.params.tpl', () => {
      expect(paths.template('my-sketch')).toBe(path.join(paths.src('my-sketch'), 'my-sketch.params.tpl'));
    });

    it('serverHandler(name) is src(name) + sketchName.server.js', () => {
      expect(paths.serverHandler('my-sketch')).toBe(path.join(paths.src('my-sketch'), 'my-sketch.server.js'));
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
