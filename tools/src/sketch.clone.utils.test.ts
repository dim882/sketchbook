import { it, expect, vi } from 'vitest';
import path from 'path';

vi.mock('fs');
vi.mock('child_process');

import * as utils from './sketch.clone.utils';
import fs from 'fs';
import { execSync } from 'child_process';

function withArgv(args: string[], fn: () => void) {
  const original = process.argv;
  process.argv = ['node', 'script.ts', ...args];

  try {
    fn();
  } finally {
    process.argv = original;
  }
}

it('getArgs returns sourceName and targetName when both provided', () => {
  withArgv(['source-sketch', 'target-sketch'], () => {
    const result = utils.getArgs();

    expect(result).toEqual({
      sourceName: 'source-sketch',
      targetName: 'target-sketch',
    });
  });
});

it('getArgs exits with code 1 when sourceName missing', () => {
  withArgv([], () => {
    utils.getArgs();

    expect(process.exit).toHaveBeenCalledWith(1);
  });
});

it('getArgs exits with code 1 when targetName missing', () => {
  withArgv(['source-only'], () => {
    utils.getArgs();

    expect(process.exit).toHaveBeenCalledWith(1);
  });
});

it('getDirectoryNames returns sourceDir and targetDir when source exists and target does not', () => {
  vi.mocked(fs.existsSync).mockImplementation((p) => p.toString().includes('existing-source'));
  vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats);

  const result = utils.getDirectoryNames('existing-source', 'new-target');

  expect(result.sourceDir).toContain('existing-source');
  expect(result.targetDir).toContain('new-target');
});

it('getDirectoryNames exits when source directory does not exist', () => {
  vi.mocked(fs.existsSync).mockReturnValue(false);

  utils.getDirectoryNames('nonexistent', 'target');

  expect(process.exit).toHaveBeenCalledWith(1);
});

it('getDirectoryNames exits when target directory already exists', () => {
  vi.mocked(fs.existsSync).mockReturnValue(true);
  vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats);

  utils.getDirectoryNames('source', 'existing-target');

  expect(process.exit).toHaveBeenCalledWith(1);
});

it('createTargetPath renames file when it starts with sourceName', () => {
  const result = utils.createTargetPath('my-sketch.ts', '/target/dir', 'my-sketch', 'new-sketch');

  expect(result).toBe(path.join('/target/dir', 'new-sketch.ts'));
});

it('createTargetPath preserves filename when it does not start with sourceName', () => {
  const result = utils.createTargetPath('utils.ts', '/target/dir', 'my-sketch', 'new-sketch');

  expect(result).toBe(path.join('/target/dir', 'utils.ts'));
});

it('createTargetPath handles complex source name prefixes', () => {
  const result = utils.createTargetPath('my-sketch.utils.ts', '/target/dir', 'my-sketch', 'new-sketch');

  expect(result).toBe(path.join('/target/dir', 'new-sketch.utils.ts'));
});

it('createTargetPath handles files with no extension', () => {
  const result = utils.createTargetPath('my-sketch', '/target/dir', 'my-sketch', 'new-sketch');

  expect(result).toBe(path.join('/target/dir', 'new-sketch'));
});

it('isTextFile returns true for .ts files', () => {
  expect(utils.isTextFile('file.ts')).toBe(true);
});

it('isTextFile returns true for .js files', () => {
  expect(utils.isTextFile('file.js')).toBe(true);
});

it('isTextFile returns true for .html files', () => {
  expect(utils.isTextFile('file.html')).toBe(true);
});

it('isTextFile returns true for .css files', () => {
  expect(utils.isTextFile('file.css')).toBe(true);
});

it('isTextFile returns true for .md files', () => {
  expect(utils.isTextFile('file.md')).toBe(true);
});

it('isTextFile returns true for .json files', () => {
  expect(utils.isTextFile('file.json')).toBe(true);
});

it('isTextFile returns false for .png files', () => {
  expect(utils.isTextFile('file.png')).toBe(false);
});

it('isTextFile returns false for files with no extension', () => {
  expect(utils.isTextFile('file')).toBe(false);
});

