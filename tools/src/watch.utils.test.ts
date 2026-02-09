import { describe, it, expect, vi, beforeEach } from 'vitest';
import path from 'path';

vi.mock('node:fs');

import { findNearestConfig } from './watch.utils';
import fs from 'node:fs';

describe('watch.utils', () => {
  describe('findNearestConfig', () => {
    beforeEach(() => {
      vi.mocked(fs.existsSync).mockReset();
    });

    it('returns config path when rollup.config.js exists in directory', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);

      const result = findNearestConfig('/project/sketches/my-sketch/src');

      expect(result).toBe(path.join('/project/sketches/my-sketch/src', 'rollup.config.js'));
    });

    it('searches parent directories when config not in current', () => {
      vi.mocked(fs.existsSync).mockImplementation((p) => {
        return p.toString().endsWith('/project/sketches/my-sketch/rollup.config.js');
      });

      const result = findNearestConfig('/project/sketches/my-sketch/src');

      expect(result).toBe(path.join('/project/sketches/my-sketch', 'rollup.config.js'));
    });

    it('returns null when reaching root without finding config', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = findNearestConfig('/project/sketches/my-sketch/src');

      expect(result).toBeNull();
    });

    it('handles directory at root level', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);

      const result = findNearestConfig('/');

      expect(result).toBeNull();
    });
  });
});
