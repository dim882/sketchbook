import * as fs from 'fs';
import * as path from 'path';
import { Result } from '@swan-io/boxed';
import * as LibPaths from '../lib/paths';
import * as LibBuild from '../lib/build';

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

export const buildAllSketches = (
  sketchesDir: string,
  buildFn: (path: string) => Result<void, Error>
): BuildResult => {
  const directories = getAllSketchDirectories(sketchesDir);
  const failures = directories.map(buildFn).filter((r) => r.isError()).length;
  return { total: directories.length, failures };
};

const main = (): void => {
  const result = buildAllSketches(LibPaths.getSketchesDir(), LibBuild.buildSketch);
  console.log(`Found ${result.total} sketches to build`);

  if (result.failures > 0) {
    console.error(`${result.failures} sketch(es) failed to build`);
    process.exit(1);
  }

  console.log('All sketches built successfully');
};

main();
