import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
// import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import sucrase from '@rollup/plugin-sucrase';

export default {
  input: './ui/client.tsx',
  output: {
    file: './public/dist/bundle.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    sucrase({
      exclude: ['node_modules/**'],
      transforms: ['typescript', 'jsx'],
    }),
    // babel({
    //   babelHelpers: 'bundled',
    //   extensions: ['.js', '.jsx', '.ts', '.tsx'],
    // }),
    // copy({
    //   targets: [
    //     { src: '*.css', dest: 'dist' },
    //     { src: '*.html', dest: 'dist' },
    //   ],
    // }),
  ],
};
