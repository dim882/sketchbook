import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const TEMP_PREFIX = 'sketch-test-';

/**
 * Creates a temporary directory for testing.
 * Returns the path to the temp directory.
 */
export function createTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), TEMP_PREFIX));
}

/**
 * Removes a temporary directory and all its contents.
 * Only removes directories that are in the system temp directory
 * and start with our prefix (safety check).
 */
export function cleanupTempDir(dir: string): void {
  const tempRoot = os.tmpdir();
  const basename = path.basename(dir);

  if (dir.startsWith(tempRoot) && basename.startsWith(TEMP_PREFIX)) {
    fs.rmSync(dir, { recursive: true, force: true });
  } else {
    console.warn(`Refusing to delete ${dir} - not a temp directory`);
  }
}

/**
 * Creates a file in the given directory with the specified content.
 * Creates parent directories if needed.
 */
export function createTempFile(dir: string, relativePath: string, content: string): string {
  const fullPath = path.join(dir, relativePath);
  const parentDir = path.dirname(fullPath);

  fs.mkdirSync(parentDir, { recursive: true });
  fs.writeFileSync(fullPath, content, 'utf8');

  return fullPath;
}

/**
 * Creates a minimal sketch structure for testing.
 */
export function createTestSketch(
  tempDir: string,
  sketchName: string,
  options: {
    withPackageJson?: boolean;
    withHtml?: boolean;
    withRollupConfig?: boolean;
    mainFileContent?: string;
  } = {}
): string {
  const sketchDir = path.join(tempDir, sketchName);
  const srcDir = path.join(sketchDir, 'src');

  fs.mkdirSync(srcDir, { recursive: true });

  // Main TypeScript file
  const mainContent =
    options.mainFileContent ?? `// ${sketchName} sketch\nexport const name = "${sketchName}";\n`;
  fs.writeFileSync(path.join(srcDir, `${sketchName}.ts`), mainContent, 'utf8');

  if (options.withPackageJson) {
    fs.writeFileSync(
      path.join(sketchDir, 'package.json'),
      JSON.stringify({ name: sketchName, version: '1.0.0' }, null, 2),
      'utf8'
    );
  }

  if (options.withHtml) {
    fs.writeFileSync(
      path.join(srcDir, `${sketchName}.html`),
      `<!DOCTYPE html>
<html>
<head>
  <title>${sketchName}</title>
</head>
<body>
  <script type="module" src="./${sketchName}.ts"></script>
</body>
</html>`,
      'utf8'
    );
  }

  if (options.withRollupConfig) {
    fs.writeFileSync(
      path.join(sketchDir, 'rollup.config.js'),
      `export default {
  input: 'src/${sketchName}.ts',
  output: {
    dir: 'dist',
    format: 'es',
  },
};`,
      'utf8'
    );
  }

  return sketchDir;
}

/**
 * Reads a file and returns its content.
 * Returns null if the file doesn't exist.
 */
export function readTempFile(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

/**
 * Checks if a file exists.
 */
export function tempFileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

/**
 * Lists files in a directory recursively.
 */
export function listTempFiles(dir: string): string[] {
  const files: string[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else {
        files.push(path.relative(dir, fullPath));
      }
    }
  }

  if (fs.existsSync(dir)) {
    walk(dir);
  }

  return files.sort();
}
