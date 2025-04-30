#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { createTargetPath, install, isTextFile, replaceContentInFile, setPackageName } from './clone.utils';

const excludedFiles = ['dist', 'node_modules', 'yarn.lock', '.DS_Store'];

const sourceName = process.argv[2];
const targetName = process.argv[3];

if (!sourceName || !targetName) {
  console.error('Usage: pnpm scaffold <source-sketch-name> <target-sketch-name>');
  process.exit(1);
}

const sourceDir = path.join(__dirname, '../sketches', sourceName);
const targetDir = path.join(__dirname, '../sketches', targetName);

if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
  console.error(`Source sketch directory not found: ${sourceDir}`);
  process.exit(1);
}

if (fs.existsSync(targetDir)) {
  console.error(`Target sketch directory already exists: ${targetDir}`);
  process.exit(1);
}

function main(source: string, target: string) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const items = fs.readdirSync(source);

  items.forEach((item) => {
    if (excludedFiles.includes(item)) {
      return;
    }

    const sourcePath = path.join(source, item);
    const targetPath = createTargetPath(item, target, sourceName, targetName);
    const stats = fs.statSync(sourcePath);

    if (stats.isDirectory()) {
      main(sourcePath, targetPath);
    } else if (stats.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);

      if (path.basename(targetPath) === 'package.json') {
        setPackageName(targetPath, targetName);
      } else if (isTextFile(targetPath)) {
        replaceContentInFile(targetPath, sourceName, targetName);
      }
    }
  });
}

main(sourceDir, targetDir);
install(targetDir);

console.log(`Sketch './sketches/${targetName}' created successfully.`);
