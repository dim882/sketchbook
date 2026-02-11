import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { Result } from '@swan-io/boxed';
import * as LibPaths from '../lib/paths';

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
      console.error('Usage: pnpm clone <source> <target>');
      errors.forEach((e) => console.error(e));
      process.exit(1);
    },
  });
}

/** Imperative wrapper for CLI - handles side effects */
export function getDirectoryNames(sourceName: string, targetName: string): Directories {
  return validateDirectories(sourceName, targetName).match({
    Ok: (dirs) => dirs,
    Error: (msg) => {
      console.error(msg);
      process.exit(1);
    },
  });
}

export function createTargetPath(
  item: string,
  targetDir: string,
  sourceName: string,
  targetName: string
): string {
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
  console.log(`Running pnpm install in ${targetDir}...`);

  return Result.fromExecution(() => {
    execSync('pnpm install', { cwd: targetDir, stdio: 'inherit' });
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
