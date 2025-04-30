#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const excludedFiles = ['dist', 'node_modules', 'yarn.lock'];

const sourceName = process.argv[2];
const targetName = process.argv[3];

const sourceDir = path.join(__dirname, '../sketches', sourceName);
const targetDir = path.join(__dirname, '../sketches', targetName);

copyDirectory(sourceDir, targetDir);
install();

console.log(`Sketch './sketches/${targetName}' created.`);

function copyDirectory(source: string, targetDir: string) {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir);
  }

  const files = fs.readdirSync(source);

  files.forEach((file) => {
    const sourcePath = path.join(source, file);

    // Replace base.html with ${dirName}.html and base.ts with ${dirName}.ts
    const targetPath = createTargetPath(file, targetDir);

    if (!excludedFiles.includes(file)) {
      if (fs.statSync(sourcePath).isDirectory()) {
        copyDirectory(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }

    if (file === 'package.json') {
      setPackageName(targetDir, file);
    }

    // Replace any instances of sourceDir with targetDir in rollup files
    if (file === 'rollup.config.js') {
      fixRollupConfig(targetDir, file);
    }

    // Replace any instances of sourceDir with targetDir in HTML files
    if (file.includes('.html')) {
      fixHtmlFile(targetDir);
    }
  });
}

// TODO: find a less hacky way to handle this
function fixHtmlFile(target: string) {
  const htmlPath = path.join(target, `${targetName}.html`);

  try {
    const htmlFile = readFile(htmlPath);
    const updatedHtmlFile = htmlFile.replace(sourceName, targetName);

    fs.writeFileSync(htmlPath, updatedHtmlFile);
  } catch (error) {
    console.error('Error processing rollup.config.js:', error);
  }
}

// TODO: find a less hacky way to handle this
function fixRollupConfig(target: string, file: string) {
  const rollupConfigPath = path.join(target, file);

  try {
    const rollupConfig = readFile(rollupConfigPath);
    const updatedRollupConfig = rollupConfig.replace(sourceName, targetName);

    fs.writeFileSync(rollupConfigPath, updatedRollupConfig);
  } catch (error) {
    console.error('Error processing rollup.config.js:', error);
  }
}

function readFile(rollupConfigPath: string) {
  return fs.readFileSync(rollupConfigPath, 'utf8');
}

function setPackageName(target: string, file: string) {
  const packageJsonPath = path.join(target, file);

  try {
    let packageData = fs.readFileSync(packageJsonPath, 'utf8');
    let packageJson = JSON.parse(packageData);
    packageJson.name = targetName; // Replace the `name` field with `targetDirName`
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2)); // Write back to the same file with formatting
  } catch (error) {
    console.error('Error processing package.json:', error);
  }
}

function install() {
  try {
    execSync(`cd ../sketches/${targetName} && pnpm install`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error when running pnpm install:', error);
  }
}

function createTargetPath(file: string, target: string) {
  let targetFileName = file.replace(new RegExp(`^${sourceName}(.*)\\.(html|ts)$`), `${targetName}$1.$2`);

  return path.join(target, targetFileName);
}
