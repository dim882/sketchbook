import * as path from 'node:path';
import * as LibPaths from '../lib/paths';

export interface SketchPaths {
  base: string;
  dist: string;
  src: string;
  html: string;
  params: string;
  template: string;
  serverHandler: string;
}

function createSketchPaths(name: string): SketchPaths {
  const sketchesPath = LibPaths.getSketchesDir();
  const base = path.join(sketchesPath, name);
  const dist = path.join(base, 'dist');
  const src = path.join(base, 'src');
  const leafName = path.basename(name);

  return {
    base,
    dist,
    src,
    html: path.join(dist, `${leafName}.html`),
    params: path.join(src, `${leafName}.params.ts`),
    template: path.join(src, `${leafName}.params.tpl`),
    serverHandler: path.join(src, `${leafName}.server.js`),
  };
}

export const paths = {
  public: () => LibPaths.getPublicDir(),
  uiIndex: () => path.join(__dirname, '../ui/index.html.tpl'),
  sketches: () => LibPaths.getSketchesDir(),
  sketch: (name: string) => createSketchPaths(name),
};
