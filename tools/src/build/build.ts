import * as LibPaths from '../lib/paths';
import * as LibBuild from '../lib/build';
import { buildAllSketches } from './build.utils';
import { installErrorHandlers } from '../lib/bootstrap';
import { createLogger } from '../lib/logger';

installErrorHandlers();
const log = createLogger('build');

const main = (): void => {
  const result = buildAllSketches(LibPaths.getSketchesDir(), LibBuild.buildSketch);
  log.info(`Found ${result.total} sketches to build`, { total: result.total });

  if (result.failures > 0) {
    log.error(`${result.failures} sketch(es) failed to build`, { failures: result.failures });
    process.exit(1);
  }

  log.info('All sketches built successfully');
};

main();
