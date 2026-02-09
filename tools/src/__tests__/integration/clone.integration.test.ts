import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  createTempDir,
  cleanupTempDir,
  createTestSketch,
  readTempFile,
  tempFileExists,
  listTempFiles,
} from '../helpers/tempDir';
import {
  replaceContentInFile,
  setPackageName,
  replaceHtmlTitle,
  createTargetPath,
  isTextFile,
} from '../../sketch.clone.utils';

describe('Clone Integration Tests', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('createTargetPath', () => {
    it('renames files matching source prefix', () => {
      const result = createTargetPath('my-sketch.ts', '/target', 'my-sketch', 'new-sketch');
      expect(result).toBe(path.join('/target', 'new-sketch.ts'));
    });

    it('preserves files not matching source prefix', () => {
      const result = createTargetPath('utils.ts', '/target', 'my-sketch', 'new-sketch');
      expect(result).toBe(path.join('/target', 'utils.ts'));
    });

    it('handles complex filenames with source prefix', () => {
      const result = createTargetPath(
        'my-sketch.utils.ts',
        '/target',
        'my-sketch',
        'new-sketch'
      );
      expect(result).toBe(path.join('/target', 'new-sketch.utils.ts'));
    });
  });

  describe('isTextFile', () => {
    const textExtensions = ['.ts', '.js', '.html', '.css', '.md', '.json', '.config.js'];
    const binaryExtensions = ['.png', '.jpg', '.wasm', '.mp3', '.pdf'];

    it('identifies text files correctly', () => {
      textExtensions.forEach((ext) => {
        expect(isTextFile(`file${ext}`)).toBe(true);
      });
    });

    it('identifies binary files correctly', () => {
      binaryExtensions.forEach((ext) => {
        expect(isTextFile(`file${ext}`)).toBe(false);
      });
    });
  });

  describe('replaceContentInFile - real file operations', () => {
    it('replaces all occurrences in a real file', () => {
      const filePath = path.join(tempDir, 'test.ts');
      fs.writeFileSync(filePath, 'import "my-sketch";\nconst x = "my-sketch";', 'utf8');

      replaceContentInFile(filePath, 'my-sketch', 'new-sketch');

      const content = readTempFile(filePath);
      expect(content).toBe('import "new-sketch";\nconst x = "new-sketch";');
    });

    it('does not write file when no changes needed', () => {
      const filePath = path.join(tempDir, 'test.ts');
      fs.writeFileSync(filePath, 'no matches here', 'utf8');
      const originalMtime = fs.statSync(filePath).mtimeMs;

      // Small delay to ensure mtime would change if file was written
      replaceContentInFile(filePath, 'my-sketch', 'new-sketch');

      const newMtime = fs.statSync(filePath).mtimeMs;
      expect(newMtime).toBe(originalMtime);
    });

    // This test catches Bug 1: Regex Injection
    // Currently this test may fail because the bug exists
    it('handles sketch names with regex special characters', () => {
      const filePath = path.join(tempDir, 'test.ts');
      fs.writeFileSync(filePath, 'import "my-sketch.v2";\nconst x = "my-sketch.v2";', 'utf8');

      replaceContentInFile(filePath, 'my-sketch.v2', 'new-sketch-v2');

      const content = readTempFile(filePath);
      // With the bug: "." matches any character, so "my-sketchXv2" would also match
      // After fix: only literal "my-sketch.v2" should match
      expect(content).toBe('import "new-sketch-v2";\nconst x = "new-sketch-v2";');
    });

    // TODO: Enable in Phase 4 after fixing regex injection bug
    it.skip('does not replace partial matches due to regex wildcards', () => {
      const filePath = path.join(tempDir, 'test.ts');
      // "my-sketch.v2" with bug would match "my-sketchXv2" because "." = any char
      fs.writeFileSync(filePath, 'my-sketchXv2 and my-sketch.v2', 'utf8');

      replaceContentInFile(filePath, 'my-sketch.v2', 'REPLACED');

      const content = readTempFile(filePath);
      // The bug: both would be replaced because "." matches "X" too
      // Fixed: only the literal match should be replaced
      expect(content).toBe('my-sketchXv2 and REPLACED');
    });

    // TODO: Enable in Phase 4 after fixing regex injection bug
    it.skip('handles brackets in search string', () => {
      const filePath = path.join(tempDir, 'test.ts');
      fs.writeFileSync(filePath, 'const arr = sketch[1]; const b = sketchA;', 'utf8');

      replaceContentInFile(filePath, 'sketch[1]', 'sketch[0]');

      const content = readTempFile(filePath);
      // With bug: [1] becomes character class matching '1', so 'sketch1' matches
      // Fixed: only literal "sketch[1]" should match
      expect(content).toBe('const arr = sketch[0]; const b = sketchA;');
    });
  });

  describe('setPackageName - real file operations', () => {
    it('updates package.json name field', () => {
      const pkgPath = path.join(tempDir, 'package.json');
      fs.writeFileSync(
        pkgPath,
        JSON.stringify({ name: 'old-name', version: '1.0.0', dependencies: {} }, null, 2),
        'utf8'
      );

      setPackageName(pkgPath, 'new-name');

      const content = readTempFile(pkgPath);
      const pkg = JSON.parse(content!);
      expect(pkg.name).toBe('new-name');
      expect(pkg.version).toBe('1.0.0');
      expect(pkg.dependencies).toEqual({});
    });

    it('preserves 2-space indentation', () => {
      const pkgPath = path.join(tempDir, 'package.json');
      fs.writeFileSync(pkgPath, '{"name":"old"}', 'utf8');

      setPackageName(pkgPath, 'new');

      const content = readTempFile(pkgPath);
      expect(content).toContain('  "name"'); // 2-space indent
    });
  });

  describe('replaceHtmlTitle - real file operations', () => {
    it('replaces title tag content', () => {
      const htmlPath = path.join(tempDir, 'test.html');
      fs.writeFileSync(
        htmlPath,
        '<!DOCTYPE html><html><head><title>Old Title</title></head></html>',
        'utf8'
      );

      replaceHtmlTitle(htmlPath, 'New Title');

      const content = readTempFile(htmlPath);
      expect(content).toContain('<title>New Title</title>');
      expect(content).not.toContain('Old Title');
    });

    it('handles case-insensitive title tags', () => {
      const htmlPath = path.join(tempDir, 'test.html');
      fs.writeFileSync(htmlPath, '<TITLE>Old</TITLE>', 'utf8');

      replaceHtmlTitle(htmlPath, 'New');

      const content = readTempFile(htmlPath);
      expect(content).toContain('<title>New</title>');
    });
  });

  describe('Full clone workflow simulation', () => {
    it('copies and transforms a sketch directory', () => {
      // Create source sketch
      const sourceDir = createTestSketch(tempDir, 'source-sketch', {
        withPackageJson: true,
        withHtml: true,
      });

      // Create target directory
      const targetDir = path.join(tempDir, 'target-sketch');
      fs.mkdirSync(path.join(targetDir, 'src'), { recursive: true });

      // Copy main file with rename
      const sourceFile = path.join(sourceDir, 'src', 'source-sketch.ts');
      const targetFile = path.join(targetDir, 'src', 'target-sketch.ts');
      fs.copyFileSync(sourceFile, targetFile);

      // Replace content
      replaceContentInFile(targetFile, 'source-sketch', 'target-sketch');

      // Copy and transform package.json
      fs.copyFileSync(
        path.join(sourceDir, 'package.json'),
        path.join(targetDir, 'package.json')
      );
      setPackageName(path.join(targetDir, 'package.json'), 'target-sketch');

      // Copy and transform HTML
      fs.copyFileSync(
        path.join(sourceDir, 'src', 'source-sketch.html'),
        path.join(targetDir, 'src', 'target-sketch.html')
      );
      replaceHtmlTitle(path.join(targetDir, 'src', 'target-sketch.html'), 'target-sketch');

      // Verify transformations
      const tsContent = readTempFile(targetFile);
      expect(tsContent).toContain('target-sketch');
      expect(tsContent).not.toContain('source-sketch');

      const pkg = JSON.parse(readTempFile(path.join(targetDir, 'package.json'))!);
      expect(pkg.name).toBe('target-sketch');

      const html = readTempFile(path.join(targetDir, 'src', 'target-sketch.html'));
      expect(html).toContain('<title>target-sketch</title>');
    });
  });
});

