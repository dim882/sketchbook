import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs';
import { join } from 'path';
import os from 'os';

// Mock the paths module to point at our temp directory
vi.mock('../server.paths', () => {
  let tempDir = '';
  return {
    __setTempDir: (dir: string) => { tempDir = dir; },
    paths: {
      sketch: (name: string) => ({
        base: join(tempDir, name),
        dist: join(tempDir, name, 'dist'),
        src: join(tempDir, name, 'src'),
        html: join(tempDir, name, 'dist', `${name}.html`),
        config: join(tempDir, name, 'src', `${name}.params.json`),
        schema: join(tempDir, name, 'dist', `${name}.schema.js`),
      }),
    },
  };
});

import * as Errors from '../server.errors';

describe('validateParamsBody', () => {
  it('accepts a flat params object with numbers and strings', () => {
    const result = Errors.validateParamsBody({
      params: { x: 10, y: 'hello', z: true },
    });
    expect(result.isOk()).toBe(true);
  });

  it('accepts nested params objects', () => {
    const result = Errors.validateParamsBody({
      params: {
        FLOCK_PARAMS: {
          separationDist: 100,
          alignDist: 50,
        },
        BOID_COUNT: 500,
        BACKGROUND_COLOR: '#fff',
      },
    });
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const params = result.value as Record<string, unknown>;
      const flock = params.FLOCK_PARAMS as Record<string, unknown>;
      expect(flock.separationDist).toBe(100);
      expect(typeof flock.separationDist).toBe('number');
    }
  });

  it('preserves number types (not stringified)', () => {
    const result = Errors.validateParamsBody({
      params: { count: 42, weight: 1.5 },
    });
    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.count).toBe(42);
      expect(typeof result.value.count).toBe('number');
    }
  });

  it('rejects missing params key', () => {
    const result = Errors.validateParamsBody({ data: {} });
    expect(result.isError()).toBe(true);
  });

  it('rejects non-object body', () => {
    const result = Errors.validateParamsBody('not an object');
    expect(result.isError()).toBe(true);
  });

  it('rejects null body', () => {
    const result = Errors.validateParamsBody(null);
    expect(result.isError()).toBe(true);
  });
});

describe('schema validation integration', () => {
  it('boids config.json is valid against its schema', async () => {
    const { default: schema } = await import(
      '../../../../sketches/boids/src/boids.schema'
    );
    const configJson = JSON.parse(
      readFileSync(
        join(__dirname, '../../../../sketches/boids/src/boids.params.json'),
        'utf-8'
      )
    );
    const result = schema.safeParse(configJson);
    expect(result.success).toBe(true);
  });

  it('boid-fuzz config.json is valid against its schema', async () => {
    const { default: schema } = await import(
      '../../../../sketches/boid-fuzz/src/boid-fuzz.schema'
    );
    const configJson = JSON.parse(
      readFileSync(
        join(__dirname, '../../../../sketches/boid-fuzz/src/boid-fuzz.params.json'),
        'utf-8'
      )
    );
    const result = schema.safeParse(configJson);
    expect(result.success).toBe(true);
  });

  it('boids schema rejects wrong types', async () => {
    const { default: schema } = await import(
      '../../../../sketches/boids/src/boids.schema'
    );
    const invalid = {
      FLOCK_PARAMS: {
        separationDist: 'not a number',
        alignDist: 50,
        cohesionDist: 50,
        separationWeight: 1.5,
        alignmentWeight: 1,
        cohesionWeight: 1,
      },
      BOID_COUNT: 500,
      WOIM_LENGTH: 20,
      BACKGROUND_COLOR: '#fcfaf7',
    };
    const result = schema.safeParse(invalid);
    expect(result.success).toBe(false);
  });

  it('boids schema rejects missing required fields', async () => {
    const { default: schema } = await import(
      '../../../../sketches/boids/src/boids.schema'
    );
    const incomplete = {
      FLOCK_PARAMS: {
        separationDist: 100,
      },
      BOID_COUNT: 500,
    };
    const result = schema.safeParse(incomplete);
    expect(result.success).toBe(false);
  });

  it('boid-fuzz schema rejects negative BOID_COUNT', async () => {
    const { default: schema } = await import(
      '../../../../sketches/boid-fuzz/src/boid-fuzz.schema'
    );
    const configJson = JSON.parse(
      readFileSync(
        join(__dirname, '../../../../sketches/boid-fuzz/src/boid-fuzz.params.json'),
        'utf-8'
      )
    );
    const invalid = { ...configJson, BOID_COUNT: -5 };
    const result = schema.safeParse(invalid);
    expect(result.success).toBe(false);
  });
});
