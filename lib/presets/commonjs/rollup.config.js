import { dirname } from 'path';
import { fileURLToPath } from 'url';
import commonjs from '@rollup/plugin-commonjs';
import defaultCreateConfig from '../default/rollup.config.js';

/**
 * Creates a rollup config for a sketch with CommonJS dependencies.
 * Extends the default preset by adding the commonjs plugin.
 */
export default function createConfig(name, url, options = {}) {
  const config = defaultCreateConfig(name, url, options);

  // Insert commonjs plugin after nodeResolve (index 0) and before typescript (index 1)
  config.plugins.splice(1, 0, commonjs({ transformMixedEsModules: true }));

  return config;
}
