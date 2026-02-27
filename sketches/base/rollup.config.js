import createConfig from '@dim882/sketchlib/presets/default/rollup.config.js';
export default createConfig('base', import.meta.url, {
  html: 'src/base.html',
});
