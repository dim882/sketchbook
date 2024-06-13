import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import postcss from 'rollup-plugin-postcss';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'dataview.tsx',
  output: {
    sourcemap: true,
    dir: './dist',
    format: 'esm',
    inlineDynamicImports: true, // Optional: inline dynamic imports
  },
  plugins: [
    nodeResolve(),
    commonjs({
      include: 'node_modules/**',
      namedExports: {
        'obsidian-dataview': ['getAPI'],
      },
    }),
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
  ],
};
