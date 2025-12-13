import assert from 'node:assert';
import { colorToRgba } from './blob-path.utils';
// Test hex colors
assert.deepStrictEqual(colorToRgba('#000000'), { r: 0, g: 0, b: 0, a: 255 });
assert.deepStrictEqual(colorToRgba('#ffffff'), { r: 255, g: 255, b: 255, a: 255 });
assert.deepStrictEqual(colorToRgba('#ff0000'), { r: 255, g: 0, b: 0, a: 255 });
assert.deepStrictEqual(colorToRgba('#00ff00'), { r: 0, g: 255, b: 0, a: 255 });
assert.deepStrictEqual(colorToRgba('#0000ff'), { r: 0, g: 0, b: 255, a: 255 });
// Test hex with alpha
assert.deepStrictEqual(colorToRgba('#ff000080'), { r: 255, g: 0, b: 0, a: 128 });
assert.deepStrictEqual(colorToRgba('#00000000'), { r: 0, g: 0, b: 0, a: 0 });
// Test rgb/rgba strings
assert.deepStrictEqual(colorToRgba('rgb(255, 0, 0)'), { r: 255, g: 0, b: 0, a: 255 });
assert.deepStrictEqual(colorToRgba('rgba(255, 0, 0, 0.5)'), { r: 255, g: 0, b: 0, a: 128 });
assert.deepStrictEqual(colorToRgba('rgba(0, 255, 0, 1)'), { r: 0, g: 255, b: 0, a: 255 });
assert.deepStrictEqual(colorToRgba('rgba(0, 0, 255, 0)'), { r: 0, g: 0, b: 255, a: 0 });
// Test hsl/hsla strings
assert.deepStrictEqual(colorToRgba('hsl(0, 100%, 50%)'), { r: 255, g: 0, b: 0, a: 255 });
assert.deepStrictEqual(colorToRgba('hsla(120, 100%, 50%, 0.5)'), { r: 0, g: 255, b: 0, a: 128 });
// Test with custom default alpha
assert.deepStrictEqual(colorToRgba('#ff0000', 128), { r: 255, g: 0, b: 0, a: 128 });
assert.deepStrictEqual(colorToRgba('rgb(0, 255, 0)', 0), { r: 0, g: 255, b: 0, a: 0 });
// Test that alpha from color string takes precedence over default
assert.deepStrictEqual(colorToRgba('rgba(255, 0, 0, 0.5)', 255), { r: 255, g: 0, b: 0, a: 128 });
console.log('All tests passed!');
