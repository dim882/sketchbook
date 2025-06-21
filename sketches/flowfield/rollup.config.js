import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import copy from 'rollup-plugin-copy';

export default {
  input: 'flowfield.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'module',
    sourcemap: false,
  },
  plugins: [
    nodeResolve(),
    commonjs({
      transformMixedEsModules: true,
    }),
    typescript(),
    copy({
      targets: [
        { src: '*.css', dest: 'dist' },
        { src: '*.html', dest: 'dist' },
      ],
    }),
  ],
};
