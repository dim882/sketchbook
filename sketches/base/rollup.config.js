import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'base.ts',
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
        { src: '*.css', dest: 'dist' },
        { src: '*.html', dest: 'dist' },
      ],
    }),
  ],
};
