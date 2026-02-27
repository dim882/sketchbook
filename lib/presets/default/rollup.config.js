import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import copy from 'rollup-plugin-copy';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

const PRESET_DIR = dirname(fileURLToPath(import.meta.url));

const DEFAULT_ASSET_PATTERNS = ['*.mp3', '*.json', '*.png', '*.jpg', '*.svg', '*.woff', '*.woff2'];

/**
 * Rollup plugin that processes an HTML template, replacing {{SKETCH_NAME}}
 * placeholders, and writes the result to dist/.
 */
function htmlTemplatePlugin(sketchName, sketchDir, templatePath) {
  return {
    name: 'html-template',
    buildStart() {
      this.addWatchFile(templatePath);
    },
    generateBundle() {
      const template = readFileSync(templatePath, 'utf-8');
      const html = template.replaceAll('{{SKETCH_NAME}}', sketchName);
      this.emitFile({
        type: 'asset',
        fileName: `${sketchName}.html`,
        source: html,
      });
    },
  };
}

/**
 * Creates a rollup config for a sketch using the default preset.
 *
 * @param {string} name - The sketch name (e.g. 'my-sketch')
 * @param {string} url - Pass `import.meta.url` from the calling rollup.config.js
 * @param {object} [options]
 * @param {string} [options.html] - Path to a custom HTML template (relative to sketch root)
 * @param {string[]} [options.extraAssets] - Additional asset glob patterns to copy
 * @returns {object} Rollup configuration object
 */
export default function createConfig(name, url, options = {}) {
  const sketchDir = dirname(fileURLToPath(url));
  const { html, extraAssets = [] } = options;

  // Determine HTML template path
  const templatePath = html
    ? resolve(sketchDir, html)
    : join(PRESET_DIR, 'template.html');

  // Build copy targets for CSS and assets
  const allAssetPatterns = [...DEFAULT_ASSET_PATTERNS, ...extraAssets];
  const copyTargets = [
    { src: 'src/*.css', dest: 'dist' },
    ...allAssetPatterns.map((pattern) => ({ src: `src/${pattern}`, dest: 'dist' })),
  ];

  // If using a custom HTML file from src/, copy it directly instead of interpolating
  if (html) {
    copyTargets.push({ src: html, dest: 'dist' });
  }

  const plugins = [
    nodeResolve(),
    typescript(),
    ...(html ? [] : [htmlTemplatePlugin(name, sketchDir, templatePath)]),
    copy({ targets: copyTargets }),
  ];

  return {
    input: `src/${name}.ts`,
    output: {
      file: 'dist/bundle.js',
      format: 'es',
      sourcemap: true,
    },
    plugins,
  };
}
