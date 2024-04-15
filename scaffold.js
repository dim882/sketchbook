const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const excludedFiles = ['dist', 'node_modules', 'yarn.lock'];

// Get directory name from command line argument
const dirName = process.argv[2];

const sourceDir = path.join(__dirname, 'sketches/base');
const targetDir = path.join(__dirname, 'sketches', dirName);

copyDirectory(sourceDir, targetDir);

console.log(`Sketch './sketches/${dirName}' created.`);

try {
  // Execute the shell command
  execSync(`cd ./sketches/${dirName} && yarn watch`, { stdio: 'inherit' });
} catch (error) {
  // Handle any errors
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
  let targetFileName = file.replace(/^base(\.html|\.ts)$/, `${dirName}$1`);

  return path.join(target, targetFileName);
}
