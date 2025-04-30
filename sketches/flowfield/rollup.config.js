import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'flowfield.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'module',
    sourcemap: false,
  },
  plugins: [nodeResolve(), typescript()],
};
