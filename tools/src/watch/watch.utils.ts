import * as fs from 'node:fs';
import * as path from 'node:path';
import * as chokidar from 'chokidar';
import type { Logger } from '../lib/logger';

export const findNearestConfig = (dir: string): string | null => {
  const configPath = path.join(dir, 'rollup.config.js');

  return fs.existsSync(configPath)
    ? configPath
    : dir === path.parse(dir).root
    ? null
    : findNearestConfig(path.dirname(dir));
};

export const makeWatcher = (dir: string, log: Logger) => {
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
};
