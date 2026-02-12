import * as chokidar from 'chokidar';
import * as path from 'node:path';
import { spawn } from 'node:child_process';
import { Result } from '@swan-io/boxed';

import * as LibPaths from '../lib/paths';
import * as WatchUtils from './watch.utils';
import { installErrorHandlers } from '../lib/bootstrap';
import { createLogger } from '../lib/logger';

installErrorHandlers();
const log = createLogger('watch');

const SKETCHES_DIR = LibPaths.getSketchesDir();

// Debounce settings
const DEBOUNCE_MS = 300;
const pendingBuilds = new Map<string, NodeJS.Timeout>();

const watcher = makeWatcher(SKETCHES_DIR);

watcher.on('all', (_event, filePath) => {
  const configPath = WatchUtils.findNearestConfig(path.dirname(filePath));

  if (configPath) {
    // Debounce: cancel pending build for this config and schedule a new one
    clearTimeout(pendingBuilds.get(configPath));

    pendingBuilds.set(configPath, setTimeout(() => {
      pendingBuilds.delete(configPath);
      log.info(`Detected change. Building ${filePath}...`);

      // runRollup catches all errors and returns Result.Error, so no .catch needed
      runRollup(configPath).then((result) =>
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

function makeWatcher(dir: string) {
  const watchOptions = {
    ignored: [/node_modules/, /\.DS_Store/, /dist/],
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 500,
      pollInterval: 100,
    },
    usePolling: true,
    alwaysStat: true,
    depth: 99,
  };
  const watcher = chokidar.watch([dir, path.join(dir, './**/*')], watchOptions);

  watcher
    .on('add', (filePath) => log.debug(`File ${filePath} has been added`))
    .on('change', (filePath) => log.debug(`File ${filePath} has been changed`))
    .on('unlink', (filePath) => log.debug(`File ${filePath} has been removed`))
    .on('error', (error) => log.error(`Watcher error`, { error: String(error) }))
    .on('ready', () => log.info('Initial scan complete. Ready for changes'));

  return watcher;
}

/**
 * Run rollup build for a config file using child process.
 * This ensures full plugin compatibility by using the sketch's own rollup installation.
 */
const runRollup = (configPath: string): Promise<Result<void, Error>> => {
  return new Promise((resolve) => {
    const cwd = path.dirname(configPath);
    const child = spawn('npx', ['rollup', '-c'], {
      cwd,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(Result.Ok(undefined));
      } else {
        resolve(Result.Error(new Error(stderr || `Rollup exited with code ${code}`)));
      }
    });

    child.on('error', (err) => {
      resolve(Result.Error(err));
    });
  });
};
