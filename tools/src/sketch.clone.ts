#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { buildSketch } from './utils/sketch.build.utils';
import * as utils from './utils/sketch.clone.utils';

const EXCLUDED_FILES = ['dist', 'node_modules', 'yarn.lock', '.DS_Store'];

const { sourceName, targetName } = utils.getArgs();
const { sourceDir, targetDir } = utils.getDirectoryNames(sourceName, targetName);

// Track errors during clone
const errors: Error[] = [];

copyDir(sourceDir, targetDir);

// Install dependencies
const installResult = utils.install(targetDir);
installResult.match({
  Ok: () => console.log(`Sketch './sketches/${targetName}' created successfully.`),
  Error: (err) => {
    errors.push(err);
    console.error('Failed to install dependencies:', err.message);
  },
});

// Build sketch
const buildResult = buildSketch(targetDir);
buildResult.match({
  Ok: () => console.log(`Sketch './sketches/${targetName}' built successfully.`),
  Error: (err) => {
    errors.push(err);
    console.error('Failed to build sketch:', err.message);
  },
});

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
    const targetPath = utils.createTargetPath(item, target, sourceName, targetName);
    const stats = fs.statSync(sourcePath);

    if (stats.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else if (stats.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);

      const baseName = path.basename(targetPath);
      const extName = path.extname(targetPath);

      if (baseName === 'package.json') {
        utils.setPackageName(targetPath, targetName).match({
          Ok: () => { },
          Error: (err) => {
            errors.push(err);
            console.error(`Failed to update package.json: ${err.message}`);
          },
        });
      } else if (extName === '.html') {
        utils.replaceHtmlTitle(targetPath, targetName).match({
          Ok: () => { },
          Error: (err) => {
            errors.push(err);
            console.error(`Failed to update HTML title in ${targetPath}: ${err.message}`);
          },
        });
        utils.replaceContentInFile(targetPath, sourceName, targetName).match({
          Ok: () => { },
          Error: (err) => {
            errors.push(err);
            console.error(`Failed to replace content in ${targetPath}: ${err.message}`);
          },
        });
      } else if (utils.isTextFile(targetPath)) {
        utils.replaceContentInFile(targetPath, sourceName, targetName).match({
          Ok: () => { },
          Error: (err) => {
            errors.push(err);
            console.error(`Failed to replace content in ${targetPath}: ${err.message}`);
          },
        });
      }
    }
  });
}
