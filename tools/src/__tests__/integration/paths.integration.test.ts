import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import * as ServerPaths from '../../server/server.paths';

describe('Path Resolution Integration', () => {
  describe('ServerPaths.paths.public', () => {
    it('resolves to an existing directory', () => {
      const publicPath = ServerPaths.paths.public();
      expect(fs.existsSync(publicPath)).toBe(true);
      expect(fs.statSync(publicPath).isDirectory()).toBe(true);
    });
  });

  describe('ServerPaths.paths.uiIndex', () => {
    it('resolves to an existing file', () => {
      const uiIndexPath = ServerPaths.paths.uiIndex();
      expect(fs.existsSync(uiIndexPath)).toBe(true);
      expect(fs.statSync(uiIndexPath).isFile()).toBe(true);
    });

    it('resolves to an HTML template file', () => {
      const uiIndexPath = ServerPaths.paths.uiIndex();
      expect(uiIndexPath).toMatch(/\.html\.tpl$/);
    });
  });

  describe('ServerPaths.paths.sketches', () => {
    it('resolves to an existing directory', () => {
      const sketchesPath = ServerPaths.paths.sketches();
      expect(fs.existsSync(sketchesPath)).toBe(true);
      expect(fs.statSync(sketchesPath).isDirectory()).toBe(true);
    });

    it('resolves to the sketches directory at project root', () => {
      const sketchesPath = ServerPaths.paths.sketches();
      expect(sketchesPath).toMatch(/\/sketches$/);
      expect(sketchesPath).not.toMatch(/\/tools\/sketches$/);
    });
  });
});
