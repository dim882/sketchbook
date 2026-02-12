import { execSync } from 'child_process';
import * as path from 'path';
import { Result } from '@swan-io/boxed';
import { createLogger } from './logger';

const log = createLogger('lib/build');

export const buildSketch = (sketchPath: string): Result<void, Error> => {
  log.info(`Building sketch: ${path.basename(sketchPath)}`);

  return Result.fromExecution(() => {
    execSync('rollup -c', {
      cwd: sketchPath,
      stdio: 'inherit',
    });
  });
};
