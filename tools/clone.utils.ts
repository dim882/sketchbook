import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const textFileExtensions = ['.ts', '.js', '.html', '.css', '.md', '.json', '.config.js'];

export function createTargetPath(item: string, targetDir: string, sourceName: string, targetName: string): string {
  const parsedPath = path.parse(item);
  let targetFileName = item;

  if (parsedPath.name.startsWith(sourceName)) {
    const restOfName = parsedPath.name.substring(sourceName.length);
    targetFileName = `${targetName}${restOfName}${parsedPath.ext}`;
  }

  return path.join(targetDir, targetFileName);
}

export function isTextFile(filePath: string): boolean {
  return textFileExtensions.includes(path.extname(filePath));
}

export function replaceContentInFile(filePath: string, searchValue: string, replaceValue: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
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
  }
}
