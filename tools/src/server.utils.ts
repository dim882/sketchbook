import fs from 'node:fs/promises';
import path from 'node:path';
import fg from 'fast-glob';
import { h } from 'preact';
import render from 'preact-render-to-string';
import { SketchServerHandler } from './server.sketch.types';
import SketchList from './ui/SketchList';
import { IDir } from './ui/SketchList';

const sketchesPath = path.join(__dirname, '../../sketches');

// Path utilities
export const paths = {
  public: () => path.join(__dirname, '../public'),
  uiIndex: () => path.join(__dirname, './ui/index.html'),
  sketches: () => sketchesPath,
  sketch: (sketchName: string) => path.join(sketchesPath, sketchName),
  dist: (sketchName: string) => path.join(sketchesPath, sketchName, 'dist'),
  src: (sketchName: string) => path.join(sketchesPath, sketchName, 'src'),
  html: (sketchName: string) => path.join(sketchesPath, sketchName, 'dist', `${sketchName}.html`),
  params: (sketchName: string) => path.join(sketchesPath, sketchName, 'src', `${sketchName}.params.ts`),
  template: (sketchName: string) => path.join(sketchesPath, sketchName, 'src', `${sketchName}.params.tpl`),
  serverHandler: (sketchName: string) => path.join(sketchesPath, sketchName, 'src', `${sketchName}.server.js`),
};

export async function loadCSSModulesMapping() {
  try {
    const styles = await import('./ui/SketchList.module.css');

    return styles.default;
  } catch (err) {
    console.error('Error loading CSS modules:', err);
  }
}

async function getLastModifiedTime(dirPath: string): Promise<number> {
  const tsFiles = await fg(['**/*.{ts,tsx}'], {
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
        const dirPath = path.join(sketchesPath, dir.name);
        const lastModified = await getLastModifiedTime(dirPath);

        return {
          name: dir.name,
          lastModified,
        };
      })
  );

  return dirsWithTimestamps.sort((a, b) => a.name.localeCompare(b.name));
}

export async function renderMainPage(
  sketchesPath: string,
  htmlTemplatePath: string,
  SketchListComponent: typeof SketchList,
  sketchName?: string
) {
  const directoryData = await getSketchDirsData(sketchesPath);
  const sketchListHtml = render(h(SketchListComponent, { dirs: directoryData }));
  const htmlTemplate = await fs.readFile(htmlTemplatePath, 'utf8');
  // prettier-ignore
  const renderedHtml = htmlTemplate
    .replace('${sketchListPlaceholder}', sketchListHtml)
    .replace('${initialData}',
      JSON.stringify({
        dirs: directoryData,
        initialSketch: sketchName || null,
      })
    );

  return renderedHtml;
}

export async function getSketchParams(sketchName: string) {
  const fileContent = await fs.readFile(paths.params(sketchName), 'utf-8');
  const sketchHandler = (await import(paths.serverHandler(sketchName))) as { default: SketchServerHandler };

  return sketchHandler.default.getParams(fileContent);
}
