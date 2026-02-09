import { execSync } from 'child_process';
import path from 'path';
import { Result } from '@swan-io/boxed';

export const buildSketch = (sketchPath: string): Result<void, Error> => {
  console.log(`Building sketch: ${path.basename(sketchPath)}`);

  return Result.fromExecution(() => {
    execSync('rollup -c', {
      cwd: sketchPath,
      stdio: 'inherit',
    });
  });
};
