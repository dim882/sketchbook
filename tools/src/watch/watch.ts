import * as path from 'node:path';

import * as LibPaths from '../lib/paths';
import { buildSketch } from '../lib/build';
import { findNearestConfig, makeWatcher } from './watch.utils';
import { installErrorHandlers } from '../lib/bootstrap';
import { createLogger } from '../lib/logger';

installErrorHandlers();
const log = createLogger('watch');

const SKETCHES_DIR = LibPaths.getSketchesDir();

// Debounce settings
const DEBOUNCE_MS = 300;
const pendingBuilds = new Map<string, NodeJS.Timeout>();

const watcher = makeWatcher(SKETCHES_DIR, log);

watcher.on('all', (_event, filePath) => {
  const configPath = findNearestConfig(path.dirname(filePath));

  if (configPath) {
    // Debounce: cancel pending build for this config and schedule a new one
    clearTimeout(pendingBuilds.get(configPath));

    pendingBuilds.set(configPath, setTimeout(() => {
      pendingBuilds.delete(configPath);
      log.info(`Detected change. Building ${filePath}...`);

      buildSketch(path.dirname(configPath)).tap((result) =>
        result.match({
          Ok: () => log.info(`Built ${filePath}`),
          Error: (err) => log.error('Build failed', { error: err.message, filePath }),
        })
      );
    }, DEBOUNCE_MS));
  } else {
    log.debug(`No config found for: ${filePath}`);
  }
});

log.info(`Watching for changes in ${SKETCHES_DIR}`);
