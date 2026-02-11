#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import * as LibBuild from '../lib/build';
import * as CloneUtils from './clone.utils';

const EXCLUDED_FILES = ['dist', 'node_modules', 'yarn.lock', '.DS_Store'];

const { sourceName, targetName } = CloneUtils.getArgs();
const { sourceDir, targetDir } = CloneUtils.getDirectoryNames(sourceName, targetName);

// Track errors during clone
const errors: Error[] = [];

copyDir(sourceDir, targetDir);

// Install dependencies
CloneUtils.install(targetDir).match({
  Ok: () => console.log(`Sketch './sketches/${targetName}' created successfully.`),
  Error: (err) => {
    errors.push(err);
    console.error('Failed to install dependencies:', err.message);
  },
});

// Build sketch
LibBuild.buildSketch(targetDir).match({
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
    const targetPath = CloneUtils.createTargetPath(item, target, sourceName, targetName);
    const stats = fs.statSync(sourcePath);

    if (stats.isDirectory()) {
      copyDir(sourcePath, targetPath);
    } else if (stats.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);

      const baseName = path.basename(targetPath);
      const extName = path.extname(targetPath);

      if (baseName === 'package.json') {
        CloneUtils.setPackageName(targetPath, targetName).match({
          Ok: () => { },
          Error: (err) => {
            errors.push(err);
            console.error(`Failed to update package.json: ${err.message}`);
          },
        });
      } else if (extName === '.html') {
        CloneUtils.replaceHtmlTitle(targetPath, targetName).match({
          Ok: () => { },
          Error: (err) => {
            errors.push(err);
            console.error(`Failed to update HTML title in ${targetPath}: ${err.message}`);
          },
        });
        CloneUtils.replaceContentInFile(targetPath, sourceName, targetName).match({
          Ok: () => { },
          Error: (err) => {
            errors.push(err);
            console.error(`Failed to replace content in ${targetPath}: ${err.message}`);
          },
        });
      } else if (CloneUtils.isTextFile(targetPath)) {
        CloneUtils.replaceContentInFile(targetPath, sourceName, targetName).match({
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
