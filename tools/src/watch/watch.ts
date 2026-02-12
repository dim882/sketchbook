import * as chokidar from 'chokidar';
import * as path from 'node:path';
import { rollup, type RollupOptions, type OutputOptions } from '@rollup/wasm-node';
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

  // Add debug logging
  watcher
    .on('add', (filePath) => log.debug(`File ${filePath} has been added`))
    .on('change', (filePath) => log.debug(`File ${filePath} has been changed`))
    .on('unlink', (filePath) => log.debug(`File ${filePath} has been removed`))
    .on('error', (error) => log.error(`Watcher error`, { error: String(error) }))
    .on('ready', () => log.info('Initial scan complete. Ready for changes'));

  return watcher;
}

/**
 * Run rollup build for a config file.
 * Uses absolute paths to avoid process.chdir() race conditions.
 */
const runRollup = async (configPath: string): Promise<Result<void, Error>> => {
  try {
    // Convert relative input path to absolute
    const absoluteConfig = resolveConfigPaths(
      await getRollupConfig(configPath),
      path.dirname(configPath)
    );

    const bundle = await rollup(absoluteConfig);

    if (Array.isArray(absoluteConfig.output)) {
      for (const output of absoluteConfig.output) {
        await bundle.write(output);
      }
    } else if (absoluteConfig.output) {
      await bundle.write(absoluteConfig.output);
    }

    await bundle.close();

    return Result.Ok(undefined);
  } catch (error) {
    return Result.Error(error instanceof Error ? error : new Error(String(error)));
  }
};

/**
 * Resolve relative paths in rollup config to absolute paths.
 * This avoids the need for process.chdir() which is not thread-safe.
 */
function resolveConfigPaths(config: RollupOptions, configDir: string): RollupOptions {
  const resolvedConfig: RollupOptions = { ...config };

  // Resolve input path
  if (typeof config.input === 'string' && !path.isAbsolute(config.input)) {
    resolvedConfig.input = path.resolve(configDir, config.input);
  } else if (Array.isArray(config.input)) {
    resolvedConfig.input = config.input.map((input) =>
      path.isAbsolute(input) ? input : path.resolve(configDir, input)
    );
  } else if (typeof config.input === 'object' && config.input !== null) {
    resolvedConfig.input = Object.fromEntries(
      Object.entries(config.input).map(([key, value]) => [
        key,
        path.isAbsolute(value) ? value : path.resolve(configDir, value),
      ])
    );
  }

  // Resolve output paths
  if (config.output) {
    const resolveOutput = (output: OutputOptions): OutputOptions => {
      const resolved: OutputOptions = { ...output };
      if (output.dir && !path.isAbsolute(output.dir)) {
        resolved.dir = path.resolve(configDir, output.dir);
      }
      if (output.file && !path.isAbsolute(output.file)) {
        resolved.file = path.resolve(configDir, output.file);
      }
      return resolved;
    };

    if (Array.isArray(config.output)) {
      resolvedConfig.output = config.output.map(resolveOutput);
    } else {
      resolvedConfig.output = resolveOutput(config.output);
    }
  }

  return resolvedConfig;
}

/**
 * Load rollup config from file with cache busting.
 * Adding a timestamp query param forces Node to reload the module.
 */
async function getRollupConfig(configPath: string): Promise<RollupOptions> {
  // Cache bust by adding timestamp to URL
  const configModule = (await import(`${configPath}?update=${Date.now()}`)) as
    | { default?: RollupOptions }
    | RollupOptions;

  // Config can be exported as default or as the module itself
  return 'default' in configModule && configModule.default
    ? configModule.default
    : (configModule as RollupOptions);
}
