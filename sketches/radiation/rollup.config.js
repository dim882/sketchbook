import fs from 'fs';
import path from 'path';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import html from '@rollup/plugin-html';

const directory = path.dirname(new URL(import.meta.url).pathname);
const templatePath = path.join(directory, 'radiation.html');
const template = fs.readFileSync(templatePath, { encoding: 'utf8' });

export default {
  input: 'radiation.ts',
  output: {
    file: 'dist/bundle.js',
    format: 'module',
    sourcemap: true,
  },
  plugins: [
    nodeResolve(),
    typescript(),
    html({
      template: ({ attributes, files, meta, publicPath, title }) => {
        const scripts = (files.js || [])
          .map(({ fileName }) => `<script src="${publicPath}${fileName}"></script>`)
          .join('\n');
        return template.replace('${scripts}', scripts);
      },
    }),
  ],
};