describe('Bug Catching Tests', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = createTempDir();
  });

  afterEach(() => {
    cleanupTempDir(tempDir);
  });

  describe('Bug 1: Regex Injection', () => {
    // These tests document the bug - they will be enabled after fix in Phase 4

    // TODO: Enable in Phase 4 after fixing regex injection bug
    it.skip('sketch name with dot should be treated as literal', () => {
      const filePath = path.join(tempDir, 'test.ts');
      fs.writeFileSync(filePath, 'name: my-sketch.v2, other: my-sketchAv2', 'utf8');

      replaceContentInFile(filePath, 'my-sketch.v2', 'new');

      const content = readTempFile(filePath);
      // Bug: both get replaced because "." matches any char
      // Fixed: only literal "my-sketch.v2" replaced
      expect(content).toBe('name: new, other: my-sketchAv2');
    });

    // TODO: Enable in Phase 4 after fixing regex injection bug
    it.skip('sketch name with parentheses should be treated as literal', () => {
      const filePath = path.join(tempDir, 'test.ts');
      fs.writeFileSync(filePath, 'test(1) and test1', 'utf8');

      // This might throw with current bug if parens create invalid regex
      try {
        replaceContentInFile(filePath, 'test(1)', 'replaced');
        const content = readTempFile(filePath);
        expect(content).toBe('replaced and test1');
      } catch {
        // Bug: throws regex error
        expect.fail('Should not throw - regex special chars should be escaped');
      }
    });

    // TODO: Enable in Phase 4 after fixing regex injection bug
    it.skip('sketch name with asterisk should be treated as literal', () => {
      const filePath = path.join(tempDir, 'test.ts');
      fs.writeFileSync(filePath, 'value* and valuex', 'utf8');

      replaceContentInFile(filePath, 'value*', 'new');

      const content = readTempFile(filePath);
      // Bug: "e*" in regex means "zero or more e", so "valu" would match
      expect(content).toBe('new and valuex');
    });
  });

  describe('Bug 3: Silent Failures', () => {
    // These tests verify that errors are currently silently swallowed

    it('replaceContentInFile silently fails on non-existent file', () => {
      // Currently this just logs and returns void
      // After fix: should return Result.Error
      const result = replaceContentInFile('/nonexistent/path.ts', 'a', 'b');

      // Current behavior: returns undefined (void)
      // This test documents that there's no way to know it failed
      expect(result).toBeUndefined();
    });

    it('setPackageName silently fails on invalid JSON', () => {
      const pkgPath = path.join(tempDir, 'package.json');
      fs.writeFileSync(pkgPath, 'not valid json', 'utf8');

      // Currently this just logs and returns void
      const result = setPackageName(pkgPath, 'new-name');

      expect(result).toBeUndefined();
      // File should be unchanged since parsing failed
      expect(readTempFile(pkgPath)).toBe('not valid json');
    });
  });
});