it('replaceContentInFile replaces all occurrences', () => {
  vi.mocked(fs.readFileSync).mockReturnValue('import "old-name";\nconst x = "old-name";');
  vi.mocked(fs.writeFileSync).mockImplementation(() => {});

  utils.replaceContentInFile('/path/file.ts', 'old-name', 'new-name');

  expect(fs.writeFileSync).toHaveBeenCalledWith(
    '/path/file.ts',
    'import "new-name";\nconst x = "new-name";',
    'utf8'
  );
});

it('replaceContentInFile does not write when no changes made', () => {
  vi.mocked(fs.readFileSync).mockReturnValue('no matches here');
  vi.mocked(fs.writeFileSync).mockImplementation(() => {});

  utils.replaceContentInFile('/path/file.ts', 'old-name', 'new-name');

  expect(fs.writeFileSync).not.toHaveBeenCalled();
});

it('replaceContentInFile handles read errors gracefully', () => {
  vi.mocked(fs.readFileSync).mockImplementation(() => { throw new Error('ENOENT'); });
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  utils.replaceContentInFile('/path/file.ts', 'old', 'new');

  expect(consoleSpy).toHaveBeenCalled();
  consoleSpy.mockRestore();
});

it('setPackageName updates the name field', () => {
  vi.mocked(fs.readFileSync).mockReturnValue(JSON.stringify({ name: 'old-name', version: '1.0.0' }));
  vi.mocked(fs.writeFileSync).mockImplementation(() => {});

  utils.setPackageName('/path/package.json', 'new-name');

  const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
  const written = JSON.parse(writeCall[1] as string);

  expect(written.name).toBe('new-name');
  expect(written.version).toBe('1.0.0');
});

it('setPackageName preserves formatting with 2-space indent', () => {
  vi.mocked(fs.readFileSync).mockReturnValue('{"name":"old"}');
  vi.mocked(fs.writeFileSync).mockImplementation(() => {});

  utils.setPackageName('/path/package.json', 'new');

  const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];

  expect(writeCall[1]).toContain('\n');
});

it('setPackageName handles read errors gracefully', () => {
  vi.mocked(fs.readFileSync).mockImplementation(() => { throw new Error('ENOENT'); });
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  utils.setPackageName('/path/package.json', 'new');

  expect(consoleSpy).toHaveBeenCalled();
  consoleSpy.mockRestore();
});

it('replaceHtmlTitle replaces title tag content', () => {
  vi.mocked(fs.readFileSync).mockReturnValue('<html><head><title>Old Title</title></head></html>');
  vi.mocked(fs.writeFileSync).mockImplementation(() => {});

  utils.replaceHtmlTitle('/path/file.html', 'New Title');

  expect(fs.writeFileSync).toHaveBeenCalledWith(
    '/path/file.html',
    '<html><head><title>New Title</title></head></html>',
    'utf8'
  );
});

it('replaceHtmlTitle handles case-insensitive title tags', () => {
  vi.mocked(fs.readFileSync).mockReturnValue('<html><head><TITLE>Old</TITLE></head></html>');
  vi.mocked(fs.writeFileSync).mockImplementation(() => {});

  utils.replaceHtmlTitle('/path/file.html', 'New');

  expect(fs.writeFileSync).toHaveBeenCalledWith(
    '/path/file.html',
    '<html><head><title>New</title></head></html>',
    'utf8'
  );
});

it('replaceHtmlTitle handles read errors gracefully', () => {
  vi.mocked(fs.readFileSync).mockImplementation(() => { throw new Error('ENOENT'); });
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  utils.replaceHtmlTitle('/path/file.html', 'New');

  expect(consoleSpy).toHaveBeenCalled();
  consoleSpy.mockRestore();
});

it('install runs pnpm install in target directory', () => {
  vi.mocked(execSync).mockImplementation(() => Buffer.from(''));

  utils.install('/path/to/target');

  expect(execSync).toHaveBeenCalledWith('pnpm install', {
    cwd: '/path/to/target',
    stdio: 'inherit',
  });
});

it('install handles errors gracefully', () => {
  vi.mocked(execSync).mockImplementation(() => { throw new Error('command failed'); });
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  utils.install('/path/to/target');

  expect(consoleSpy).toHaveBeenCalled();
  consoleSpy.mockRestore();
});
