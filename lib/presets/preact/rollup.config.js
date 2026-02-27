import { readFileSync } from 'fs';
import { dirname, join, resolve } from 'path';
import { fileURLToPath } from 'url';
import copy from 'rollup-plugin-copy';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';

const PRESET_DIR = dirname(fileURLToPath(import.meta.url));

const DEFAULT_ASSET_PATTERNS = ['*.mp3', '*.json', '*.png', '*.jpg', '*.svg', '*.woff', '*.woff2'];

function htmlTemplatePlugin(sketchName, templatePath) {
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
 * Creates a rollup config for a Preact sketch.
 * Includes babel with Preact JSX support and PostCSS with CSS modules.
 */
export default function createConfig(name, url, options = {}) {
  const sketchDir = dirname(fileURLToPath(url));
  const { html, extraAssets = [] } = options;

  const templatePath = html
    ? resolve(sketchDir, html)
    : join(PRESET_DIR, 'template.html');

  const allAssetPatterns = [...DEFAULT_ASSET_PATTERNS, ...extraAssets];
  const copyTargets = allAssetPatterns.map((pattern) => ({ src: `src/${pattern}`, dest: 'dist' }));

  if (html) {
    copyTargets.push({ src: html, dest: 'dist' });
  }

  const plugins = [
    nodeResolve(),
    typescript({
      tsconfig: './tsconfig.json',
    }),
    babel({
      presets: [
        '@babel/preset-env',
        '@babel/preset-typescript',
        ['@babel/preset-react', { runtime: 'automatic', importSource: 'preact' }],
      ],
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    postcss({
      modules: true,
      extract: 'bundle.css',
      minimize: true,
      sourceMap: true,
    }),
    ...(html ? [] : [htmlTemplatePlugin(name, templatePath)]),
    copy({ targets: copyTargets }),
  ];

  return {
    input: `src/${name}.tsx`,
    output: {
      file: 'dist/bundle.js',
      format: 'es',
      sourcemap: true,
    },
    plugins,
  };
}
