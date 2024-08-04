import * as chokidar from 'chokidar';
import * as path from 'path';
import * as fs from 'fs';
import { rollup, RollupOptions } from '@rollup/wasm-node';

const sketchesDir = path.resolve(__dirname, '../sketches');

const watchOptions = {
  ignored: /node_modules/,
  persistent: true,
  ignoreInitial: true,
};

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

const watcher = chokidar.watch(sketchesDir, watchOptions);

watcher.on('all', (event, filePath) => {
  const dir = path.dirname(filePath);
  const configPath = path.join(dir, 'rollup.config.js');

  if (fs.existsSync(configPath)) {
    console.log(`Detected change in ${dir}. Running rollup...`);

    runRollup(configPath)
      .then(() => {
        console.log(`Rollup completed for ${dir}`);
      })
      .catch(logError);
  }
});

console.log(`Watching for changes in ${sketchesDir}`);
