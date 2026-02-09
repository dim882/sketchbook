import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';

vi.mock('fs');
vi.mock('child_process');

import * as utils from './sketch.clone.utils';
import fs from 'fs';
import { execSync } from 'child_process';

describe('sketch.clone.utils', () => {
  describe('getArgs', () => {
    let originalArgv: string[];

    beforeEach(() => {
      originalArgv = process.argv;
    });

    afterEach(() => {
      process.argv = originalArgv;
    });

    it('returns sourceName and targetName when both provided', () => {
      process.argv = ['node', 'script.ts', 'source-sketch', 'target-sketch'];

      const result = utils.getArgs();

      expect(result).toEqual({
        sourceName: 'source-sketch',
        targetName: 'target-sketch',
      });
    });

    it('exits with code 1 when sourceName missing', () => {
      process.argv = ['node', 'script.ts'];

      utils.getArgs();

      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('exits with code 1 when targetName missing', () => {
      process.argv = ['node', 'script.ts', 'source-only'];

      utils.getArgs();

      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('getDirectoryNames', () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReset();
      vi.mocked(fs.statSync).mockReset();
    });

    it('returns sourceDir and targetDir when source exists and target does not', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        const pathStr = p.toString();
        return pathStr.includes('existing-source');
      });
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats);

      const result = utils.getDirectoryNames('existing-source', 'new-target');

      expect(result.sourceDir).toContain('existing-source');
      expect(result.targetDir).toContain('new-target');
    });

    it('exits when source directory does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      utils.getDirectoryNames('nonexistent', 'target');

      expect(process.exit).toHaveBeenCalledWith(1);
    });

    it('exits when target directory already exists', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats);

      utils.getDirectoryNames('source', 'existing-target');

      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  describe('createTargetPath', () => {
    it('renames file when it starts with sourceName', () => {
      const result = utils.createTargetPath(
        'my-sketch.ts',
        '/target/dir',
        'my-sketch',
        'new-sketch'
      );

      expect(result).toBe(path.join('/target/dir', 'new-sketch.ts'));
    });

    it('preserves filename when it does not start with sourceName', () => {
      const result = utils.createTargetPath(
        'utils.ts',
        '/target/dir',
        'my-sketch',
        'new-sketch'
      );

      expect(result).toBe(path.join('/target/dir', 'utils.ts'));
    });

    it('handles complex source name prefixes', () => {
      const result = utils.createTargetPath(
        'my-sketch.utils.ts',
        '/target/dir',
        'my-sketch',
        'new-sketch'
      );

      expect(result).toBe(path.join('/target/dir', 'new-sketch.utils.ts'));
    });

    it('handles files with no extension', () => {
      const result = utils.createTargetPath(
        'my-sketch',
        '/target/dir',
        'my-sketch',
        'new-sketch'
      );

      expect(result).toBe(path.join('/target/dir', 'new-sketch'));
    });
  });

  describe('isTextFile', () => {
    it.each([
      ['.ts', true],
      ['.js', true],
      ['.html', true],
      ['.css', true],
      ['.md', true],
      ['.json', true],
      ['.config.js', true],
      ['.png', false],
      ['.jpg', false],
      ['.woff', false],
    ])('returns correct value for extension %s', (ext, expected) => {
      expect(utils.isTextFile(`file${ext}`)).toBe(expected);
    });

    it('returns false for files with no extension', () => {
      expect(utils.isTextFile('file')).toBe(false);
    });
  });

  describe('replaceContentInFile', () => {
    beforeEach(() => {
      vi.mocked(fs.readFileSync).mockReset();
      vi.mocked(fs.writeFileSync).mockReset();
    });

    it('replaces all occurrences of searchValue with replaceValue', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        'import { foo } from "old-name";\nconst x = "old-name";'
      );

      utils.replaceContentInFile('/path/file.ts', 'old-name', 'new-name');

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/path/file.ts',
        'import { foo } from "new-name";\nconst x = "new-name";',
        'utf8'
      );
    });

    it('does not write file when no changes made', () => {
      vi.mocked(fs.readFileSync).mockReturnValue('no matches here');

      utils.replaceContentInFile('/path/file.ts', 'old-name', 'new-name');

      expect(fs.writeFileSync).not.toHaveBeenCalled();
    });

    it('handles errors gracefully', () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('ENOENT');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      utils.replaceContentInFile('/path/file.ts', 'old', 'new');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('setPackageName', () => {
    beforeEach(() => {
      vi.mocked(fs.readFileSync).mockReset();
      vi.mocked(fs.writeFileSync).mockReset();
    });

    it('updates the name field in package.json', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        JSON.stringify({ name: 'old-name', version: '1.0.0' })
      );

      utils.setPackageName('/path/package.json', 'new-name');

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      const written = JSON.parse(writeCall[1] as string);

      expect(written.name).toBe('new-name');
      expect(written.version).toBe('1.0.0');
    });

    it('preserves formatting with 2-space indent', () => {
      vi.mocked(fs.readFileSync).mockReturnValue('{"name":"old"}');

      utils.setPackageName('/path/package.json', 'new');

      const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
      expect(writeCall[1]).toContain('\n');
    });

    it('handles errors gracefully', () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('ENOENT');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      utils.setPackageName('/path/package.json', 'new');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('replaceHtmlTitle', () => {
    beforeEach(() => {
      vi.mocked(fs.readFileSync).mockReset();
      vi.mocked(fs.writeFileSync).mockReset();
    });

    it('replaces title tag content', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        '<html><head><title>Old Title</title></head></html>'
      );

      utils.replaceHtmlTitle('/path/file.html', 'New Title');

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/path/file.html',
        '<html><head><title>New Title</title></head></html>',
        'utf8'
      );
    });

    it('handles case-insensitive title tags', () => {
      vi.mocked(fs.readFileSync).mockReturnValue(
        '<html><head><TITLE>Old</TITLE></head></html>'
      );

      utils.replaceHtmlTitle('/path/file.html', 'New');

      expect(fs.writeFileSync).toHaveBeenCalledWith(
        '/path/file.html',
        '<html><head><title>New</title></head></html>',
        'utf8'
      );
    });

    it('handles errors gracefully', () => {
      vi.mocked(fs.readFileSync).mockImplementation(() => {
        throw new Error('ENOENT');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      utils.replaceHtmlTitle('/path/file.html', 'New');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('install', () => {
    beforeEach(() => {
      vi.mocked(execSync).mockReset();
    });

    it('runs pnpm install in target directory', () => {
      utils.install('/path/to/target');

      expect(execSync).toHaveBeenCalledWith('pnpm install', {
        cwd: '/path/to/target',
        stdio: 'inherit',
      });
    });

    it('handles errors gracefully', () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('command failed');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      utils.install('/path/to/target');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
