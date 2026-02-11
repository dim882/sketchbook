import * as fs from 'fs';
import * as path from 'path';
import * as LibPaths from '../lib/paths';
import * as LibBuild from '../lib/build';

const SKETCHES_DIR = LibPaths.getSketchesDir();
const EXCLUDED_DIRS = ['.git', 'node_modules'];

const getAllSketchDirectories = (directory: string): string[] => {
  if (!fs.existsSync(directory)) {
    return [];
  }

  const items = fs.readdirSync(directory, { withFileTypes: true });

  return items
    .filter((item) => item.isDirectory() && !EXCLUDED_DIRS.includes(item.name))
    .map((item) => path.join(directory, item.name));
};

const buildAllSketches = (): void => {
  const sketchDirectories = getAllSketchDirectories(SKETCHES_DIR);

  console.log(`Found ${sketchDirectories.length} sketches to build`);

  sketchDirectories.forEach(LibBuild.buildSketch);

  console.log('All sketches built successfully');
};

buildAllSketches();
