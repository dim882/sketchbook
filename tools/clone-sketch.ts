#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import {
  createTargetPath,
  getDirectoryNames,
  install,
  isTextFile,
  replaceContentInFile,
  replaceHtmlTitle,
  setPackageName,
} from './clone.utils';

const excludedFiles = ['dist', 'node_modules', 'yarn.lock', '.DS_Store'];

const sourceName = process.argv[2];
const targetName = process.argv[3];

if (!sourceName || !targetName) {
  console.error('Usage: pnpm clone <source> <target>');
  !sourceName && console.error('<source> not provided');
  !targetName && console.error('<target> not provided');

  process.exit(1);
}

const { sourceDir, targetDir } = getDirectoryNames(sourceName, targetName);

main(sourceDir, targetDir);
install(targetDir);

console.log(`Sketch './sketches/${targetName}' created successfully.`);

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

      const baseName = path.basename(targetPath);
      const extName = path.extname(targetPath);

      if (baseName === 'package.json') {
        setPackageName(targetPath, targetName);
      } else if (extName === '.html') {
        replaceHtmlTitle(targetPath, targetName);
        replaceContentInFile(targetPath, sourceName, targetName);
      } else if (isTextFile(targetPath)) {
        replaceContentInFile(targetPath, sourceName, targetName);
      }
    }
  });
}
