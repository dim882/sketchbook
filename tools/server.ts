import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import { h } from 'preact';
import render from 'preact-render-to-string';
import SketchList from './ui/SketchList';

const app = express();
const port = 2000;
const publicPath = path.join(__dirname, './public');
const sketchesPath = path.join(__dirname, '../sketches');
const makeSketchPath = (sketchName: string) => path.join(__dirname, '../sketches', sketchName, `${sketchName}.html`);
const makeDistPath = (sketchName: string) => path.join(__dirname, '../sketches', sketchName, 'dist');

app.use(express.static(publicPath));

app.get('/', async (req, res) => {
  try {
    const files = await fs.readdir(sketchesPath, { withFileTypes: true });

    const dirsWithTimestamps = await Promise.all(
      files
        .filter((file) => file.isDirectory())
        .map(async (dir) => {
          const dirPath = path.join(sketchesPath, dir.name);
          const stats = await fs.stat(dirPath);
          return {
            name: dir.name,
            lastModified: stats.mtime.getTime(),
          };
        })
    );

    const sortedDirs = dirsWithTimestamps.sort((a, b) => a.name.localeCompare(b.name));

    const sketchListHtml = render(h(SketchList, { dirs: sortedDirs }));

    const data = await fs.readFile(path.join(__dirname, './ui/index.html'), 'utf8');
    const renderedHtml = data
      .replace('${sketchListPlaceholder}', sketchListHtml)
      .replace('${initialData}', JSON.stringify({ dirs: sortedDirs }));

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

  const sketchPath = makeSketchPath(sketchName);

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
