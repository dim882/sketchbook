import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('child_process');

const { mockLogger } = vi.hoisted(() => ({
  mockLogger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('./logger', () => ({
  createLogger: () => mockLogger,
}));

import * as LibBuild from './build';
import { execSync } from 'child_process';

describe('buildSketch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns Ok and executes rollup -c in the sketch directory', () => {
    vi.mocked(execSync).mockImplementation(() => Buffer.from(''));

    const result = LibBuild.buildSketch('/path/to/my-sketch');

    expect(result.isOk()).toBe(true);
    expect(execSync).toHaveBeenCalledWith('rollup -c', {
      cwd: '/path/to/my-sketch',
      stdio: 'inherit',
    });
  });

  it('logs the sketch name being built', () => {
    vi.mocked(execSync).mockImplementation(() => Buffer.from(''));

    LibBuild.buildSketch('/path/to/my-sketch');

    expect(mockLogger.info).toHaveBeenCalledWith('Building sketch: my-sketch');
  });

  it('returns Error when build fails', () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('rollup failed');
    });

    const result = LibBuild.buildSketch('/path/to/my-sketch');

    expect(result.isError()).toBe(true);
  });
});
