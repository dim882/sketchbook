import fs from 'fs-extra';
import * as path from 'path';
import { Future, Result } from '@swan-io/boxed';
import * as LibPaths from './lib/paths';
import { installErrorHandlers } from './lib/bootstrap';
import { createLogger } from './lib/logger';

installErrorHandlers();
const log = createLogger('lib-pull');

/** Pure validation */
function validateArgs(argv: string[]): Result<string, string> {
  const sketchName = argv[2];
  if (!sketchName) {
    return Result.Error('Please provide a sketch name');
  }
  return Result.Ok(sketchName);
}

/** Imperative shell - entry point */
const sketchName = validateArgs(process.argv).match({
  Ok: (name) => name,
  Error: (msg) => {
    log.error(msg);
    process.exit(1);
  },
});

const sketchLibPath = path.join(LibPaths.getSketchesDir(), sketchName, 'lib');

Future.fromPromise(
  fs.copy(LibPaths.getLibDir(), sketchLibPath, {
    overwrite: true,
    filter: (src: string) => !src.endsWith('package.json'),
  })
)
  .mapError((err): Error => (err instanceof Error ? err : new Error(String(err))))
  .tap((result) =>
    result.match({
      Ok: () => log.info(`Copied lib to ${sketchName}`),
      Error: (err) => {
        log.error(`Error copying lib to ${sketchLibPath}`, { error: err.message });
        process.exit(1);
      },
    })
  );
