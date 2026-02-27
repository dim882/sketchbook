import createConfig from '@dim882/sketchlib/presets/default/rollup.config.js';
export default createConfig('audio', import.meta.url, {
  html: 'src/audio.html',
});
