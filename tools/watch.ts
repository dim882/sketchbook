import * as chokidar from 'chokidar';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { rollup, type RollupOptions } from '@rollup/wasm-node';

const ROOT_DIR = path.resolve(__dirname, '../');
const SKETCHES_DIR = path.join(ROOT_DIR, 'sketches');

const watcher = makeWatcher(SKETCHES_DIR);

watcher.on('all', (event, filePath) => {
  const configPath = findNearestConfig(path.dirname(filePath));

  if (configPath) {
    console.log(`Detected change. Building ${filePath}...`);

    runRollup(configPath)
      .then(() => console.log(`Built ${filePath}`))
      .catch(logError);
  } else {
    console.log(`No config found: ${configPath}`);
  }
});

console.log(`Watching for changes in ${SKETCHES_DIR}`);

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
  const watchPaths = [dir, path.join(dir, './**/*')];

  const watcher = chokidar.watch(watchPaths, watchOptions);

  // Add debug logging
  watcher
    .on('add', (filePath) => console.log(`File ${filePath} has been added`))
    .on('change', (filePath) => console.log(`File ${filePath} has been changed`))
    .on('unlink', (filePath) => console.log(`File ${filePath} has been removed`))
    .on('error', (error) => console.error(`Watcher error: ${error}`))
    .on('ready', () => console.log('Initial scan complete. Ready for changes'));

  return watcher;
}

const findNearestConfig = (dir: string): string | null => {
  const configPath = path.join(dir, 'rollup.config.js');

  return fs.existsSync(configPath)
    ? configPath
    : dir === path.parse(dir).root
    ? null
    : findNearestConfig(path.dirname(dir));
};

const runRollup = async (configPath: string) => {
  const originalCwd = process.cwd();

  try {
    process.chdir(path.dirname(configPath));

    const config: RollupOptions = await getRollupConfig(configPath);

    const bundle = await rollup(config);

    if (Array.isArray(config.output)) {
      for (const output of config.output) {
        await bundle.write(output);
      }
    } else if (config.output) {
      await bundle.write(config.output);
    }
  } catch (error) {
    logError(error);
  } finally {
    process.chdir(originalCwd);
  }
};

const logError = (error: any) => {
  console.error('Error occurred:', error);
};

async function getRollupConfig(configPath: string): Promise<RollupOptions> {
  const configModule = await import(configPath);

  return configModule.default || configModule;
}
