import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { findSchemaFiles, compileSchema } from './build-schemas';

describe('findSchemaFiles', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(os.tmpdir(), 'schema-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true });
  });

  it('finds *.schema.ts files in sketch src directories', () => {
    mkdirSync(join(tempDir, 'my-sketch', 'src'), { recursive: true });
    writeFileSync(join(tempDir, 'my-sketch', 'src', 'my-sketch.schema.ts'), '');

    const result = findSchemaFiles(tempDir);
    expect(result).toEqual(['my-sketch/src/my-sketch.schema.ts']);
  });

  it('finds schema files in nested sketch directories', () => {
    mkdirSync(join(tempDir, 'experiments', 'cool', 'src'), { recursive: true });
    writeFileSync(join(tempDir, 'experiments', 'cool', 'src', 'cool.schema.ts'), '');

    const result = findSchemaFiles(tempDir);
    expect(result).toEqual(['experiments/cool/src/cool.schema.ts']);
  });

  it('returns empty array when no schema files exist', () => {
    mkdirSync(join(tempDir, 'no-schema', 'src'), { recursive: true });
    writeFileSync(join(tempDir, 'no-schema', 'src', 'main.ts'), '');

    const result = findSchemaFiles(tempDir);
    expect(result).toEqual([]);
  });

  it('ignores schema files in node_modules', () => {
    mkdirSync(join(tempDir, 'node_modules', 'pkg', 'src'), { recursive: true });
    writeFileSync(join(tempDir, 'node_modules', 'pkg', 'src', 'pkg.schema.ts'), '');

    const result = findSchemaFiles(tempDir);
    expect(result).toEqual([]);
  });

  it('ignores schema files in dist', () => {
    mkdirSync(join(tempDir, 'my-sketch', 'dist'), { recursive: true });
    writeFileSync(join(tempDir, 'my-sketch', 'dist', 'my-sketch.schema.ts'), '');

    const result = findSchemaFiles(tempDir);
    expect(result).toEqual([]);
  });

  it('finds multiple schema files across different sketches', () => {
    mkdirSync(join(tempDir, 'sketch-a', 'src'), { recursive: true });
    writeFileSync(join(tempDir, 'sketch-a', 'src', 'sketch-a.schema.ts'), '');
    mkdirSync(join(tempDir, 'sketch-b', 'src'), { recursive: true });
    writeFileSync(join(tempDir, 'sketch-b', 'src', 'sketch-b.schema.ts'), '');

    const result = findSchemaFiles(tempDir);
    expect(result).toHaveLength(2);
    expect(result).toContain('sketch-a/src/sketch-a.schema.ts');
    expect(result).toContain('sketch-b/src/sketch-b.schema.ts');
  });
});

describe('compileSchema', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(os.tmpdir(), 'compile-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true });
  });

  it('compiles a valid schema file to .js and .d.ts', async () => {
    const sketchDir = join(tempDir, 'test-sketch');
    mkdirSync(join(sketchDir, 'src'), { recursive: true });
    mkdirSync(join(sketchDir, 'dist'), { recursive: true });

    writeFileSync(
      join(sketchDir, 'src', 'test-sketch.schema.ts'),
      `import { z } from 'zod';
export const configSchema = z.object({ x: z.number() });
export type Config = z.infer<typeof configSchema>;
export default configSchema;
`
    );

    // Need zod available — symlink from the main project
    mkdirSync(join(sketchDir, 'node_modules'), { recursive: true });
    const zodSource = join(__dirname, '../../node_modules/zod');
    if (existsSync(zodSource)) {
      const { symlinkSync } = await import('fs');
      symlinkSync(zodSource, join(sketchDir, 'node_modules', 'zod'));
    } else {
      // Skip if zod not in expected location
      return;
    }

    const result = await compileSchema(tempDir, 'test-sketch/src/test-sketch.schema.ts').toPromise();

    expect(result.isOk()).toBe(true);
    expect(existsSync(join(sketchDir, 'dist', 'test-sketch.schema.js'))).toBe(true);
    expect(existsSync(join(sketchDir, 'dist', 'test-sketch.schema.d.ts'))).toBe(true);
  }, 30000);
});
