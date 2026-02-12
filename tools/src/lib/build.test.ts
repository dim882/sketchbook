import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventEmitter } from 'events';

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
import { spawn } from 'child_process';

const createMockChildProcess = () => {
  const child = new EventEmitter() as EventEmitter & {
    stderr: EventEmitter;
    stdout: EventEmitter;
  };
  child.stderr = new EventEmitter();
  child.stdout = new EventEmitter();
  return child;
};

describe('buildSketch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns Ok when rollup exits with code 0', async () => {
    const mockChild = createMockChildProcess();
    vi.mocked(spawn).mockReturnValue(mockChild as never);

    const resultPromise = LibBuild.buildSketch('/path/to/my-sketch');
    mockChild.emit('close', 0);
    const result = await resultPromise;

    expect(result.isOk()).toBe(true);
    expect(spawn).toHaveBeenCalledWith('npx', ['rollup', '-c'], {
      cwd: '/path/to/my-sketch',
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  });

  it('logs the sketch name being built', async () => {
    const mockChild = createMockChildProcess();
    vi.mocked(spawn).mockReturnValue(mockChild as never);

    const resultPromise = LibBuild.buildSketch('/path/to/my-sketch');
    mockChild.emit('close', 0);
    await resultPromise;

    expect(mockLogger.info).toHaveBeenCalledWith('Building sketch: my-sketch');
  });

  it('returns Error when rollup exits with non-zero code', async () => {
    const mockChild = createMockChildProcess();
    vi.mocked(spawn).mockReturnValue(mockChild as never);

    const resultPromise = LibBuild.buildSketch('/path/to/my-sketch');
    mockChild.stderr.emit('data', Buffer.from('Build failed: syntax error'));
    mockChild.emit('close', 1);
    const result = await resultPromise;

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.getError().message).toContain('syntax error');
    }
  });

  it('returns Error when spawn emits error event', async () => {
    const mockChild = createMockChildProcess();
    vi.mocked(spawn).mockReturnValue(mockChild as never);

    const resultPromise = LibBuild.buildSketch('/path/to/my-sketch');
    mockChild.emit('error', new Error('spawn ENOENT'));
    const result = await resultPromise;

    expect(result.isError()).toBe(true);
    if (result.isError()) {
      expect(result.getError().message).toBe('spawn ENOENT');
    }
  });
});
