#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

const SKETCHES_DIR = path.join(process.cwd(), 'sketches');

function setPackageScripts(packagePath: string) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  packageJson.scripts = packageJson.scripts || {};

  // Modify the package file as needed here
  // packageJson.scripts.build = packageJson.scripts.build || 'rollup -c';

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
}

const sketches = fs.readdirSync(SKETCHES_DIR).filter((item) => {
  const itemPath = path.join(SKETCHES_DIR, item);
  return fs.statSync(itemPath).isDirectory();
});

sketches.forEach((sketch) => {
  const packagePath = path.join(SKETCHES_DIR, sketch, 'package.json');

  if (fs.existsSync(packagePath)) {
    console.log(`Updating scripts for ${sketch}...`);
    setPackageScripts(packagePath);
  } else {
    console.log(`No package.json found for ${sketch}, skipping.`);
  }
});

console.log('All package.json files updated successfully.');
