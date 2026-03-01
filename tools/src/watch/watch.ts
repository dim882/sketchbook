import * as path from 'node:path';

import * as LibPaths from '../lib/paths';
import { buildSketch } from '../lib/build';
import { compileSchema, findSchemaFiles } from '../build/build-schemas';
import { findNearestConfig, makeWatcher } from './watch.utils';
import { installErrorHandlers } from '../lib/bootstrap';
import { createLogger } from '../lib/logger';

installErrorHandlers();

const SKETCHES_DIR = LibPaths.getSketchesDir();
const DEBOUNCE_MS = 300;
const log = createLogger('watch');
const pendingBuilds = new Map<string, NodeJS.Timeout>();
const watcher = makeWatcher(SKETCHES_DIR, log);

const compileSketchSchemas = (sketchDirectory: string): void => {
  const sketchName = path.relative(SKETCHES_DIR, sketchDirectory);
  const schemaFiles = findSchemaFiles(SKETCHES_DIR).filter(
    (file) => file.startsWith(sketchName + '/')
  );

  for (const schemaFile of schemaFiles) {
    compileSchema(SKETCHES_DIR, schemaFile).tap((result) =>
      result.match({
        Ok: (outputPath) => log.info(`Compiled schema: ${outputPath}`),
        Error: (error) => log.error('Schema compilation failed', { error: error.message }),
      })
    );
  }
};

// Compile all schemas on startup so they're available before any file changes
const compileAllSchemasOnStartup = async (): Promise<void> => {
  const schemaFiles = findSchemaFiles(SKETCHES_DIR);
  if (schemaFiles.length === 0) return;

  log.info(`Compiling ${schemaFiles.length} schema(s) on startup...`);
  for (const schemaFile of schemaFiles) {
    const result = await compileSchema(SKETCHES_DIR, schemaFile).toPromise();
    result.match({
      Ok: (outputPath) => log.info(`Compiled schema: ${outputPath}`),
      Error: (error) => log.error('Schema compilation failed', { error: error.message }),
    });
  }
};

compileAllSchemasOnStartup();

watcher.on('all', (_event, filePath) => {
  const configPath = findNearestConfig(path.dirname(filePath));

  if (configPath) {
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

      compileSketchSchemas(sketchDirectory);
    }, DEBOUNCE_MS));
  } else {
    log.debug(`No config found for: ${filePath}`);
  }
});

log.info(`Watching for changes in ${SKETCHES_DIR}`);
