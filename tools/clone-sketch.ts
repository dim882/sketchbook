#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import * as utils from './clone.utils';

const EXCLUDED_FILES = ['dist', 'node_modules', 'yarn.lock', '.DS_Store'];

const { sourceName, targetName } = utils.getArgs();
const { sourceDir, targetDir } = utils.getDirectoryNames(sourceName, targetName);

main(sourceDir, targetDir);
utils.install(targetDir);

console.log(`Sketch './sketches/${targetName}' created successfully.`);

function main(source: string, target: string) {
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
      main(sourcePath, targetPath);
    } else if (stats.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);

      const baseName = path.basename(targetPath);
      const extName = path.extname(targetPath);

      if (baseName === 'package.json') {
        utils.setPackageName(targetPath, targetName);
      } else if (extName === '.html') {
        utils.replaceHtmlTitle(targetPath, targetName);
        utils.replaceContentInFile(targetPath, sourceName, targetName);
      } else if (utils.isTextFile(targetPath)) {
        utils.replaceContentInFile(targetPath, sourceName, targetName);
      }
    }
  });
}
