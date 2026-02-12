import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// This file is at __tests__/fixtures/index.ts, so fixtures dir is current dir
export const FIXTURES_DIR = __dirname;
export const SKETCHES_FIXTURES_DIR = path.join(FIXTURES_DIR, 'sketches');

export function getFixturePath(...parts: string[]): string {
  return path.join(FIXTURES_DIR, ...parts);
}

export function getSketchFixturePath(sketchName: string, ...parts: string[]): string {
  return path.join(SKETCHES_FIXTURES_DIR, sketchName, ...parts);
}
