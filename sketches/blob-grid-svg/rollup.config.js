import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import babel from '@rollup/plugin-babel';

export default {
  input: 'blob-grid-svg.tsx',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript({
      tsconfig: './tsconfig.json',
    }),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    }),
    copy({
      targets: [
        { src: '*.css', dest: 'dist' },
        { src: '*.html', dest: 'dist' },
      ],
    }),
  ],
};
