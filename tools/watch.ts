import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fs from 'fs';
import { rollup, RollupOptions } from '@rollup/wasm-node';

const sketchesDir = path.resolve(__dirname, '../sketches');

const logError = (error: any) => {
  console.error('Error occurred:', error);
};

const runRollup = async (configPath: string) => {
  const originalCwd = process.cwd();

  try {
    const dir = path.dirname(configPath);
    process.chdir(dir);

    const configModule = await import(configPath);
    const config: RollupOptions = configModule.default || configModule;
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

const watchOptions = {
  ignored: [/node_modules/, /\.DS_Store/],
  persistent: true,
  ignoreInitial: true,
};

const watchPaths = [sketchesDir, path.join(sketchesDir, './lib')];

const watcher = chokidar.watch(watchPaths, watchOptions);

const findNearestConfig = (dir: string): string | null => {
  const configPath = path.join(dir, 'rollup.config.js');
  return fs.existsSync(configPath)
    ? configPath
    : dir === path.parse(dir).root
    ? null
    : findNearestConfig(path.dirname(dir));
};

watcher.on('all', (event, filePath) => {
  const configPath = findNearestConfig(path.dirname(filePath));
  if (configPath) {
    console.log(`Detected change. Running rollup for ${path.dirname(configPath)}...`);
    runRollup(configPath)
      .then(() => console.log(`Rollup completed for ${path.dirname(configPath)}`))
      .catch(logError);
  }
});

console.log(`Watching for changes in ${sketchesDir}`);
