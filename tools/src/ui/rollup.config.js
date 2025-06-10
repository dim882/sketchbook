import { nodeResolve } from '@rollup/plugin-node-resolve';
// import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import sucrase from '@rollup/plugin-sucrase';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  input: './src/ui/client.tsx',
  output: {
    file: './public/dist/bundle.js',
    format: 'es',
    sourcemap: true,
    globals: {
      preact: 'preact',
    },
  },
  plugins: [
    nodeResolve({
      extensions: ['.js', '.ts', '.tsx'],
    }),
    commonjs(),
    sucrase({
      exclude: ['node_modules/**'],
      transforms: ['typescript', 'jsx'],
      jsxPragma: 'h',
      production: true,
    }),
    // babel({
    //   babelHelpers: 'bundled',
    //   extensions: ['.js', '.jsx', '.ts', '.tsx'],
    // }),
    // copy({
    //   targets: [
    //     { src: '*.css', dest: 'dist' },
    //     { src: '*.html', dest: 'dist' },
    //   ],
    // }),
  ],
};
