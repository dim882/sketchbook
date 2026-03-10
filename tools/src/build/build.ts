import * as LibPaths from '../lib/paths';
import * as LibBuild from '../lib/build';
import { buildAllSketches } from './build.utils';
import { buildAllSchemas } from './build-schemas';
import { installErrorHandlers } from '../lib/bootstrap';
import { createLogger } from '../lib/logger';

installErrorHandlers();
const log = createLogger('build');

const main = async (): Promise<void> => {
  const sketchesDir = LibPaths.getSketchesDir();

  const sketchResult = await buildAllSketches(sketchesDir, LibBuild.buildSketch);
  log.info(`Found ${sketchResult.total} sketches to build`, { total: sketchResult.total });

  const schemaResult = await buildAllSchemas(sketchesDir);
  log.info(`Found ${schemaResult.total} schemas to compile`, { total: schemaResult.total });

  const totalFailures = sketchResult.failures + schemaResult.failures;

  if (totalFailures > 0) {
    log.error(`${totalFailures} build(s) failed`, {
      sketchFailures: sketchResult.failures,
      schemaFailures: schemaResult.failures,
    });
    process.exit(1);
  }

  log.info('All sketches and schemas built successfully');
};

main();
