import { it, expect, vi, describe } from 'vitest';
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

describe('getArgs', () => {
  it('returns sourceName and targetName when both provided', () => {
    withArgv(['source-sketch', 'target-sketch'], () => {
      const result = utils.getArgs();

      expect(result).toEqual({
        sourceName: 'source-sketch',
        targetName: 'target-sketch',
      });
    });
  });

  it('exits with code 1 when sourceName missing', () => {
    withArgv([], () => {
      utils.getArgs();

      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  it('exits with code 1 when targetName missing', () => {
    withArgv(['source-only'], () => {
      utils.getArgs();

      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});

describe('getDirectoryNames', () => {
  it('returns sourceDir and targetDir when source exists and target does not', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => p.toString().includes('existing-source'));
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
    const result = utils.createTargetPath('my-sketch.ts', '/target/dir', 'my-sketch', 'new-sketch');

    expect(result).toBe(path.join('/target/dir', 'new-sketch.ts'));
  });

  it('preserves filename when it does not start with sourceName', () => {
    const result = utils.createTargetPath('utils.ts', '/target/dir', 'my-sketch', 'new-sketch');

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
    const result = utils.createTargetPath('my-sketch', '/target/dir', 'my-sketch', 'new-sketch');

    expect(result).toBe(path.join('/target/dir', 'new-sketch'));
  });
});

describe('isTextFile', () => {
  it('returns true for .ts files', () => {
    expect(utils.isTextFile('file.ts')).toBe(true);
  });

  it('returns true for .js files', () => {
    expect(utils.isTextFile('file.js')).toBe(true);
  });

  it('returns true for .html files', () => {
    expect(utils.isTextFile('file.html')).toBe(true);
  });

  it('returns true for .css files', () => {
    expect(utils.isTextFile('file.css')).toBe(true);
  });

  it('returns true for .md files', () => {
    expect(utils.isTextFile('file.md')).toBe(true);
  });

  it('returns true for .json files', () => {
    expect(utils.isTextFile('file.json')).toBe(true);
  });

  it('returns false for .png files', () => {
    expect(utils.isTextFile('file.png')).toBe(false);
  });

  it('returns false for files with no extension', () => {
    expect(utils.isTextFile('file')).toBe(false);
  });
});

describe('replaceContentInFile', () => {
  it('returns Ok with changed: true and writes file when content changes', () => {
    vi.mocked(fs.readFileSync).mockReturnValue('import "old-name";\nconst x = "old-name";');
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    const result = utils.replaceContentInFile('/path/file.ts', 'old-name', 'new-name');

    expect(result.isOk()).toBe(true);
    result.match({
      Ok: (value) => expect(value.changed).toBe(true),
      Error: () => expect.fail('Should not be error'),
    });

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      '/path/file.ts',
      'import "new-name";\nconst x = "new-name";',
      'utf8'
    );
  });

  it('returns Ok with changed: false when no changes made', () => {
    vi.mocked(fs.readFileSync).mockReturnValue('no matches here');
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    const result = utils.replaceContentInFile('/path/file.ts', 'old-name', 'new-name');

    expect(result.isOk()).toBe(true);
    result.match({
      Ok: (value) => expect(value.changed).toBe(false),
      Error: () => expect.fail('Should not be error'),
    });

    expect(fs.writeFileSync).not.toHaveBeenCalled();
  });

  it('returns Error when read fails', () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const result = utils.replaceContentInFile('/path/file.ts', 'old', 'new');

    expect(result.isError()).toBe(true);
  });
});

describe('setPackageName', () => {
  it('returns Ok and updates the name field', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ name: 'old-name', version: '1.0.0' })
    );
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    const result = utils.setPackageName('/path/package.json', 'new-name');

    expect(result.isOk()).toBe(true);

    const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
    const written = JSON.parse(writeCall[1] as string);

    expect(written.name).toBe('new-name');
    expect(written.version).toBe('1.0.0');
  });

  it('preserves formatting with 2-space indent', () => {
    vi.mocked(fs.readFileSync).mockReturnValue('{"name":"old"}');
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    utils.setPackageName('/path/package.json', 'new');

    const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];

    expect(writeCall[1]).toContain('\n');
  });

  it('returns Error when read fails', () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const result = utils.setPackageName('/path/package.json', 'new');

    expect(result.isError()).toBe(true);
  });

  it('returns Error when JSON is invalid', () => {
    vi.mocked(fs.readFileSync).mockReturnValue('not valid json');

    const result = utils.setPackageName('/path/package.json', 'new');

    expect(result.isError()).toBe(true);
  });
});

describe('replaceHtmlTitle', () => {
  it('returns Ok and replaces title tag content', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(
      '<html><head><title>Old Title</title></head></html>'
    );
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    const result = utils.replaceHtmlTitle('/path/file.html', 'New Title');

    expect(result.isOk()).toBe(true);

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
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    const result = utils.replaceHtmlTitle('/path/file.html', 'New');

    expect(result.isOk()).toBe(true);

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      '/path/file.html',
      '<html><head><title>New</title></head></html>',
      'utf8'
    );
  });

  it('returns Error when read fails', () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const result = utils.replaceHtmlTitle('/path/file.html', 'New');

    expect(result.isError()).toBe(true);
  });
});

describe('install', () => {
  it('returns Ok and runs pnpm install in target directory', () => {
    vi.mocked(execSync).mockImplementation(() => Buffer.from(''));

    const result = utils.install('/path/to/target');

    expect(result.isOk()).toBe(true);

    expect(execSync).toHaveBeenCalledWith('pnpm install', {
      cwd: '/path/to/target',
      stdio: 'inherit',
    });
  });

  it('returns Error when command fails', () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('command failed');
    });

    const result = utils.install('/path/to/target');

    expect(result.isError()).toBe(true);
  });
});
