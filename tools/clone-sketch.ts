#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const excludedFiles = ['dist', 'node_modules', 'yarn.lock', '.DS_Store'];
const textFileExtensions = ['.ts', '.js', '.html', '.css', '.md', '.json', '.config.js'];

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

copyDirectory(sourceDir, targetDir);
install();

console.log(`Sketch './sketches/${targetName}' created successfully.`);

function copyDirectory(source: string, target: string) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const items = fs.readdirSync(source);

  items.forEach((item) => {
    if (excludedFiles.includes(item)) {
      return;
    }

    const sourcePath = path.join(source, item);
    const targetPath = createTargetPath(item, target);
    const stats = fs.statSync(sourcePath);

    if (stats.isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else if (stats.isFile()) {
      fs.copyFileSync(sourcePath, targetPath);

      if (path.basename(targetPath) === 'package.json') {
        setPackageName(targetPath);
      } else if (isTextFile(targetPath)) {
        replaceContentInFile(targetPath, sourceName, targetName);
      }
    }
  });
}

function createTargetPath(item: string, targetDir: string): string {
  const parsedPath = path.parse(item);
  let targetFileName = item;

  // Rename file if its base name starts with the source sketch name
  if (parsedPath.name.startsWith(sourceName)) {
    // Construct the new name: targetName + rest_of_original_name + extension
    const restOfName = parsedPath.name.substring(sourceName.length); // e.g., ".utils" or ""
    targetFileName = `${targetName}${restOfName}${parsedPath.ext}`; // e.g., "cloned.utils.ts" or "cloned.css"
  }

  return path.join(targetDir, targetFileName);
}

function isTextFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();

  // Include specific filenames like rollup.config.js even without a standard text extension
  if (path.basename(filePath) === 'rollup.config.js') return true;

  return textFileExtensions.includes(ext);
}

function replaceContentInFile(filePath: string, searchValue: string, replaceValue: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    // Use a global regex to replace all occurrences
    const updatedContent = content.replace(new RegExp(searchValue, 'g'), replaceValue);
    if (content !== updatedContent) {
      fs.writeFileSync(filePath, updatedContent, 'utf8');
    }
  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

function setPackageName(packageJsonPath: string) {
  try {
    let packageData = fs.readFileSync(packageJsonPath, 'utf8');
    let packageJson = JSON.parse(packageData);
    packageJson.name = targetName;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  } catch (error) {
    console.error(`Error processing package.json (${packageJsonPath}):`, error);
  }
}

function install() {
  console.log(`Running pnpm install in ${targetDir}...`);
  try {
    execSync('pnpm install', { cwd: targetDir, stdio: 'inherit' });
  } catch (error) {
    console.error('Error running pnpm install:', error);
    // Optionally exit or provide guidance if install fails
    // process.exit(1);
  }
}
