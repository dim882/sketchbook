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

function copyDirectory(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }

  // try {
  //   execSync(`cd ./sketches/${targetDirName} && yarn install`, { stdio: 'inherit' });
  // } catch (error) {
  //   console.error('Error when running yarn install:', error);
  // }

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

    if (file === 'package.json') {
      const packageJsonPath = path.join(target, file);

      try {
        let packageData = fs.readFileSync(packageJsonPath, 'utf8');
        let packageJson = JSON.parse(packageData);
        packageJson.name = targetDirName; // Replace the `name` field with `targetDirName`
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2)); // Write back to the same file with formatting
      } catch (error) {
        console.error('Error processing package.json:', error);
      }
    }

    if (file === 'rollup.config.js') {
      const rollupConfigPath = path.join(target, file);

      try {
        let rollupConfigData = fs.readFileSync(rollupConfigPath, 'utf8');
        let updatedRollupConfigData = rollupConfigData.replace(new RegExp(sourceDirName, 'g'), targetDirName);
        fs.writeFileSync(rollupConfigPath, updatedRollupConfigData);
        console.log('Updated rollup.config.js with new directory name.');
      } catch (error) {
        console.error('Error processing rollup.config.js:', error);
      }
    }

    if (file.includes('.html')) {
      const htmlPath = path.join(target, `${targetDirName}.html`);

      console.log('htmlPath', htmlPath);
      try {
        let htmlFile = fs.readFileSync(htmlPath, 'utf8');
        let updatedHtmlFile = htmlFile.replace(new RegExp(sourceDirName, 'g'), targetDirName);
        fs.writeFileSync(htmlPath, updatedHtmlFile);
        console.log('Updated html with new directory name.');
      } catch (error) {
        console.error('Error processing rollup.config.js:', error);
      }
    }
  });
}

function createTargetPath(file, target) {
  let targetFileName = file.replace(new RegExp(`^${sourceDirName}(.*)\\.(html|ts)$`), `${targetDirName}$1.$2`);

  return path.join(target, targetFileName);
}
