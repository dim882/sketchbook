import createConfig from '@dim882/sketchlib/presets/default/rollup.config.js';
export default createConfig('my-sketch', import.meta.url, {
  html: 'src/my-sketch.html',
});
