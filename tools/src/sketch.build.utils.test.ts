import { it, expect, vi } from 'vitest';

vi.mock('child_process');

import { buildSketch } from './sketch.build.utils';
import { execSync } from 'child_process';

it('buildSketch executes rollup -c in the sketch directory', () => {
  vi.mocked(execSync).mockImplementation(() => Buffer.from(''));

  buildSketch('/path/to/my-sketch');

  expect(execSync).toHaveBeenCalledWith('rollup -c', {
    cwd: '/path/to/my-sketch',
    stdio: 'inherit',
  });
});

it('buildSketch logs the sketch name being built', () => {
  vi.mocked(execSync).mockImplementation(() => Buffer.from(''));
  const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

  buildSketch('/path/to/my-sketch');

  expect(consoleSpy).toHaveBeenCalledWith('Building sketch: my-sketch');
  consoleSpy.mockRestore();
});

it('buildSketch handles build errors gracefully', () => {
  vi.mocked(execSync).mockImplementation(() => { throw new Error('rollup failed'); });
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  buildSketch('/path/to/my-sketch');

  expect(consoleSpy).toHaveBeenCalled();
  consoleSpy.mockRestore();
});
