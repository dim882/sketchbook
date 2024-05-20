import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'color-picker.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'module',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript(),
    babel({
      presets: [['@babel/preset-react', { pragma: 'h', pragmaFrag: 'Fragment' }], '@babel/preset-typescript'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      babelHelpers: 'bundled',
      include: ['**/*.ts'],
      exclude: 'node_modules/**',
    }),
  ],
};
