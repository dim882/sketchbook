import fs from 'fs-extra';
import path from 'path';

const sketchName = process.argv[2];
if (!sketchName) {
  console.error('Please provide a sketch name');
  process.exit(1);
}

const libPath = path.resolve(__dirname, '..', 'lib');
const sketchLibPath = path.resolve(__dirname, '..', 'sketches', sketchName, 'lib');

fs.copy(libPath, sketchLibPath, {
  overwrite: true,
  filter: (src: string) => !src.endsWith('package.json'),
})
  .then(() => console.log(`Copied lib to ${sketchName}`))
  .catch((err: Error) => console.error(`Error copying lib to ${sketchLibPath}:`, err));
