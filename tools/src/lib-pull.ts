import fs from 'fs-extra';
import * as path from 'path';
import * as LibPaths from './lib/paths';

const sketchName = process.argv[2];
if (!sketchName) {
  console.error('Please provide a sketch name');
  process.exit(1);
}

const libPath = LibPaths.getLibDir();
const sketchLibPath = path.join(LibPaths.getSketchesDir(), sketchName, 'lib');

fs.copy(libPath, sketchLibPath, {
  overwrite: true,
  filter: (src: string) => !src.endsWith('package.json'),
})
  .then(() => console.log(`Copied lib to ${sketchName}`))
  .catch((err: Error) => console.error(`Error copying lib to ${sketchLibPath}:`, err));
