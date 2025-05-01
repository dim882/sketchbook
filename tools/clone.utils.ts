import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const textFileExtensions = ['.ts', '.js', '.html', '.css', '.md', '.json', '.config.js'];

export function getDirectoryNames(sourceName: string, targetName: string) {
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
  return { sourceDir, targetDir };
}
export function createTargetPath(item: string, targetDir: string, sourceName: string, targetName: string): string {
  const targetFileName = createTargetName(item, sourceName, targetName);

  return path.join(targetDir, targetFileName);
}

function createTargetName(item: string, sourceName: string, targetName: string) {
  const parsedPath = path.parse(item);
  let targetFileName = item;

  if (parsedPath.name.startsWith(sourceName)) {
    const restOfName = parsedPath.name.substring(sourceName.length);
    targetFileName = `${targetName}${restOfName}${parsedPath.ext}`;
  }
  return targetFileName;
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
    const packageData = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageData);

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

export function replaceHtmlTitle(filePath: string, newTitle: string) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/<title>.*?<\/title>/i, `<title>${newTitle}</title>`);
    fs.writeFileSync(filePath, content, 'utf8');
  } catch (error) {
    console.error(`Error replacing title in ${filePath}:`, error);
  }
}
