import copy from 'rollup-plugin-copy';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'src/boids.ts',
    output: {
      file: 'dist/bundle.js',
      format: 'module',
      sourcemap: false,
    },
    plugins: [
      nodeResolve(),
      typescript(),
      copy({
        targets: [
          { src: 'src/*.css', dest: 'dist' },
          { src: 'src/*.html', dest: 'dist' },
        ],
      }),
    ],
  },
  {
    input: 'src/params-ui.ts',
    output: {
      file: 'dist/params-ui.js',
      format: 'iife',
      sourcemap: false,
    },
    plugins: [nodeResolve(), typescript()],
  },
];
