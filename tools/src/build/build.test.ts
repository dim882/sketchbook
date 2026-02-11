import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Result } from '@swan-io/boxed';

vi.mock('fs');
vi.mock('../lib/paths');
vi.mock('../lib/build');

import * as fs from 'fs';
import * as LibPaths from '../lib/paths';
import * as LibBuild from '../lib/build';

describe('build script', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.mocked(LibPaths.getSketchesDir).mockReturnValue('/sketches');
    vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
  });

  describe('getAllSketchDirectories', () => {
    it('returns empty array when directory does not exist', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      vi.mocked(LibBuild.buildSketch).mockReturnValue(Result.Ok(undefined));

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await import('./build');

      expect(consoleSpy).toHaveBeenCalledWith('Found 0 sketches to build');
      consoleSpy.mockRestore();
    });

    it('filters out excluded directories (.git, node_modules)', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'sketch1', isDirectory: () => true },
        { name: '.git', isDirectory: () => true },
        { name: 'node_modules', isDirectory: () => true },
        { name: 'sketch2', isDirectory: () => true },
      ] as unknown as fs.Dirent[]);
      vi.mocked(LibBuild.buildSketch).mockReturnValue(Result.Ok(undefined));

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await import('./build');

      expect(consoleSpy).toHaveBeenCalledWith('Found 2 sketches to build');
      expect(LibBuild.buildSketch).toHaveBeenCalledTimes(2);
      consoleSpy.mockRestore();
    });

    it('filters out files (only includes directories)', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'sketch1', isDirectory: () => true },
        { name: 'README.md', isDirectory: () => false },
      ] as unknown as fs.Dirent[]);
      vi.mocked(LibBuild.buildSketch).mockReturnValue(Result.Ok(undefined));

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await import('./build');

      expect(consoleSpy).toHaveBeenCalledWith('Found 1 sketches to build');
      consoleSpy.mockRestore();
    });
  });

  describe('buildAllSketches', () => {
    it('logs success when all builds succeed', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'sketch1', isDirectory: () => true },
      ] as unknown as fs.Dirent[]);
      vi.mocked(LibBuild.buildSketch).mockReturnValue(Result.Ok(undefined));

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      await import('./build');

      expect(consoleSpy).toHaveBeenCalledWith('All sketches built successfully');
      expect(process.exit).not.toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('exits with code 1 when any build fails', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'sketch1', isDirectory: () => true },
        { name: 'sketch2', isDirectory: () => true },
      ] as unknown as fs.Dirent[]);
      vi.mocked(LibBuild.buildSketch)
        .mockReturnValueOnce(Result.Ok(undefined))
        .mockReturnValueOnce(Result.Error(new Error('build failed')));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await import('./build');

      expect(consoleSpy).toHaveBeenCalledWith('1 sketch(es) failed to build');
      expect(process.exit).toHaveBeenCalledWith(1);
      consoleSpy.mockRestore();
    });

    it('reports correct failure count when multiple builds fail', async () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockReturnValue([
        { name: 'sketch1', isDirectory: () => true },
        { name: 'sketch2', isDirectory: () => true },
        { name: 'sketch3', isDirectory: () => true },
      ] as unknown as fs.Dirent[]);
      vi.mocked(LibBuild.buildSketch)
        .mockReturnValueOnce(Result.Error(new Error('fail1')))
        .mockReturnValueOnce(Result.Ok(undefined))
        .mockReturnValueOnce(Result.Error(new Error('fail2')));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      await import('./build');

      expect(consoleSpy).toHaveBeenCalledWith('2 sketch(es) failed to build');
      expect(process.exit).toHaveBeenCalledWith(1);
      consoleSpy.mockRestore();
    });
  });
});
