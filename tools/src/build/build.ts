import * as LibPaths from '../lib/paths';
import * as LibBuild from '../lib/build';
import { buildAllSketches } from './build.utils';

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
