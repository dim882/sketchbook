import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy';
import babel from '@rollup/plugin-babel';

export default {
  input: 'preact-base.tsx',
  output: {
    file: 'dist/bundle.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript({
      include: ['**/*.ts', '**/*.tsx'],
      jsx: 'preserve',
      tsconfig: './tsconfig.json',
    }),
    babel({
      presets: [['@babel/preset-react', { pragma: 'h', pragmaFrag: 'Fragment' }]],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      babelHelpers: 'bundled',
    }),
    copy({
      targets: [
        { src: '*.css', dest: 'dist' },
        { src: '*.html', dest: 'dist' },
      ],
    }),
  ],
};
