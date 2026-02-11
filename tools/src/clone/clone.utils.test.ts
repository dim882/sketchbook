import { it, expect, vi, describe } from 'vitest';
import * as path from 'path';

vi.mock('fs');
vi.mock('child_process');

import * as CloneUtils from './clone.utils';
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

describe('validateArgs (pure)', () => {
  it('returns Ok with sourceName and targetName when both provided', () => {
    const result = CloneUtils.validateArgs(['node', 'script.ts', 'source', 'target']);

    expect(result.isOk()).toBe(true);
    result.match({
      Ok: (args) => {
        expect(args.sourceName).toBe('source');
        expect(args.targetName).toBe('target');
      },
      Error: () => expect.fail('Should not be error'),
    });
  });

  it('returns Error with messages when source missing', () => {
    const result = CloneUtils.validateArgs(['node', 'script.ts']);

    expect(result.isError()).toBe(true);
    result.match({
      Ok: () => expect.fail('Should not be Ok'),
      Error: (errors) => {
        expect(errors).toContain('<source> not provided');
        expect(errors).toContain('<target> not provided');
      },
    });
  });

  it('returns Error when only source provided', () => {
    const result = CloneUtils.validateArgs(['node', 'script.ts', 'source']);

    expect(result.isError()).toBe(true);
    result.match({
      Ok: () => expect.fail('Should not be Ok'),
      Error: (errors) => {
        expect(errors).toContain('<target> not provided');
        expect(errors).not.toContain('<source> not provided');
      },
    });
  });
});

describe('getArgs (imperative wrapper)', () => {
  it('returns sourceName and targetName when both provided', () => {
    withArgv(['source-sketch', 'target-sketch'], () => {
      const result = CloneUtils.getArgs();

      expect(result).toEqual({
        sourceName: 'source-sketch',
        targetName: 'target-sketch',
      });
    });
  });

  it('exits with code 1 when sourceName missing', () => {
    withArgv([], () => {
      CloneUtils.getArgs();

      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });

  it('exits with code 1 when targetName missing', () => {
    withArgv(['source-only'], () => {
      CloneUtils.getArgs();

      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});

describe('validateDirectories (pure)', () => {
  it('returns Ok when source exists and target does not', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => p.toString().includes('existing-source'));
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats);

    const result = CloneUtils.validateDirectories('existing-source', 'new-target');

    expect(result.isOk()).toBe(true);
    result.match({
      Ok: (dirs) => {
        expect(dirs.sourceDir).toContain('existing-source');
        expect(dirs.targetDir).toContain('new-target');
      },
      Error: () => expect.fail('Should not be error'),
    });
  });

  it('returns Error when source does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const result = CloneUtils.validateDirectories('nonexistent', 'target');

    expect(result.isError()).toBe(true);
    result.match({
      Ok: () => expect.fail('Should not be Ok'),
      Error: (msg) => expect(msg).toContain('Source sketch directory not found'),
    });
  });

  it('returns Error when target already exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats);

    const result = CloneUtils.validateDirectories('source', 'existing-target');

    expect(result.isError()).toBe(true);
    result.match({
      Ok: () => expect.fail('Should not be Ok'),
      Error: (msg) => expect(msg).toContain('Target sketch directory already exists'),
    });
  });
});

describe('getDirectoryNames (imperative wrapper)', () => {
  it('returns sourceDir and targetDir when source exists and target does not', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => p.toString().includes('existing-source'));
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats);

    const result = CloneUtils.getDirectoryNames('existing-source', 'new-target');

    expect(result.sourceDir).toContain('existing-source');
    expect(result.targetDir).toContain('new-target');
  });

  it('exits when source directory does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    CloneUtils.getDirectoryNames('nonexistent', 'target');

    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('exits when target directory already exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats);

    CloneUtils.getDirectoryNames('source', 'existing-target');

    expect(process.exit).toHaveBeenCalledWith(1);
  });
});

