import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SKETCHES_DIR = path.resolve(process.cwd(), '../sketches');
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

const buildSketch = (sketchPath: string): void => {
  try {
    console.log(`Building sketch: ${path.basename(sketchPath)}`);

    execSync('rollup -c', {
      cwd: sketchPath,
      stdio: 'inherit',
    });
  } catch (error) {
    console.error(`Error building sketch ${path.basename(sketchPath)}:`, error);
  }
};

const buildAllSketches = (): void => {
  const sketchDirectories = getAllSketchDirectories(SKETCHES_DIR);

  console.log(`Found ${sketchDirectories.length} sketches to build`);

  sketchDirectories.forEach(buildSketch);

  console.log('All sketches built successfully');
};

buildAllSketches();
