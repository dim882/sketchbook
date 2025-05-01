import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'strange-attractor.ts',
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
  ],
};
