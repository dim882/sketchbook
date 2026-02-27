import createConfig from '@dim882/sketchlib/presets/default/rollup.config.js';
export default createConfig('blob-path', import.meta.url, {
  html: 'src/blob-path.html',
});
