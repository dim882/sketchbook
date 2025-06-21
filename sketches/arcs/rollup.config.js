import copy from 'rollup-plugin-copy';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'arcs.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'module',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript(),
    copy({
      targets: [
        { src: './*.css', dest: 'dist' },
        { src: './*.html', dest: 'dist' },
      ],
    }),
  ],
};
