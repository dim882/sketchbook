#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { Result } from '@swan-io/boxed';
import * as LibBuild from '../lib/build';
import * as CloneUtils from './clone.utils';

const EXCLUDED_FILES = ['dist', 'node_modules', 'yarn.lock', '.DS_Store'];

const { sourceName, targetName } = CloneUtils.getArgs();
const { sourceDir, targetDir } = CloneUtils.getDirectoryNames(sourceName, targetName);

// Track errors during clone
const errors: Error[] = [];

/** Collect errors from Result, logging failures */
const collectError = <T>(result: Result<T, Error>, context: string): void => {
  result.match({
    Ok: () => { },
    Error: (err) => {
      errors.push(err);
      console.error(`${context}: ${err.message}`);
    },
  });
};

copyDir(sourceDir, targetDir);

// Install dependencies
collectError(CloneUtils.install(targetDir), 'Failed to install dependencies');
if (errors.length === 0) {
  console.log(`Sketch './sketches/${targetName}' created successfully.`);
}

// Build sketch
collectError(LibBuild.buildSketch(targetDir), 'Failed to build sketch');
if (errors.length === 0) {
  console.log(`Sketch './sketches/${targetName}' built successfully.`);
}

// Report final status
if (errors.length > 0) {
  console.error(`\nClone completed with ${errors.length} error(s).`);
  process.exit(1);
}

function copyDir(source: string, target: string) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const items = fs.readdirSync(source);

  items.forEach((item) => {
    if (EXCLUDED_FILES.includes(item)) {
      return;
    }

    const sourcePath = path.join(source, item);
    const targetPath = CloneUtils.createTargetPath({ item, targetDir: target, sourceName, targetName });
    const stats = fs.statSync(sourcePath);

    if (stats.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else if (stats.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);

      if (path.basename(targetPath) === 'package.json') {
        collectError(CloneUtils.setPackageName(targetPath, targetName), 'Failed to update package.json');
      } else if (path.extname(targetPath) === '.html') {
        collectError(CloneUtils.replaceHtmlTitle(targetPath, targetName), `Failed to update HTML title in ${targetPath}`);
        collectError(CloneUtils.replaceContentInFile(targetPath, sourceName, targetName), `Failed to replace content in ${targetPath}`);
      } else if (CloneUtils.isTextFile(targetPath)) {
        collectError(CloneUtils.replaceContentInFile(targetPath, sourceName, targetName), `Failed to replace content in ${targetPath}`);
      }
    }
  });
}
