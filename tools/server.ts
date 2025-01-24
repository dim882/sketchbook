import express from 'express';
import fs from 'node:fs';
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

app.get('/', (req, res) => {
  fs.readdir(sketchesPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      res.status(500).send('Failed to read sketches directory');
      return;
    }

    const dirs = files
      .filter((file) => file.isDirectory())
      .map((dir) => dir.name)
      .sort();

    const sketchListHtml = render(h(SketchList, { dirs }));

    fs.readFile(path.join(__dirname, './ui/index.html'), 'utf8', (err, data) => {
      // ... existing error handling ...

      const renderedHtml = data
        .replace('${sketchListPlaceholder}', sketchListHtml)
        .replace('${initialData}', JSON.stringify({ dirs }));

      res.send(renderedHtml);
    });
  });
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
