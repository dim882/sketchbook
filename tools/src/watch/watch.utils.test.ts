import { it, expect, vi } from 'vitest';

vi.mock('node:fs');

import * as WatchUtils from './watch.utils';
import fs from 'node:fs';

it('findNearestConfig returns config path when rollup.config.js exists in directory', () => {
  vi.mocked(fs.existsSync).mockReturnValue(true);

  const result = WatchUtils.findNearestConfig('/project/sketches/my-sketch/src');

  expect(result).toBe('/project/sketches/my-sketch/src/rollup.config.js');
});

it('findNearestConfig searches parent directories when config not in current', () => {
  vi.mocked(fs.existsSync).mockImplementation((p) => {
    return p.toString() === '/project/sketches/my-sketch/rollup.config.js';
  });

  const result = WatchUtils.findNearestConfig('/project/sketches/my-sketch/src');

  expect(result).toBe('/project/sketches/my-sketch/rollup.config.js');
});

it('findNearestConfig returns null when reaching root without finding config', () => {
  vi.mocked(fs.existsSync).mockReturnValue(false);

  const result = WatchUtils.findNearestConfig('/project/sketches/my-sketch/src');

  expect(result).toBeNull();
});

it('findNearestConfig returns null for root directory', () => {
  vi.mocked(fs.existsSync).mockReturnValue(false);

  const result = WatchUtils.findNearestConfig('/');

  expect(result).toBeNull();
});