describe('createTargetPath', () => {
  it('renames file when it starts with sourceName', () => {
    const result = CloneUtils.createTargetPath('my-sketch.ts', '/target/dir', 'my-sketch', 'new-sketch');

    expect(result).toBe(path.join('/target/dir', 'new-sketch.ts'));
  });

  it('preserves filename when it does not start with sourceName', () => {
    const result = CloneUtils.createTargetPath('utils.ts', '/target/dir', 'my-sketch', 'new-sketch');

    expect(result).toBe(path.join('/target/dir', 'utils.ts'));
  });

  it('handles complex source name prefixes', () => {
    const result = CloneUtils.createTargetPath(
      'my-sketch.utils.ts',
      '/target/dir',
      'my-sketch',
      'new-sketch'
    );

    expect(result).toBe(path.join('/target/dir', 'new-sketch.utils.ts'));
  });

  it('handles files with no extension', () => {
    const result = CloneUtils.createTargetPath('my-sketch', '/target/dir', 'my-sketch', 'new-sketch');

    expect(result).toBe(path.join('/target/dir', 'new-sketch'));
  });
});

describe('isTextFile', () => {
  it('returns true for .ts files', () => {
    expect(CloneUtils.isTextFile('file.ts')).toBe(true);
  });

  it('returns true for .js files', () => {
    expect(CloneUtils.isTextFile('file.js')).toBe(true);
  });

  it('returns true for .html files', () => {
    expect(CloneUtils.isTextFile('file.html')).toBe(true);
  });

  it('returns true for .css files', () => {
    expect(CloneUtils.isTextFile('file.css')).toBe(true);
  });

  it('returns true for .md files', () => {
    expect(CloneUtils.isTextFile('file.md')).toBe(true);
  });

  it('returns true for .json files', () => {
    expect(CloneUtils.isTextFile('file.json')).toBe(true);
  });

  it('returns false for .png files', () => {
    expect(CloneUtils.isTextFile('file.png')).toBe(false);
  });

  it('returns false for files with no extension', () => {
    expect(CloneUtils.isTextFile('file')).toBe(false);
  });
});

describe('replaceContentInFile', () => {
  it('returns Ok with changed: true and writes file when content changes', () => {
    vi.mocked(fs.readFileSync).mockReturnValue('import "old-name";\nconst x = "old-name";');
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    const result = CloneUtils.replaceContentInFile('/path/file.ts', 'old-name', 'new-name');

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

    const result = CloneUtils.replaceContentInFile('/path/file.ts', 'old-name', 'new-name');

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

    const result = CloneUtils.replaceContentInFile('/path/file.ts', 'old', 'new');

    expect(result.isError()).toBe(true);
  });
});

describe('setPackageName', () => {
  it('returns Ok and updates the name field', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(
      JSON.stringify({ name: 'old-name', version: '1.0.0' })
    );
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    const result = CloneUtils.setPackageName('/path/package.json', 'new-name');

    expect(result.isOk()).toBe(true);

    const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];
    const written = JSON.parse(writeCall[1] as string);

    expect(written.name).toBe('new-name');
    expect(written.version).toBe('1.0.0');
  });

  it('preserves formatting with 2-space indent', () => {
    vi.mocked(fs.readFileSync).mockReturnValue('{"name":"old"}');
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    CloneUtils.setPackageName('/path/package.json', 'new');

    const writeCall = vi.mocked(fs.writeFileSync).mock.calls[0];

    expect(writeCall[1]).toContain('\n');
  });

  it('returns Error when read fails', () => {
    vi.mocked(fs.readFileSync).mockImplementation(() => {
      throw new Error('ENOENT');
    });

    const result = CloneUtils.setPackageName('/path/package.json', 'new');

    expect(result.isError()).toBe(true);
  });

  it('returns Error when JSON is invalid', () => {
    vi.mocked(fs.readFileSync).mockReturnValue('not valid json');

    const result = CloneUtils.setPackageName('/path/package.json', 'new');

    expect(result.isError()).toBe(true);
  });
});

describe('replaceHtmlTitle', () => {
  it('returns Ok and replaces title tag content', () => {
    vi.mocked(fs.readFileSync).mockReturnValue(
      '<html><head><title>Old Title</title></head></html>'
    );
    vi.mocked(fs.writeFileSync).mockImplementation(() => {});

    const result = CloneUtils.replaceHtmlTitle('/path/file.html', 'New Title');

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

    const result = CloneUtils.replaceHtmlTitle('/path/file.html', 'New');

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

    const result = CloneUtils.replaceHtmlTitle('/path/file.html', 'New');

    expect(result.isError()).toBe(true);
  });
});

describe('install', () => {
  it('returns Ok and runs pnpm install in target directory', () => {
    vi.mocked(execSync).mockImplementation(() => Buffer.from(''));

    const result = CloneUtils.install('/path/to/target');

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

    const result = CloneUtils.install('/path/to/target');

    expect(result.isError()).toBe(true);
  });
});
