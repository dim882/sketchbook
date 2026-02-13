import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import { babel } from '@rollup/plugin-babel';

export default {
  input: 'src/functron-demo.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript({
      include: ['**/*.ts', '**/*.tsx'],
      tsconfig: './tsconfig.json',
    }),
    babel({
      presets: ['@babel/preset-typescript', ['@babel/preset-react', { pragma: 'jsx', pragmaFrag: 'Fragment' }]],
      extensions: ['.ts', '.tsx'],
      babelHelpers: 'bundled',
    }),
    copy({
      targets: [
        { src: 'src/*.css', dest: 'dist' },
        { src: 'src/*.html', dest: 'dist' },
      ],
    }),
  ],
};
