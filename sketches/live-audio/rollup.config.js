import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';

export default {
  input: 'src/live-audio.ts',
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
        { src: 'src/*.css', dest: 'dist' },
        { src: 'src/*.html', dest: 'dist' },
        { src: 'src/*.mp3', dest: 'dist' },
      ],
    }),
  ],
};
