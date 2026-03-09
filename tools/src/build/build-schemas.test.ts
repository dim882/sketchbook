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

  it('finds *.params.ts files in sketch src directories', () => {
    mkdirSync(join(tempDir, 'my-sketch', 'src'), { recursive: true });
    writeFileSync(join(tempDir, 'my-sketch', 'src', 'my-sketch.params.ts'), '');

    const result = findSchemaFiles(tempDir);
    expect(result).toEqual(['my-sketch/src/my-sketch.params.ts']);
  });

  it('finds schema files in nested sketch directories', () => {
    mkdirSync(join(tempDir, 'experiments', 'cool', 'src'), { recursive: true });
    writeFileSync(join(tempDir, 'experiments', 'cool', 'src', 'cool.params.ts'), '');

    const result = findSchemaFiles(tempDir);
    expect(result).toEqual(['experiments/cool/src/cool.params.ts']);
  });

  it('returns empty array when no schema files exist', () => {
    mkdirSync(join(tempDir, 'no-schema', 'src'), { recursive: true });
    writeFileSync(join(tempDir, 'no-schema', 'src', 'main.ts'), '');

    const result = findSchemaFiles(tempDir);
    expect(result).toEqual([]);
  });

  it('ignores schema files in node_modules', () => {
    mkdirSync(join(tempDir, 'node_modules', 'pkg', 'src'), { recursive: true });
    writeFileSync(join(tempDir, 'node_modules', 'pkg', 'src', 'pkg.params.ts'), '');

    const result = findSchemaFiles(tempDir);
    expect(result).toEqual([]);
  });

  it('ignores schema files in dist', () => {
    mkdirSync(join(tempDir, 'my-sketch', 'dist'), { recursive: true });
    writeFileSync(join(tempDir, 'my-sketch', 'dist', 'my-sketch.params.ts'), '');

    const result = findSchemaFiles(tempDir);
    expect(result).toEqual([]);
  });

  it('finds multiple schema files across different sketches', () => {
    mkdirSync(join(tempDir, 'sketch-a', 'src'), { recursive: true });
    writeFileSync(join(tempDir, 'sketch-a', 'src', 'sketch-a.params.ts'), '');
    mkdirSync(join(tempDir, 'sketch-b', 'src'), { recursive: true });
    writeFileSync(join(tempDir, 'sketch-b', 'src', 'sketch-b.params.ts'), '');

    const result = findSchemaFiles(tempDir);
    expect(result).toHaveLength(2);
    expect(result).toContain('sketch-a/src/sketch-a.params.ts');
    expect(result).toContain('sketch-b/src/sketch-b.params.ts');
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

  it('compiles a valid params file to .js and .d.ts and copies JSON', async () => {
    const sketchDir = join(tempDir, 'test-sketch');
    mkdirSync(join(sketchDir, 'src'), { recursive: true });

    writeFileSync(
      join(sketchDir, 'src', 'test-sketch.params.json'),
      JSON.stringify({ x: 42 })
    );

    writeFileSync(
      join(sketchDir, 'src', 'test-sketch.params.ts'),
      `import { z } from 'zod';
import configJson from './test-sketch.params.json';
export const configSchema = z.object({ x: z.number() });
export type Config = z.infer<typeof configSchema>;
export const config = configSchema.parse(configJson);
`
    );

    // Need zod available -- symlink from the main project
    mkdirSync(join(sketchDir, 'node_modules'), { recursive: true });
    const zodSource = join(__dirname, '../../node_modules/zod');
    if (existsSync(zodSource)) {
      const { symlinkSync } = await import('fs');
      symlinkSync(zodSource, join(sketchDir, 'node_modules', 'zod'));
    } else {
      // Skip if zod not in expected location
      return;
    }

    const result = await compileSchema(tempDir, 'test-sketch/src/test-sketch.params.ts').toPromise();

    expect(result.isOk()).toBe(true);
    expect(existsSync(join(sketchDir, 'dist', 'test-sketch.params.js'))).toBe(true);
    expect(existsSync(join(sketchDir, 'dist', 'test-sketch.params.d.ts'))).toBe(true);
    expect(existsSync(join(sketchDir, 'dist', 'test-sketch.params.json'))).toBe(true);
  }, 30000);
});
