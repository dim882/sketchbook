const fs = require('fs');
const path = require('path');

function copyDirectory(source, target) {
  // Create target directory if it doesn't exist
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target);
  }

  // Get list of files and directories in source directory
  const files = fs.readdirSync(source);

  // Iterate through each file/directory
  files.forEach((file) => {
    const sourcePath = path.join(source, file);

    // Replace base.html with ${dirName}.html and base.ts with ${dirName}.ts
    let targetFileName = file.replace(/^base(\.html|\.ts)$/, `${dirName}$1`);
    const targetPath = path.join(target, targetFileName);

    // Exclude dist, node_modules, and yarn.lock
    if (file !== 'dist' && file !== 'node_modules' && file !== 'yarn.lock') {
      // Check if it's a directory
      if (fs.statSync(sourcePath).isDirectory()) {
        // Recursively copy directory
        copyDirectory(sourcePath, targetPath);
      } else {
        // Copy file
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  });
}

// Get directory name from command line argument
const dirName = process.argv[2];

// Define source and target directories
const sourceDir = path.join(__dirname, 'sketches/base');
const targetDir = path.join(__dirname, 'sketches', dirName);

// Copy directory
copyDirectory(sourceDir, targetDir);

console.log(`Directory '${dirName}' copied successfully.`);
