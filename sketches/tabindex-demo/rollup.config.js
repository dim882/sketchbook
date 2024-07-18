import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'tabindex-demo.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'module',
    sourcemap: true,
  },
  plugins: [nodeResolve(), typescript()],
};
