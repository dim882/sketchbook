import fs from 'fs-extra';
import * as path from 'path';
import { Future, Result } from '@swan-io/boxed';
import * as LibPaths from './lib/paths';

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
    console.error(msg);
    process.exit(1);
  },
});

const libPath = LibPaths.getLibDir();
const sketchLibPath = path.join(LibPaths.getSketchesDir(), sketchName, 'lib');

Future.fromPromise(
  fs.copy(libPath, sketchLibPath, {
    overwrite: true,
    filter: (src: string) => !src.endsWith('package.json'),
  })
)
  .mapError((err): Error => (err instanceof Error ? err : new Error(String(err))))
  .tap((result) =>
    result.match({
      Ok: () => console.log(`Copied lib to ${sketchName}`),
      Error: (err) => {
        console.error(`Error copying lib to ${sketchLibPath}:`, err.message);
        process.exit(1);
      },
    })
  );
