#!/usr/bin/env bun
/**
 * Migration script to move sketch files into src/ directory structure.
 *
 * Usage: bun tools/src/migrate/migrate-to-src.ts [sketch-name]
 *
 * If sketch-name is provided, migrates only that sketch.
 * If no argument, migrates all sketches that need migration.
 */

import * as fs from 'fs';
import * as path from 'path';
import { createLogger } from '../lib/logger';
import { getSketchesDir } from '../lib/paths';

const log = createLogger('migrate');

const SKETCHES_DIR = getSketchesDir();
const EXCLUDED_DIRS = ['node_modules', 'dist', '.git'];
const FILES_TO_MOVE = ['.ts', '.tsx', '.html', '.css'];
const FILES_TO_KEEP_AT_ROOT = ['package.json', 'rollup.config.js', 'tsconfig.json', 'jest.config.js', '.babelrc'];

interface MigrationResult {
  sketch: string;
  success: boolean;
  error?: string;
  filesMoved: string[];
}

const needsMigration = (sketchPath: string): boolean => {
  const srcDir = path.join(sketchPath, 'src');
  if (fs.existsSync(srcDir)) {
    return false;
  }

  const files = fs.readdirSync(sketchPath);
  return files.some((f) => FILES_TO_MOVE.some((ext) => f.endsWith(ext)));
};

const migrateSketch = (sketchPath: string): MigrationResult => {
  const sketchName = path.basename(sketchPath);
  const result: MigrationResult = {
    sketch: sketchName,
    success: false,
    filesMoved: [],
  };

  const srcDir = path.join(sketchPath, 'src');

  if (fs.existsSync(srcDir)) {
    result.error = 'Already has src/ directory';
    return result;
  }

  fs.mkdirSync(srcDir);

  const files = fs.readdirSync(sketchPath);
  for (const file of files) {
    if (EXCLUDED_DIRS.includes(file)) continue;
    if (FILES_TO_KEEP_AT_ROOT.includes(file)) continue;

    const filePath = path.join(sketchPath, file);
    const stat = fs.statSync(filePath);

    if (stat.isFile() && FILES_TO_MOVE.some((ext) => file.endsWith(ext))) {
      const destPath = path.join(srcDir, file);
      fs.renameSync(filePath, destPath);
      result.filesMoved.push(file);
    }
  }

  updateRollupConfig(sketchPath, sketchName);

  result.success = true;
  return result;
};

const updateRollupConfig = (sketchPath: string, sketchName: string): void => {
  const configPath = path.join(sketchPath, 'rollup.config.js');
  if (!fs.existsSync(configPath)) {
    log.warn(`No rollup.config.js found in ${sketchName}`);
    return;
  }

  let content = fs.readFileSync(configPath, 'utf-8');

  // Update input path: 'name.ts' or 'name.tsx' -> 'src/name.ts' or 'src/name.tsx'
  // Handle various patterns: 'name.ts', "name.ts", `name.ts`
  content = content.replace(
    /input:\s*(['"`])([^'"`]+\.(ts|tsx))\1/g,
    (match, quote, filename) => {
      if (filename.startsWith('src/')) return match;
      return `input: ${quote}src/${filename}${quote}`;
    }
  );

  // Update copy targets: '*.css' -> 'src/*.css', '*.html' -> 'src/*.html'
  // Also handle './*.css' pattern
  content = content.replace(
    /src:\s*(['"`])(\.\/)?\*\.(css|html|mp3)\1/g,
    (match, quote, dotSlash, ext) => `src: ${quote}src/*.${ext}${quote}`
  );

  fs.writeFileSync(configPath, content);
};

const getAllSketches = (): string[] => {
  const entries = fs.readdirSync(SKETCHES_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && !EXCLUDED_DIRS.includes(e.name))
    .map((e) => path.join(SKETCHES_DIR, e.name));
};

const main = () => {
  const targetSketch = process.argv[2];
  let sketches: string[];

  if (targetSketch) {
    const sketchPath = path.join(SKETCHES_DIR, targetSketch);
    if (!fs.existsSync(sketchPath)) {
      log.error(`Sketch not found: ${targetSketch}`);
      process.exit(1);
    }
    sketches = [sketchPath];
  } else {
    sketches = getAllSketches().filter(needsMigration);
  }

  if (sketches.length === 0) {
    log.info('No sketches need migration');
    return;
  }

  log.info(`Migrating ${sketches.length} sketch(es)...`);

  const results: MigrationResult[] = [];
  for (const sketchPath of sketches) {
    const result = migrateSketch(sketchPath);
    results.push(result);

    if (result.success) {
      log.info(`✓ ${result.sketch}: moved ${result.filesMoved.length} files`);
    } else {
      log.warn(`✗ ${result.sketch}: ${result.error}`);
    }
  }

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  log.info(`\nMigration complete: ${successful} succeeded, ${failed} skipped/failed`);
};

main();
