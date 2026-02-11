import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { Result } from '@swan-io/boxed';
import { getAllSketchDirectories, buildAllSketches } from './build.utils';

describe('getAllSketchDirectories', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(os.tmpdir(), 'build-test-'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true });
  });

  it('returns empty array when directory does not exist', () => {
    const result = getAllSketchDirectories('/nonexistent-dir-12345');
    expect(result).toEqual([]);
  });

  it('filters out excluded directories (.git, node_modules)', () => {
    mkdirSync(join(tempDir, 'sketch1'));
    mkdirSync(join(tempDir, '.git'));
    mkdirSync(join(tempDir, 'node_modules'));
    mkdirSync(join(tempDir, 'sketch2'));

    const result = getAllSketchDirectories(tempDir);

    expect(result).toHaveLength(2);
    expect(result).toContain(join(tempDir, 'sketch1'));
    expect(result).toContain(join(tempDir, 'sketch2'));
  });

  it('filters out files (only includes directories)', () => {
    mkdirSync(join(tempDir, 'sketch1'));
    writeFileSync(join(tempDir, 'README.md'), '');

    const result = getAllSketchDirectories(tempDir);

    expect(result).toEqual([join(tempDir, 'sketch1')]);
  });
});

describe('buildAllSketches', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(os.tmpdir(), 'build-test-'));
    mkdirSync(join(tempDir, 'sketch1'));
    mkdirSync(join(tempDir, 'sketch2'));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true });
  });

  it('returns success when all builds succeed', () => {
    const fakeBuild = () => Result.Ok<void, Error>(undefined);

    const result = buildAllSketches(tempDir, fakeBuild);

    expect(result.total).toBe(2);
    expect(result.failures).toBe(0);
  });

  it('counts failures when builds fail', () => {
    let callCount = 0;
    const fakeBuild = (): Result<void, Error> => {
      callCount++;
      return callCount === 1 ? Result.Ok(undefined) : Result.Error(new Error('fail'));
    };

    const result = buildAllSketches(tempDir, fakeBuild);

    expect(result.total).toBe(2);
    expect(result.failures).toBe(1);
  });

  it('reports correct failure count when multiple builds fail', () => {
    mkdirSync(join(tempDir, 'sketch3'));

    let callCount = 0;
    const fakeBuild = (): Result<void, Error> => {
      callCount++;
      return callCount === 2 ? Result.Ok(undefined) : Result.Error(new Error('fail'));
    };

    const result = buildAllSketches(tempDir, fakeBuild);

    expect(result.total).toBe(3);
    expect(result.failures).toBe(2);
  });
});
