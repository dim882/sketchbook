import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  createTempDir,
  cleanupTempDir,
  createTestSketch,
  readTempFile,
} from '../helpers/tempDir';
import * as CloneUtils from '../../clone/clone.utils';

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
      const result = CloneUtils.createTargetPath('my-sketch.ts', '/target', 'my-sketch', 'new-sketch');
      expect(result).toBe(path.join('/target', 'new-sketch.ts'));
    });

    it('preserves files not matching source prefix', () => {
      const result = CloneUtils.createTargetPath('utils.ts', '/target', 'my-sketch', 'new-sketch');
      expect(result).toBe(path.join('/target', 'utils.ts'));
    });

    it('handles complex filenames with source prefix', () => {
      const result = CloneUtils.createTargetPath(
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
        expect(CloneUtils.isTextFile(`file${ext}`)).toBe(true);
      });
    });

    it('identifies binary files correctly', () => {
      binaryExtensions.forEach((ext) => {
        expect(CloneUtils.isTextFile(`file${ext}`)).toBe(false);
      });
    });
  });

  describe('replaceContentInFile - real file operations', () => {
    it('replaces all occurrences in a real file', () => {
      const filePath = path.join(tempDir, 'test.ts');
      fs.writeFileSync(filePath, 'import "my-sketch";\nconst x = "my-sketch";', 'utf8');

      const result = CloneUtils.replaceContentInFile(filePath, 'my-sketch', 'new-sketch');

      expect(result.isOk()).toBe(true);
      const content = readTempFile(filePath);
      expect(content).toBe('import "new-sketch";\nconst x = "new-sketch";');
    });

    it('does not write file when no changes needed', () => {
      const filePath = path.join(tempDir, 'test.ts');
      fs.writeFileSync(filePath, 'no matches here', 'utf8');
      const originalMtime = fs.statSync(filePath).mtimeMs;

      const result = CloneUtils.replaceContentInFile(filePath, 'my-sketch', 'new-sketch');

      expect(result.isOk()).toBe(true);
      result.match({
        Ok: (value) => expect(value.changed).toBe(false),
        Error: () => expect.fail('Should not be error'),
      });
      const newMtime = fs.statSync(filePath).mtimeMs;
      expect(newMtime).toBe(originalMtime);
    });

    it('handles sketch names with regex special characters', () => {
      const filePath = path.join(tempDir, 'test.ts');
      fs.writeFileSync(filePath, 'import "my-sketch.v2";\nconst x = "my-sketch.v2";', 'utf8');

      const result = CloneUtils.replaceContentInFile(filePath, 'my-sketch.v2', 'new-sketch-v2');

      expect(result.isOk()).toBe(true);
      const content = readTempFile(filePath);
      expect(content).toBe('import "new-sketch-v2";\nconst x = "new-sketch-v2";');
    });

    it('does not replace partial matches due to regex wildcards', () => {
      const filePath = path.join(tempDir, 'test.ts');
      fs.writeFileSync(filePath, 'my-sketchXv2 and my-sketch.v2', 'utf8');

      const result = CloneUtils.replaceContentInFile(filePath, 'my-sketch.v2', 'REPLACED');

      expect(result.isOk()).toBe(true);
      const content = readTempFile(filePath);
      // With regex escaping, only literal "my-sketch.v2" should match
      expect(content).toBe('my-sketchXv2 and REPLACED');
    });

    it('handles brackets in search string', () => {
      const filePath = path.join(tempDir, 'test.ts');
      fs.writeFileSync(filePath, 'const arr = sketch[1]; const b = sketchA;', 'utf8');

      const result = CloneUtils.replaceContentInFile(filePath, 'sketch[1]', 'sketch[0]');

      expect(result.isOk()).toBe(true);
      const content = readTempFile(filePath);
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

      const result = CloneUtils.setPackageName(pkgPath, 'new-name');

      expect(result.isOk()).toBe(true);
      const content = readTempFile(pkgPath);
      const pkg = JSON.parse(content!);
      expect(pkg.name).toBe('new-name');
      expect(pkg.version).toBe('1.0.0');
      expect(pkg.dependencies).toEqual({});
    });

    it('preserves 2-space indentation', () => {
      const pkgPath = path.join(tempDir, 'package.json');
      fs.writeFileSync(pkgPath, '{"name":"old"}', 'utf8');

      const result = CloneUtils.setPackageName(pkgPath, 'new');

      expect(result.isOk()).toBe(true);
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

      const result = CloneUtils.replaceHtmlTitle(htmlPath, 'New Title');

      expect(result.isOk()).toBe(true);
      const content = readTempFile(htmlPath);
      expect(content).toContain('<title>New Title</title>');
      expect(content).not.toContain('Old Title');
    });

    it('handles case-insensitive title tags', () => {
      const htmlPath = path.join(tempDir, 'test.html');
      fs.writeFileSync(htmlPath, '<TITLE>Old</TITLE>', 'utf8');

      const result = CloneUtils.replaceHtmlTitle(htmlPath, 'New');

      expect(result.isOk()).toBe(true);
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
      const r1 = CloneUtils.replaceContentInFile(targetFile, 'source-sketch', 'target-sketch');
      expect(r1.isOk()).toBe(true);

      // Copy and transform package.json
      fs.copyFileSync(
        path.join(sourceDir, 'package.json'),
        path.join(targetDir, 'package.json')
      );
      const r2 = CloneUtils.setPackageName(path.join(targetDir, 'package.json'), 'target-sketch');
      expect(r2.isOk()).toBe(true);

      // Copy and transform HTML
      fs.copyFileSync(
        path.join(sourceDir, 'src', 'source-sketch.html'),
        path.join(targetDir, 'src', 'target-sketch.html')
      );
      const r3 = CloneUtils.replaceHtmlTitle(
        path.join(targetDir, 'src', 'target-sketch.html'),
        'target-sketch'
      );
      expect(r3.isOk()).toBe(true);

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

  describe('Bug 1: Regex Injection (FIXED)', () => {
    // These tests verify the regex injection bug is fixed

    it('sketch name with dot should be treated as literal', () => {
      const filePath = path.join(tempDir, 'test.ts');
      fs.writeFileSync(filePath, 'name: my-sketch.v2, other: my-sketchAv2', 'utf8');

      const result = CloneUtils.replaceContentInFile(filePath, 'my-sketch.v2', 'new');

      expect(result.isOk()).toBe(true);
      const content = readTempFile(filePath);
      // With fix: only literal "my-sketch.v2" is replaced
      expect(content).toBe('name: new, other: my-sketchAv2');
    });

    it('sketch name with parentheses should be treated as literal', () => {
      const filePath = path.join(tempDir, 'test.ts');
      fs.writeFileSync(filePath, 'test(1) and test1', 'utf8');

      // With fix: should not throw, parentheses are escaped
      const result = CloneUtils.replaceContentInFile(filePath, 'test(1)', 'replaced');

      expect(result.isOk()).toBe(true);
      const content = readTempFile(filePath);
      expect(content).toBe('replaced and test1');
    });

    it('sketch name with asterisk should be treated as literal', () => {
      const filePath = path.join(tempDir, 'test.ts');
      fs.writeFileSync(filePath, 'value* and valuex', 'utf8');

      const result = CloneUtils.replaceContentInFile(filePath, 'value*', 'new');

      expect(result.isOk()).toBe(true);
      const content = readTempFile(filePath);
      // With fix: asterisk is escaped, only literal "value*" is replaced
      expect(content).toBe('new and valuex');
    });
  });

  describe('Bug 3: Silent Failures (FIXED)', () => {
    // These tests verify that functions now return Result.Error instead of silently failing

    it('replaceContentInFile returns Error on non-existent file', () => {
      const result = CloneUtils.replaceContentInFile('/nonexistent/path.ts', 'a', 'b');

      // With fix: returns Result.Error
      expect(result.isError()).toBe(true);
    });

    it('setPackageName returns Error on invalid JSON', () => {
      const pkgPath = path.join(tempDir, 'package.json');
      fs.writeFileSync(pkgPath, 'not valid json', 'utf8');

      const result = CloneUtils.setPackageName(pkgPath, 'new-name');

      // With fix: returns Result.Error
      expect(result.isError()).toBe(true);
      // File should be unchanged since parsing failed
      expect(readTempFile(pkgPath)).toBe('not valid json');
    });

    it('replaceHtmlTitle returns Error on non-existent file', () => {
      const result = CloneUtils.replaceHtmlTitle('/nonexistent/path.html', 'New Title');

      expect(result.isError()).toBe(true);
    });
  });
});
