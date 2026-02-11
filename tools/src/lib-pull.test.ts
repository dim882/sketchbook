import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('fs-extra');
vi.mock('./lib/paths');

import fs from 'fs-extra';
import * as LibPaths from './lib/paths';

describe('lib-pull script', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.mocked(LibPaths.getLibDir).mockReturnValue('/project/lib');
    vi.mocked(LibPaths.getSketchesDir).mockReturnValue('/project/sketches');
  });

  describe('argument validation', () => {
    it('exits with error when no sketch name provided', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'lib-pull.ts'];

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      // Make process.exit throw to stop execution (simulates real behavior)
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
        throw new Error('process.exit called');
      });

      await expect(import('./lib-pull')).rejects.toThrow('process.exit called');

      expect(consoleSpy).toHaveBeenCalledWith('Please provide a sketch name');
      expect(exitSpy).toHaveBeenCalledWith(1);

      process.argv = originalArgv;
      consoleSpy.mockRestore();
      exitSpy.mockRestore();
    });
  });

  describe('copy operation', () => {
    it('copies lib to sketch directory with correct options', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'lib-pull.ts', 'my-sketch'];

      vi.mocked(fs.copy).mockResolvedValue(undefined);
      vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await import('./lib-pull');
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(fs.copy).toHaveBeenCalledWith(
        '/project/lib',
        '/project/sketches/my-sketch/lib',
        expect.objectContaining({
          overwrite: true,
          filter: expect.any(Function),
        })
      );

      process.argv = originalArgv;
      consoleSpy.mockRestore();
    });

    it('filters out package.json from copy', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'lib-pull.ts', 'my-sketch'];

      let capturedFilter: ((src: string) => boolean) | undefined;
      vi.mocked(fs.copy).mockImplementation((_src, _dest, options) => {
        capturedFilter = options?.filter as (src: string) => boolean;
        return Promise.resolve();
      });
      vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);

      await import('./lib-pull');
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(capturedFilter).toBeDefined();
      expect(capturedFilter!('/project/lib/package.json')).toBe(false);
      expect(capturedFilter!('/project/lib/utils.ts')).toBe(true);
      expect(capturedFilter!('/project/lib/nested/package.json')).toBe(false);

      process.argv = originalArgv;
    });

    it('logs success message on successful copy', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'lib-pull.ts', 'my-sketch'];

      vi.mocked(fs.copy).mockResolvedValue(undefined);
      vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await import('./lib-pull');
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(consoleSpy).toHaveBeenCalledWith('Copied lib to my-sketch');

      process.argv = originalArgv;
      consoleSpy.mockRestore();
    });

    it('logs error and exits on copy failure', async () => {
      const originalArgv = process.argv;
      process.argv = ['node', 'lib-pull.ts', 'my-sketch'];

      vi.mocked(fs.copy).mockRejectedValue(new Error('ENOENT: no such file'));
      const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await import('./lib-pull');
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error copying lib'),
        expect.stringContaining('ENOENT')
      );
      expect(exitSpy).toHaveBeenCalledWith(1);

      process.argv = originalArgv;
      consoleSpy.mockRestore();
    });
  });
});
