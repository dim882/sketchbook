import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import os from 'os';
import { Future, Result } from '@swan-io/boxed';
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

  it('finds directories containing package.json', () => {
    mkdirSync(join(tempDir, 'sketch1'));
    writeFileSync(join(tempDir, 'sketch1', 'package.json'), '');
    mkdirSync(join(tempDir, 'sketch2'));
    writeFileSync(join(tempDir, 'sketch2', 'package.json'), '');

    const result = getAllSketchDirectories(tempDir);

    expect(result).toHaveLength(2);
    expect(result).toContain(join(tempDir, 'sketch1'));
    expect(result).toContain(join(tempDir, 'sketch2'));
  });

  it('ignores directories without package.json', () => {
    mkdirSync(join(tempDir, 'sketch1'));
    writeFileSync(join(tempDir, 'sketch1', 'package.json'), '');
    mkdirSync(join(tempDir, 'not-a-sketch'));

    const result = getAllSketchDirectories(tempDir);

    expect(result).toEqual([join(tempDir, 'sketch1')]);
  });

  it('ignores node_modules', () => {
    mkdirSync(join(tempDir, 'node_modules', 'pkg'), { recursive: true });
    writeFileSync(join(tempDir, 'node_modules', 'pkg', 'package.json'), '');
    mkdirSync(join(tempDir, 'sketch1'));
    writeFileSync(join(tempDir, 'sketch1', 'package.json'), '');

    const result = getAllSketchDirectories(tempDir);

    expect(result).toEqual([join(tempDir, 'sketch1')]);
  });

  it('discovers nested sketch directories', () => {
    mkdirSync(join(tempDir, 'experiments', 'nested'), { recursive: true });
    writeFileSync(join(tempDir, 'experiments', 'nested', 'package.json'), '');
    mkdirSync(join(tempDir, 'flat'));
    writeFileSync(join(tempDir, 'flat', 'package.json'), '');

    const result = getAllSketchDirectories(tempDir);

    expect(result).toHaveLength(2);
    expect(result).toContain(join(tempDir, 'experiments/nested'));
    expect(result).toContain(join(tempDir, 'flat'));
  });
});

describe('buildAllSketches', () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(os.tmpdir(), 'build-test-'));
    mkdirSync(join(tempDir, 'sketch1'));
    writeFileSync(join(tempDir, 'sketch1', 'package.json'), '');
    mkdirSync(join(tempDir, 'sketch2'));
    writeFileSync(join(tempDir, 'sketch2', 'package.json'), '');
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true });
  });

  it('returns success when all builds succeed', async () => {
    const fakeBuild = () => Future.value(Result.Ok<void, Error>(undefined));

    const result = await buildAllSketches(tempDir, fakeBuild);

    expect(result.total).toBe(2);
    expect(result.failures).toBe(0);
  });

  it('counts failures when builds fail', async () => {
    let callCount = 0;
    const fakeBuild = (): Future<Result<void, Error>> => {
      callCount++;
      return Future.value(callCount === 1 ? Result.Ok(undefined) : Result.Error(new Error('fail')));
    };

    const result = await buildAllSketches(tempDir, fakeBuild);

    expect(result.total).toBe(2);
    expect(result.failures).toBe(1);
  });

  it('reports correct failure count when multiple builds fail', async () => {
    mkdirSync(join(tempDir, 'sketch3'));
    writeFileSync(join(tempDir, 'sketch3', 'package.json'), '');

    let callCount = 0;
    const fakeBuild = (): Future<Result<void, Error>> => {
      callCount++;
      return Future.value(callCount === 2 ? Result.Ok(undefined) : Result.Error(new Error('fail')));
    };

    const result = await buildAllSketches(tempDir, fakeBuild);

    expect(result.total).toBe(3);
    expect(result.failures).toBe(2);
  });
});
