import { nodeResolve } from '@rollup/plugin-node-resolve';
// import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import sucrase from '@rollup/plugin-sucrase';
import postcss from 'rollup-plugin-postcss';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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
    postcss({
      modules: {
        generateScopedName: '[name]__[local]___[hash:base64:5]',
        getJSON: (cssFileName, json) => {
          // Save the class mapping to a file for the server to use
          const mappingPath = path.join(__dirname, 'css-modules-mapping.json');
          fs.writeFileSync(mappingPath, JSON.stringify(json, null, 2));
          return json;
        },
      },
      extract: true,
      inject: true,
      minimize: false,
      sourceMap: true,
      extensions: ['.css', '.module.css'],
    }),
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
