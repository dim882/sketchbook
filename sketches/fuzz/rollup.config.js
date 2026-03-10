import createConfig from '@dim882/sketchlib/presets/default/rollup.config.js';
export default createConfig('fuzz', import.meta.url, {
  html: 'src/fuzz.html',
});
