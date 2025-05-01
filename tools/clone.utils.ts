import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const FILE_EXTENSIONS = ['.ts', '.js', '.html', '.css', '.md', '.json', '.config.js'];

export function getArgs() {
  const sourceName = process.argv[2];
  const targetName = process.argv[3];

  if (!sourceName || !targetName) {
    console.error('Usage: pnpm clone <source> <target>');
    !sourceName && console.error('<source> not provided');
    !targetName && console.error('<target> not provided');

    process.exit(1);
  }
  return { sourceName, targetName };
}

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

function createTargetName(item: string, sourceName: string, targetName: string): string {
  const parsedPath = path.parse(item);

  return parsedPath.name.startsWith(sourceName)
    ? `${targetName}${parsedPath.name.substring(sourceName.length)}${parsedPath.ext}`
    : item;
}

export const isTextFile = (filePath: string) => FILE_EXTENSIONS.includes(path.extname(filePath));

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
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.replace(/<title>.*?<\/title>/i, `<title>${newTitle}</title>`);

    fs.writeFileSync(filePath, newContent, 'utf8');
  } catch (error) {
    console.error(`Error replacing title in ${filePath}:`, error);
  }
}
