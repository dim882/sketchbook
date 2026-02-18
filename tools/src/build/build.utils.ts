import * as fs from 'fs';
import * as path from 'path';
import fg from 'fast-glob';
import { Future, Result } from '@swan-io/boxed';

export type BuildResult = {
  total: number;
  failures: number;
};

export const getAllSketchDirectories = (directory: string): string[] => {
  if (!fs.existsSync(directory)) return [];

  const configs = fg.sync('**/rollup.config.js', {
    cwd: directory,
    ignore: ['**/node_modules/**'],
  });

  return configs.map((config) => path.join(directory, path.dirname(config)));
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
