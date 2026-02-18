#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { Result } from '@swan-io/boxed';
import * as MoveUtils from './move.utils';
import * as CloneUtils from '../clone/clone.utils';
import { installErrorHandlers } from '../lib/bootstrap';
import { createLogger } from '../lib/logger';

installErrorHandlers();
const log = createLogger('move');

const { sourcePath, targetPath } = MoveUtils.getArgs();
const { sourceDir, targetDir } = MoveUtils.getDirectoryNames(sourcePath, targetPath);

const sourceLeafName = path.basename(sourcePath);
const targetLeafName = path.basename(targetPath);
const sourceDepth = sourcePath.split('/').length;
const targetDepth = targetPath.split('/').length;

const errors: Error[] = [];

const collectError = <T>(result: Result<T, Error>, context: string): void => {
  result.match({
    Ok: () => { },
    Error: (err) => {
      errors.push(err);
      log.error(context, { error: err.message });
    },
  });
};

const main = () => {
  // Create parent directories for target
  const targetParent = path.dirname(targetDir);
  if (!fs.existsSync(targetParent)) {
    fs.mkdirSync(targetParent, { recursive: true });
  }

  // Move the directory
  fs.renameSync(sourceDir, targetDir);
  log.info(`Moved ${sourcePath} -> ${targetPath}`);

  // Rename files if leaf name changed
  if (sourceLeafName !== targetLeafName) {
    renameSketchFiles(targetDir, sourceLeafName, targetLeafName);
  }

  // Adjust relative lib paths in rollup.config.js if depth changed
  if (sourceDepth !== targetDepth) {
    const rollupConfig = path.join(targetDir, 'rollup.config.js');
    if (fs.existsSync(rollupConfig)) {
      collectError(
        CloneUtils.adjustRelativePaths(rollupConfig, sourceDepth, targetDepth),
        'Failed to adjust relative paths in rollup.config.js'
      );
    }
  }

  // Update HTML paths (/sketches/old-path/ -> /sketches/new-path/)
  updateHtmlPaths(targetDir);

  // Update package.json name
  const packageJson = path.join(targetDir, 'package.json');
  if (fs.existsSync(packageJson)) {
    collectError(
      CloneUtils.setPackageName(packageJson, targetLeafName),
      'Failed to update package.json name'
    );
  }

  // Replace content references (source leaf name -> target leaf name)
  if (sourceLeafName !== targetLeafName) {
    updateContentReferences(path.join(targetDir, 'src'));
    const rollupConfig = path.join(targetDir, 'rollup.config.js');
    if (fs.existsSync(rollupConfig)) {
      collectError(
        CloneUtils.replaceContentInFile(rollupConfig, sourceLeafName, targetLeafName),
        'Failed to update rollup.config.js references'
      );
    }
  }

  // Clean and rebuild
  const distDir = path.join(targetDir, 'dist');
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true });
    log.info('Cleaned dist directory');
  }

  // Clean up empty parent directories from the source
  cleanEmptyParents(path.dirname(sourceDir));

  if (errors.length > 0) {
    log.error(`Move completed with ${errors.length} error(s).`, { errorCount: errors.length });
    process.exit(1);
  }

  log.info(`Sketch moved to './sketches/${targetPath}' successfully.`);
  log.info(`Run 'pnpm install' then rebuild with 'pnpm build' or start the dev server.`);
};

main();

function renameSketchFiles(dir: string, oldLeaf: string, newLeaf: string) {
  const srcDir = path.join(dir, 'src');
  if (!fs.existsSync(srcDir)) return;

  fs.readdirSync(srcDir).forEach((item) => {
    if (item.startsWith(oldLeaf)) {
      const newName = `${newLeaf}${item.substring(oldLeaf.length)}`;
      fs.renameSync(path.join(srcDir, item), path.join(srcDir, newName));
      log.info(`Renamed src/${item} -> src/${newName}`);
    }
  });
}

function updateHtmlPaths(dir: string) {
  const srcDir = path.join(dir, 'src');
  if (!fs.existsSync(srcDir)) return;

  fs.readdirSync(srcDir).forEach((item) => {
    if (path.extname(item) === '.html') {
      const filePath = path.join(srcDir, item);
      collectError(
        CloneUtils.replaceContentInFile(filePath, `/sketches/${sourcePath}/`, `/sketches/${targetPath}/`),
        `Failed to update HTML paths in ${filePath}`
      );
      if (sourceLeafName !== targetLeafName) {
        collectError(
          CloneUtils.replaceHtmlTitle(filePath, targetLeafName),
          `Failed to update HTML title in ${filePath}`
        );
      }
    }
  });
}

function updateContentReferences(dir: string) {
  if (!fs.existsSync(dir)) return;

  fs.readdirSync(dir).forEach((item) => {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);

    if (stats.isDirectory()) {
      updateContentReferences(fullPath);
    } else if (stats.isFile() && CloneUtils.isTextFile(fullPath)) {
      collectError(
        CloneUtils.replaceContentInFile(fullPath, sourceLeafName, targetLeafName),
        `Failed to update references in ${fullPath}`
      );
    }
  });
}

function cleanEmptyParents(dir: string) {
  const sketchesDir = path.resolve(sourceDir, ...Array(sourcePath.split('/').length).fill('..'));
  let current = dir;

  while (current.length > sketchesDir.length) {
    try {
      const contents = fs.readdirSync(current);
      if (contents.length === 0) {
        fs.rmdirSync(current);
        log.info(`Removed empty directory: ${path.relative(process.cwd(), current)}`);
        current = path.dirname(current);
      } else {
        break;
      }
    } catch {
      break;
    }
  }
}
