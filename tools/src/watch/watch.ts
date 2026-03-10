import * as path from 'node:path';

import * as LibPaths from '../lib/paths';
import { buildSketch } from '../lib/build';
import { buildAllSchemas, compileSchemasForSketch } from '../build/build-schemas';
import { findNearestConfig, makeWatcher } from './watch.utils';
import { installErrorHandlers } from '../lib/bootstrap';
import { createLogger } from '../lib/logger';

installErrorHandlers();

const SKETCHES_DIR = LibPaths.getSketchesDir();
const DEBOUNCE_MS = 300;
const log = createLogger('watch');
const pendingBuilds = new Map<string, NodeJS.Timeout>();
const watcher = makeWatcher(SKETCHES_DIR, log);

buildAllSchemas(SKETCHES_DIR).then(({ total, failures }) => {
  log.info(`Schema startup complete: ${total} total, ${failures} failures`);
}).catch((error) => {
  log.error('Failed to compile schemas on startup', { error: error instanceof Error ? error.message : String(error) });
});

watcher.on('all', (_event, filePath) => {
  const configPath = findNearestConfig(path.dirname(filePath));

  if (!configPath) {
    log.debug(`No config found for: ${filePath}`);
    return;
  }

  // Debounce: cancel pending build for this config and schedule a new one
  clearTimeout(pendingBuilds.get(configPath));

  pendingBuilds.set(configPath, setTimeout(() => {
    pendingBuilds.delete(configPath);
    log.info(`Detected change. Building ${filePath}...`);

    const sketchDirectory = path.dirname(configPath);

    buildSketch(sketchDirectory).tap((result) =>
      result.match({
        Ok: () => log.info(`Built ${filePath}`),
        Error: (err) => log.error('Build failed', { error: err.message, filePath }),
      })
    );

    compileSchemasForSketch(SKETCHES_DIR, sketchDirectory);
  }, DEBOUNCE_MS));
});

log.info(`Watching for changes in ${SKETCHES_DIR}`);
