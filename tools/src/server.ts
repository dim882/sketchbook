import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { h } from 'preact';
import render from 'preact-render-to-string';
import SketchList from './ui/SketchList';

const app = express();
const port = 2000;
const publicPath = path.join(__dirname, '../public');
const sketchesPath = path.join(__dirname, '../../sketches');
const makeDistPath = (sketchName: string) => path.join(__dirname, '../../sketches', sketchName, 'dist');
const makeSketchHtmlPath = (sketchName: string) => path.join(makeDistPath(sketchName), `${sketchName}.html`);

app.use(express.static(publicPath));

// Helper function to render the main page
async function renderMainPage(sketchName?: string) {
  const files = await fs.readdir(sketchesPath, { withFileTypes: true });
  const dirsWithTimestamps = await Promise.all(
    files
      .filter((file) => file.isDirectory())
      .map(async (dir) => {
        const dirPath = path.join(sketchesPath, dir.name);
        const files = await fs.readdir(dirPath);
        const tsFiles = files.filter((file) => file.endsWith('.ts'));
        const tsStats = await Promise.all(tsFiles.map((file) => fs.stat(path.join(dirPath, file))));
        const lastModified = Math.max(...tsStats.map((stat) => stat.mtime.getTime()));

        return {
          name: dir.name,
          lastModified,
        };
      })
  );

  const sortedDirs = dirsWithTimestamps.sort((a, b) => a.name.localeCompare(b.name));
  console.log(sortedDirs);

  const sketchListHtml = render(h(SketchList, { dirs: sortedDirs }));
  const data = await fs.readFile(path.join(__dirname, './ui/index.html'), 'utf8');
  const renderedHtml = data
    .replace('${sketchListPlaceholder}', sketchListHtml)
    .replace('${initialData}', JSON.stringify({ dirs: sortedDirs }))
    .replace('${initialSketch}', sketchName || '');

  return renderedHtml;
}

app.get('/', async (req, res) => {
  try {
    const renderedHtml = await renderMainPage();
    res.send(renderedHtml);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Failed to process request');
  }
});

app.get('/nav/:sketchname', async (req, res) => {
  try {
    const sketchName = req.params.sketchname;
    const renderedHtml = await renderMainPage(sketchName);
    res.send(renderedHtml);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).send('Failed to process request');
  }
});

app.get('/sketches/:sketchName', (req, res) => {
  const sketchName = req.params.sketchName;
  if (!sketchName) {
    return res.status(404).send('Sketch name not provided');
  }

  const sketchPath = makeSketchHtmlPath(sketchName);
  console.log({ sketchPath });

  res.sendFile(sketchPath, (err) => {
    if (err) {
      console.error('Error sending file:', err);
      res.status(404).send('Sketch not found');
    }
  });
});

// Serve static files from each sketch's dist directory
app.use('/sketches/:sketchName/dist', (req, res, next) => {
  const { sketchName } = req.params;
  const distPath = makeDistPath(sketchName);

  express.static(distPath, {
    setHeaders: (res, path) => {
      console.log(path);

      if (path.endsWith('.css')) {
        console.log('sending as css');

        res.setHeader('Content-Type', 'text/css');
      }
    },
  })(req, res, next);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
