#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const excludedFiles = ['dist', 'node_modules', 'yarn.lock'];

const sourceDirName = process.argv[2];
const targetDirName = process.argv[3];

const sourceDir = path.join(__dirname, '../sketches', sourceDirName);
const targetDir = path.join(__dirname, '../sketches', targetDirName);

copyDirectory(sourceDir, targetDir);

console.log(`Sketch './sketches/${targetDirName}' created.`);

try {
  execSync(`cd ./sketches/${targetDirName} && yarn install && yarn watch`, { stdio: 'inherit' });
} catch (error) {
  console.error('Error executing shell command:', error);
}

function copyDirectory(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const sourcePath = path.join(source, file);

    // Replace base.html with ${dirName}.html and base.ts with ${dirName}.ts
    const targetPath = createTargetPath(file, target);

    if (!excludedFiles.includes(file)) {
      if (fs.statSync(sourcePath).isDirectory()) {
        copyDirectory(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  });
}

function createTargetPath(file, target) {
  let targetFileName = file.replace(/^base(\.html|\.ts)$/, `${targetDirName}$1`);

  return path.join(target, targetFileName);
}
