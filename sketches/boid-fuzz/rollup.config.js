import copy from 'rollup-plugin-copy';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default {
  input: 'src/boid-fuzz.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    json(),
    typescript({
      target: 'ES2015',
      module: 'ESNext',
    }),
    copy({
      targets: [
        { src: 'src/ui/*.css', dest: 'dist' },
        { src: 'src/*.html', dest: 'dist' },
      ],
    }),
  ],
};
