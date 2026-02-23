import * as fs from 'fs';
import * as path from 'path';
import fg from 'fast-glob';
import { Future, Result } from '@swan-io/boxed';

export const SKETCH_MARKER = 'package.json';
export const SKETCH_GLOB = `**/${SKETCH_MARKER}`;
export const SKETCH_GLOB_IGNORE = ['**/node_modules/**', '**/dist/**'];

export type BuildResult = {
  total: number;
  failures: number;
};

export const getAllSketchDirectories = (directory: string): string[] => {
  if (!fs.existsSync(directory)) return [];

  const matches = fg.sync(SKETCH_GLOB, {
    cwd: directory,
    ignore: SKETCH_GLOB_IGNORE,
  });

  return matches.map((match) => path.join(directory, path.dirname(match)));
};

export const buildAllSketches = async (
  sketchesDir: string,
  buildFn: (path: string) => Future<Result<void, Error>>
): Promise<BuildResult> => {
  const directories = getAllSketchDirectories(sketchesDir);
  let failures = 0;

  for (const dir of directories) {
    const result = await buildFn(dir).toPromise();
    if (result.isError()) {
      failures++;
    }
  }

  return {
    total: directories.length,
    failures
  };
};
