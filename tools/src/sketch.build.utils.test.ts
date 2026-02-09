import { describe, it, expect, vi } from 'vitest';

vi.mock('child_process');

import { buildSketch } from './sketch.build.utils';
import { execSync } from 'child_process';

describe('buildSketch', () => {
  it('returns Ok and executes rollup -c in the sketch directory', () => {
    vi.mocked(execSync).mockImplementation(() => Buffer.from(''));

    const result = buildSketch('/path/to/my-sketch');

    expect(result.isOk()).toBe(true);
    expect(execSync).toHaveBeenCalledWith('rollup -c', {
      cwd: '/path/to/my-sketch',
      stdio: 'inherit',
    });
  });

  it('logs the sketch name being built', () => {
    vi.mocked(execSync).mockImplementation(() => Buffer.from(''));
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    buildSketch('/path/to/my-sketch');

    expect(consoleSpy).toHaveBeenCalledWith('Building sketch: my-sketch');
    consoleSpy.mockRestore();
  });

  it('returns Error when build fails', () => {
    vi.mocked(execSync).mockImplementation(() => {
      throw new Error('rollup failed');
    });

    const result = buildSketch('/path/to/my-sketch');

    expect(result.isError()).toBe(true);
  });
});
