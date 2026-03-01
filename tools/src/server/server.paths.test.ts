import { it, expect } from 'vitest';

import * as Paths from './server.paths';

const sketchesPath = Paths.paths.sketches();

it('paths.sketch returns chained path object', () => {
  const sketch = Paths.paths.sketch('my-sketch');
  expect(sketch.base).toBe(`${sketchesPath}/my-sketch`);
  expect(sketch.dist).toBe(`${sketchesPath}/my-sketch/dist`);
  expect(sketch.src).toBe(`${sketchesPath}/my-sketch/src`);
  expect(sketch.html).toBe(`${sketchesPath}/my-sketch/dist/my-sketch.html`);
  expect(sketch.config).toBe(`${sketchesPath}/my-sketch/src/my-sketch.params.json`);
  expect(sketch.schema).toBe(`${sketchesPath}/my-sketch/dist/my-sketch.schema.js`);
});

it('paths.sketch handles nested paths using leaf name for files', () => {
  const sketch = Paths.paths.sketch('experiments/cool-thing');
  expect(sketch.base).toBe(`${sketchesPath}/experiments/cool-thing`);
  expect(sketch.dist).toBe(`${sketchesPath}/experiments/cool-thing/dist`);
  expect(sketch.src).toBe(`${sketchesPath}/experiments/cool-thing/src`);
  expect(sketch.html).toBe(`${sketchesPath}/experiments/cool-thing/dist/cool-thing.html`);
  expect(sketch.config).toBe(`${sketchesPath}/experiments/cool-thing/src/cool-thing.params.json`);
  expect(sketch.schema).toBe(`${sketchesPath}/experiments/cool-thing/dist/cool-thing.schema.js`);
});
