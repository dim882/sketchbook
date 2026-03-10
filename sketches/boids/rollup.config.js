import copy from 'rollup-plugin-copy';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
  input: 'src/boids.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    json(),
    typescript(),
    copy({
      targets: [
        { src: 'src/*.css', dest: 'dist' },
        { src: 'src/*.html', dest: 'dist' },
      ],
    }),
  ],
};
