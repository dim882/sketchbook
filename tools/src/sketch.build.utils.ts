import { execSync } from 'child_process';
import path from 'path';

export const buildSketch = (sketchPath: string): void => {
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
