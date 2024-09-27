import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';

const commonPlugins = [
  nodeResolve(),
  typescript(),
  babel({
    presets: [['@babel/preset-react', { pragma: 'h', pragmaFrag: 'Fragment' }], '@babel/preset-typescript'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    babelHelpers: 'bundled',
    include: ['**/*.ts'],
    exclude: 'node_modules/**',
  }),
  postcss({
    modules: true,
    extract: 'bundle.css',
    minimize: true,
    sourceMap: true,
  }),
];

export default [
  {
    input: 'color-picker.tsx',
    output: {
      file: 'dist/bundle.js',
      format: 'module',
      sourcemap: true,
    },
    plugins: commonPlugins,
  },
  {
    input: 'color-picker-element.ts',
    output: {
      file: 'dist/color-picker-element.js',
      format: 'module',
      sourcemap: true,
    },
    plugins: commonPlugins,
  },
];
