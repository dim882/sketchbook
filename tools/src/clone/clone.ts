#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { Result } from '@swan-io/boxed';
import * as LibBuild from '../lib/build';
import * as CloneUtils from './clone.utils';
import { installErrorHandlers } from '../lib/bootstrap';
import { createLogger } from '../lib/logger';

installErrorHandlers();
const log = createLogger('clone');

const EXCLUDED_FILES = ['dist', 'node_modules', 'yarn.lock', '.DS_Store'];

const { sourceName, targetName } = CloneUtils.getArgs();
const { sourceDir, targetDir } = CloneUtils.getDirectoryNames(sourceName, targetName);

const sourceLeafName = path.basename(sourceName);
const targetLeafName = path.basename(targetName);

// Track errors during clone
const errors: Error[] = [];

/** Collect errors from Result, logging failures */
const collectError = <T>(result: Result<T, Error>, context: string): void => {
  result.match({
    Ok: () => { },
    Error: (err) => {
      errors.push(err);
      log.error(context, { error: err.message });
    },
  });
};

const sourceDepth = sourceName.split('/').length;
const targetDepth = targetName.split('/').length;

const main = async () => {
  copyDir(sourceDir, targetDir);

  // Adjust relative paths in rollup.config.js for different nesting depth
  const rollupConfig = path.join(targetDir, 'rollup.config.js');
  if (fs.existsSync(rollupConfig)) {
    collectError(
      CloneUtils.adjustRelativePaths(rollupConfig, sourceDepth, targetDepth),
      'Failed to adjust relative paths in rollup.config.js'
    );
  }

  // Adjust relative paths in HTML files for dist references
  adjustHtmlPaths(targetDir);

  // Install dependencies
  collectError(CloneUtils.install(targetDir), 'Failed to install dependencies');
  if (errors.length === 0) {
    log.info(`Sketch './sketches/${targetName}' created successfully.`);
  }

  // Build sketch
  collectError(await LibBuild.buildSketch(targetDir), 'Failed to build sketch');
  if (errors.length === 0) {
    log.info(`Sketch './sketches/${targetName}' built successfully.`);
  }

  // Report final status
  if (errors.length > 0) {
    log.error(`Clone completed with ${errors.length} error(s).`, { errorCount: errors.length });
    process.exit(1);
  }
};

main();

function adjustHtmlPaths(dir: string) {
  // After copyDir, HTML content has had sourceLeafName → targetLeafName applied.
  // So /sketches/base/dist/ became /sketches/base2/dist/ (not /sketches/nested/base2/dist/).
  // Compute the intermediate path to find and replace it with the correct full path.
  const segments = sourceName.split('/');
  segments[segments.length - 1] = targetLeafName;
  const intermediateSourcePath = segments.join('/');

  if (intermediateSourcePath === targetName) return;

  fs.readdirSync(dir).forEach((item) => {
    const fullPath = path.join(dir, item);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory() && item !== 'node_modules' && item !== 'dist') {
      adjustHtmlPaths(fullPath);
    } else if (stats.isFile() && path.extname(fullPath) === '.html') {
      collectError(
        CloneUtils.replaceContentInFile(fullPath, `/sketches/${intermediateSourcePath}/`, `/sketches/${targetName}/`),
        `Failed to adjust HTML paths in ${fullPath}`
      );
    }
  });
}

function copyDir(source: string, targetDir: string) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  fs.readdirSync(source).forEach((item) => {
    if (EXCLUDED_FILES.includes(item)) {
      return;
    }

    const sourcePath = path.join(source, item);
    const targetPath = CloneUtils.createTargetPath({ item, targetDir, sourceName: sourceLeafName, targetName: targetLeafName });
    const stats = fs.statSync(sourcePath);

    if (stats.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else if (stats.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);

      if (path.basename(targetPath) === 'package.json') {
        collectError(CloneUtils.setPackageName(targetPath, targetLeafName), 'Failed to update package.json');
      } else if (path.extname(targetPath) === '.html') {
        collectError(CloneUtils.replaceContentInFile(targetPath, sourceLeafName, targetLeafName), `Failed to replace content in ${targetPath}`);
        collectError(CloneUtils.replaceHtmlTitle(targetPath, targetLeafName), `Failed to update HTML title in ${targetPath}`);
      } else if (CloneUtils.isTextFile(targetPath)) {
        collectError(CloneUtils.replaceContentInFile(targetPath, sourceLeafName, targetLeafName), `Failed to replace content in ${targetPath}`);
      }
    }
  });
}
