import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { SketchServerHandler } from '../server.sketch.types';
import { IDir } from '../ui/SketchList';

const sketchesPath = path.join(__dirname, '../../sketches');

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
  const base = path.join(sketchesPath, name);
  const dist = path.join(base, 'dist');
  const src = path.join(base, 'src');

  return {
    base,
    dist,
    src,
    html: path.join(dist, `${name}.html`),
    params: path.join(src, `${name}.params.ts`),
    template: path.join(src, `${name}.params.tpl`),
    serverHandler: path.join(src, `${name}.server.js`),
  };
}

// Path utilities
export const paths = {
  public: () => path.join(__dirname, '../public'),
  uiIndex: () => path.join(__dirname, './ui/index.html.tpl'),
  sketches: () => sketchesPath,
  sketch: (name: string) => createSketchPaths(name),
};

async function getLastModifiedTime(dirPath: string): Promise<number> {
  const tsFiles = await fg(['**/*.{ts,tsx,html}'], {
    cwd: dirPath,
    absolute: true,
    ignore: ['node_modules/**'],
    dot: false,
  });

  if (tsFiles.length === 0) {
    return 0;
  }

  const tsStats = await Promise.all(tsFiles.map((file) => fs.stat(file)));

  return Math.max(...tsStats.map((stat) => stat.mtime.getTime()));
}

export async function getSketchDirsData(sketchesPath: string): Promise<IDir[]> {
  const files = await fs.readdir(sketchesPath, { withFileTypes: true });

  const dirsWithTimestamps = await Promise.all(
    files
      .filter((file) => file.isDirectory())
      .map(async (dir) => {
        return {
          name: dir.name,
          lastModified: await getLastModifiedTime(path.join(sketchesPath, dir.name)),
        };
      })
  );

  return dirsWithTimestamps.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getSketchParams(sketchName: string) {
  const sketchPaths = paths.sketch(sketchName);
  const fileContent = await fs.readFile(sketchPaths.params, 'utf-8');
  const sketchHandler = (await import(sketchPaths.serverHandler)) as { default: SketchServerHandler };

  return sketchHandler.default.getParams(fileContent);
}
