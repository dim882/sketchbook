import { spawn } from 'child_process';
import * as path from 'path';
import { Future, Result } from '@swan-io/boxed';
import { createLogger } from './logger';

const log = createLogger('lib/build');

export const buildSketch = (sketchPath: string): Future<Result<void, Error>> => {
  log.info(`Building sketch: ${path.basename(sketchPath)}`);

  return Future.fromPromise(
    new Promise<void>((resolve, reject) => {
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
          resolve();
        } else {
          reject(new Error(stderr || `Rollup exited with code ${code}`));
        }
      });

      child.on('error', reject);
    })
  ).mapError((err): Error => (err instanceof Error ? err : new Error(String(err))));
};
