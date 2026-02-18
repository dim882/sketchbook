import { it, expect, vi, describe } from 'vitest';

vi.mock('fs');

import * as MoveUtils from './move.utils';
import fs from 'fs';

function withArgv(args: string[], fn: () => void) {
  const original = process.argv;
  process.argv = ['node', 'script.ts', ...args];

  try {
    fn();
  } finally {
    process.argv = original;
  }
}

describe('validateArgs', () => {
  it('returns Ok with sourcePath and targetPath when both provided', () => {
    const result = MoveUtils.validateArgs(['node', 'script.ts', 'source', 'target']);

    expect(result.isOk()).toBe(true);
    result.match({
      Ok: (args) => {
        expect(args.sourcePath).toBe('source');
        expect(args.targetPath).toBe('target');
      },
      Error: () => expect.fail('Should not be error'),
    });
  });

  it('returns Error when source missing', () => {
    const result = MoveUtils.validateArgs(['node', 'script.ts']);

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
    const result = MoveUtils.validateArgs(['node', 'script.ts', 'source']);

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

describe('getArgs', () => {
  it('returns sourcePath and targetPath when both provided', () => {
    withArgv(['old-path', 'new-path'], () => {
      const result = MoveUtils.getArgs();

      expect(result).toEqual({
        sourcePath: 'old-path',
        targetPath: 'new-path',
      });
    });
  });

  it('exits with code 1 when args missing', () => {
    withArgv([], () => {
      MoveUtils.getArgs();

      expect(process.exit).toHaveBeenCalledWith(1);
    });
  });
});

describe('validateDirectories', () => {
  it('returns Ok when source is valid sketch and target does not exist', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      const s = p.toString();
      return s.includes('existing-sketch') && !s.includes('rollup') ? true
        : s.endsWith('rollup.config.js') && s.includes('existing-sketch') ? true
        : false;
    });
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats);

    const result = MoveUtils.validateDirectories('existing-sketch', 'new-location');

    expect(result.isOk()).toBe(true);
  });

  it('returns Error when source does not exist', () => {
    vi.mocked(fs.existsSync).mockReturnValue(false);

    const result = MoveUtils.validateDirectories('nonexistent', 'target');

    expect(result.isError()).toBe(true);
    result.match({
      Ok: () => expect.fail('Should not be Ok'),
      Error: (msg) => expect(msg).toContain('Source sketch directory not found'),
    });
  });

  it('returns Error when source has no rollup.config.js', () => {
    vi.mocked(fs.existsSync).mockImplementation((p) => {
      return !p.toString().includes('rollup');
    });
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats);

    const result = MoveUtils.validateDirectories('not-a-sketch', 'target');

    expect(result.isError()).toBe(true);
    result.match({
      Ok: () => expect.fail('Should not be Ok'),
      Error: (msg) => expect(msg).toContain('not a sketch'),
    });
  });

  it('returns Error when target already exists', () => {
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.statSync).mockReturnValue({ isDirectory: () => true } as fs.Stats);

    const result = MoveUtils.validateDirectories('source', 'existing-target');

    expect(result.isError()).toBe(true);
    result.match({
      Ok: () => expect.fail('Should not be Ok'),
      Error: (msg) => expect(msg).toContain('Target directory already exists'),
    });
  });
});
