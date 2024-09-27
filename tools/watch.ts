import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fs from 'fs';
import { rollup, RollupOptions } from '@rollup/wasm-node';

const ROOT_DIR = path.resolve(__dirname, '../');
const SKETCHES_DIR = path.join(ROOT_DIR, 'sketches');

const watcher = makeWatcher(SKETCHES_DIR);

watcher.on('all', (event, filePath) => {
  const configPath = findNearestConfig(path.dirname(filePath));

  if (configPath) {
    console.log(`Detected change. Running rollup for ${path.dirname(configPath)}...`);

    runRollup(configPath)
      .then(() => console.log(`Rollup completed for ${path.dirname(configPath)}`))
      .catch(logError);
  }
});

console.log(`Watching for changes in ${SKETCHES_DIR}`);

function makeWatcher(dir: string) {
  const watchOptions = {
    ignored: [/node_modules/, /\.DS_Store/, /dist/],
    persistent: true,
    ignoreInitial: true,
  };
  const watchPaths = [dir, path.join(dir, './**/*')];

  return chokidar.watch(watchPaths, watchOptions);
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
    console.log({ config });

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
