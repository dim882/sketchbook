import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Constants used by utility functions
const textFileExtensions = ['.ts', '.js', '.html', '.css', '.md', '.json', '.config.js'];

// Add targetName as a parameter
export function createTargetPath(item: string, targetDir: string, sourceName: string, targetName: string): string {
  const parsedPath = path.parse(item);
  let targetFileName = item;

  // Rename file if its base name starts with the source sketch name
  if (parsedPath.name.startsWith(sourceName)) {
    // Construct the new name: targetName + rest_of_original_name + extension
    const restOfName = parsedPath.name.substring(sourceName.length); // e.g., ".utils" or ""
    // Now targetName is correctly accessed as a parameter
    targetFileName = `${targetName}${restOfName}${parsedPath.ext}`; // e.g., "cloned.utils.ts" or "cloned.css"
  }

  return path.join(targetDir, targetFileName);
}

export function isTextFile(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();

  // Include specific filenames like rollup.config.js even without a standard text extension
  if (path.basename(filePath) === 'rollup.config.js') return true;

  return textFileExtensions.includes(ext);
}

export function replaceContentInFile(filePath: string, searchValue: string, replaceValue: string) {
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

export function setPackageName(packageJsonPath: string, targetName: string) {
  try {
    let packageData = fs.readFileSync(packageJsonPath, 'utf8');
    let packageJson = JSON.parse(packageData);
    packageJson.name = targetName;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  } catch (error) {
    console.error(`Error processing package.json (${packageJsonPath}):`, error);
  }
}

export function install(targetDir: string) {
  console.log(`Running pnpm install in ${targetDir}...`);
  try {
    execSync('pnpm install', { cwd: targetDir, stdio: 'inherit' });
  } catch (error) {
    console.error('Error running pnpm install:', error);
    // Optionally exit or provide guidance if install fails
    // process.exit(1);
  }
}
