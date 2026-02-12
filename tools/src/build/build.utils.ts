import * as fs from 'fs';
import * as path from 'path';
import { Future, Result } from '@swan-io/boxed';

const EXCLUDED_DIRS = ['.git', 'node_modules'];

export type BuildResult = {
  total: number;
  failures: number;
};

export const getAllSketchDirectories = (directory: string): string[] =>
  fs.existsSync(directory)
    ? fs
      .readdirSync(directory, { withFileTypes: true })
      .filter((item) => item.isDirectory() && !EXCLUDED_DIRS.includes(item.name))
      .map((item) => path.join(directory, item.name))
    : [];

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
