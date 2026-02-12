import { spawn } from 'child_process';
import * as path from 'path';
import { Result } from '@swan-io/boxed';
import { createLogger } from './logger';

const log = createLogger('lib/build');

export const buildSketch = (sketchPath: string): Promise<Result<void, Error>> => {
  log.info(`Building sketch: ${path.basename(sketchPath)}`);

  return new Promise((resolve) => {
    const child = spawn('npx', ['rollup', '-c'], {
      cwd: sketchPath,
      shell: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stderr = '';
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(Result.Ok(undefined));
      } else {
        resolve(Result.Error(new Error(stderr || `Rollup exited with code ${code}`)));
      }
    });

    child.on('error', (err) => {
      resolve(Result.Error(err));
    });
  });
};
