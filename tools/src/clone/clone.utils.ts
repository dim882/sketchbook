import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { Result } from '@swan-io/boxed';
import * as LibPaths from '../lib/paths';
import { createLogger } from '../lib/logger';

const log = createLogger('clone/utils');

const FILE_EXTENSIONS = ['.ts', '.js', '.html', '.css', '.md', '.json', '.config.js'];

export type Args = { sourceName: string; targetName: string };
export type Directories = { sourceDir: string; targetDir: string };

/** Pure validation - returns Result with error messages */
export function validateArgs(argv: string[]): Result<Args, string[]> {
  const sourceName = argv[2];
  const targetName = argv[3];
  const errors: string[] = [];

  if (!sourceName) errors.push('<source> not provided');
  if (!targetName) errors.push('<target> not provided');

  if (errors.length > 0) {
    return Result.Error(errors);
  }

  return Result.Ok({ sourceName, targetName });
}

/** Pure validation - returns Result with error message */
export function validateDirectories(
  sourceName: string,
  targetName: string
): Result<Directories, string> {
  const sketchesDir = LibPaths.getSketchesDir();
  const sourceDir = path.join(sketchesDir, sourceName);
  const targetDir = path.join(sketchesDir, targetName);

  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    return Result.Error(`Source sketch directory not found: ${sourceDir}`);
  }

  if (fs.existsSync(targetDir)) {
    return Result.Error(`Target sketch directory already exists: ${targetDir}`);
  }

  return Result.Ok({ sourceDir, targetDir });
}

/** Imperative wrapper for CLI - handles side effects */
export function getArgs(): Args {
  return validateArgs(process.argv).match({
    Ok: (args) => args,
    Error: (errors) => {
      log.error('Usage: pnpm clone <source> <target>');
      errors.forEach((e) => log.error(e));
      process.exit(1);
    },
  });
}

/** Imperative wrapper for CLI - handles side effects */
export function getDirectoryNames(sourceName: string, targetName: string): Directories {
  return validateDirectories(sourceName, targetName).match({
    Ok: (dirs) => dirs,
    Error: (msg) => {
      log.error(msg);
      process.exit(1);
    },
  });
}

interface ICreateTargetPathArgs {
  item: string;
  sourceName: string;
  targetDir: string;
  targetName: string;
}

export function createTargetPath({ item, sourceName, targetDir, targetName }: ICreateTargetPathArgs): string {
  return path.join(targetDir, createTargetName(item, sourceName, targetName));
}

function createTargetName(item: string, sourceName: string, targetName: string): string {
  const parsedPath = path.parse(item);

  return parsedPath.name.startsWith(sourceName)
    ? `${targetName}${parsedPath.name.substring(sourceName.length)}${parsedPath.ext}`
    : item;
}

export const isTextFile = (filePath: string) => FILE_EXTENSIONS.includes(path.extname(filePath));

export function replaceContentInFile(
  filePath: string,
  searchValue: string,
  replaceValue: string
): Result<{ changed: boolean }, Error> {
  return Result.fromExecution(() => {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replaceAll(searchValue, replaceValue);

    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      return { changed: true };
    }
    return { changed: false };
  });
}

export function setPackageName(
  packageJsonPath: string,
  targetName: string
): Result<void, Error> {
  return Result.fromExecution(() => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.name = targetName;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  });
}

export function install(targetDir: string): Result<void, Error> {
  log.info(`Running pnpm install in ${targetDir}...`);

  return Result.fromExecution(() => {
    execSync('pnpm install', { cwd: targetDir, stdio: 'inherit' });
  });
}

export function adjustRelativePaths(
  filePath: string,
  sourceDepth: number,
  targetDepth: number
): Result<{ changed: boolean }, Error> {
  const depthDiff = targetDepth - sourceDepth;
  if (depthDiff === 0) return Result.Ok({ changed: false });

  return Result.fromExecution(() => {
    const content = fs.readFileSync(filePath, 'utf8');
    const updatedContent = content.replace(
      /(['"])((\.\.\/)+)(lib\/)/g,
      (_match, quote, fullPrefix, _singleDotDot, lib) => {
        const currentDepth = fullPrefix.length / 3;
        const newDepth = Math.max(1, currentDepth + depthDiff);
        return `${quote}${'../'.repeat(newDepth)}${lib}`;
      }
    );

    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      return { changed: true };
    }
    return { changed: false };
  });
}

export function replaceHtmlTitle(
  filePath: string,
  newTitle: string
): Result<void, Error> {
  return Result.fromExecution(() => {
    fs.writeFileSync(
      filePath,
      fs.readFileSync(filePath, 'utf8').replace(/<title>.*?<\/title>/i, `<title>${newTitle}</title>`),
      'utf8'
    );
  });
}
