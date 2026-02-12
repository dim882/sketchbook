import { it, expect } from 'vitest';

import * as Paths from './server.paths';

const sketchesPath = Paths.paths.sketches();

it('paths.sketch returns chained path object', () => {
  const sketch = Paths.paths.sketch('my-sketch');
  expect(sketch.base).toBe(`${sketchesPath}/my-sketch`);
  expect(sketch.dist).toBe(`${sketchesPath}/my-sketch/dist`);
  expect(sketch.src).toBe(`${sketchesPath}/my-sketch/src`);
  expect(sketch.html).toBe(`${sketchesPath}/my-sketch/dist/my-sketch.html`);
  expect(sketch.params).toBe(`${sketchesPath}/my-sketch/src/my-sketch.params.ts`);
  expect(sketch.template).toBe(`${sketchesPath}/my-sketch/src/my-sketch.params.tpl`);
  expect(sketch.serverHandler).toBe(`${sketchesPath}/my-sketch/src/my-sketch.server.js`);
});
