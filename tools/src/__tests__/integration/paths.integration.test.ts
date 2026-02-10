import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { paths } from '../../utils/server.utils';

describe('Path Resolution Integration', () => {
  describe('paths.public', () => {
    it('resolves to an existing directory', () => {
      const publicPath = paths.public();
      expect(fs.existsSync(publicPath)).toBe(true);
      expect(fs.statSync(publicPath).isDirectory()).toBe(true);
    });
  });

  describe('paths.uiIndex', () => {
    it('resolves to an existing file', () => {
      const uiIndexPath = paths.uiIndex();
      expect(fs.existsSync(uiIndexPath)).toBe(true);
      expect(fs.statSync(uiIndexPath).isFile()).toBe(true);
    });

    it('resolves to an HTML template file', () => {
      const uiIndexPath = paths.uiIndex();
      expect(uiIndexPath).toMatch(/\.html\.tpl$/);
    });
  });

  describe('paths.sketches', () => {
    it('resolves to an existing directory', () => {
      const sketchesPath = paths.sketches();
      expect(fs.existsSync(sketchesPath)).toBe(true);
      expect(fs.statSync(sketchesPath).isDirectory()).toBe(true);
    });

    it('resolves to the sketches directory at project root', () => {
      const sketchesPath = paths.sketches();
      expect(sketchesPath).toMatch(/\/sketches$/);
      expect(sketchesPath).not.toMatch(/\/tools\/sketches$/);
    });
  });
});
