import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('child_process');

import { buildSketch } from './sketch.build.utils';
import { execSync } from 'child_process';

describe('sketch.build.utils', () => {
  describe('buildSketch', () => {
    beforeEach(() => {
      vi.mocked(execSync).mockReset();
    });

    it('executes rollup -c in the sketch directory', () => {
      buildSketch('/path/to/my-sketch');

      expect(execSync).toHaveBeenCalledWith('rollup -c', {
        cwd: '/path/to/my-sketch',
        stdio: 'inherit',
      });
    });

    it('logs the sketch name being built', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      buildSketch('/path/to/my-sketch');

      expect(consoleSpy).toHaveBeenCalledWith('Building sketch: my-sketch');
      consoleSpy.mockRestore();
    });

    it('handles build errors gracefully', () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('rollup failed');
      });
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      buildSketch('/path/to/my-sketch');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
