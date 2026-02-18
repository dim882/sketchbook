import * as fs from 'fs';
import * as path from 'path';
import { Result } from '@swan-io/boxed';
import * as LibPaths from '../lib/paths';
import { createLogger } from '../lib/logger';

const log = createLogger('move/utils');

export type MoveArgs = { sourcePath: string; targetPath: string };
export type MoveDirectories = { sourceDir: string; targetDir: string };

export function validateArgs(argv: string[]): Result<MoveArgs, string[]> {
  const sourcePath = argv[2];
  const targetPath = argv[3];
  const errors: string[] = [];

  if (!sourcePath) errors.push('<source> not provided');
  if (!targetPath) errors.push('<target> not provided');

  if (errors.length > 0) {
    return Result.Error(errors);
  }

  return Result.Ok({ sourcePath, targetPath });
}

export function getArgs(): MoveArgs {
  return validateArgs(process.argv).match({
    Ok: (args) => args,
    Error: (errors) => {
      log.error('Usage: pnpm move <source> <target>');
      errors.forEach((e) => log.error(e));
      process.exit(1);
    },
  });
}

export function validateDirectories(
  sourcePath: string,
  targetPath: string
): Result<MoveDirectories, string> {
  const sketchesDir = LibPaths.getSketchesDir();
  const sourceDir = path.join(sketchesDir, sourcePath);
  const targetDir = path.join(sketchesDir, targetPath);

  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    return Result.Error(`Source sketch directory not found: ${sourceDir}`);
  }

  if (!fs.existsSync(path.join(sourceDir, 'rollup.config.js'))) {
    return Result.Error(`Source is not a sketch (no rollup.config.js): ${sourceDir}`);
  }

  if (fs.existsSync(targetDir)) {
    return Result.Error(`Target directory already exists: ${targetDir}`);
  }

  return Result.Ok({ sourceDir, targetDir });
}

export function getDirectoryNames(sourcePath: string, targetPath: string): MoveDirectories {
  return validateDirectories(sourcePath, targetPath).match({
    Ok: (dirs) => dirs,
    Error: (msg) => {
      log.error(msg);
      process.exit(1);
    },
  });
}
