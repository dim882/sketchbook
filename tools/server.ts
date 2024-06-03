import express from 'express';
import fs from 'fs';
import path from 'path';

import { Either, fromNullable } from '../lib/FPUtils';

const app = express();
const port = 3000;

const sketchesPath = path.join(__dirname, '../sketches');

// Route to list all sketches
app.get('/', (req, res) => {
  fs.readdir(sketchesPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      res.status(500).send('Failed to read sketches directory');
      return;
    }

    // prettier-ignore
    const dirs = files
      .filter((file) => file.isDirectory())
      .map((dir) => dir.name)
      .sort();

    // prettier-ignore
    res.send(`
      <h1>Sketches</h1>
      <ul>
        ${dirs.map((dir) => 
          `<li><a href="/sketches/${dir}">${dir}</a></li>`)
          .join('')
        }
      </ul>
    `);
  });
});

app.get('/sketches/:sketchName', (req, res) => {
  // prettier-ignore
  fromNullable<string, string>(req.params.sketchName)
    .map(makeSketchPath)
    .fold(
      (val) => { console.log('left', val) },
      (val) => { console.log('right', val) }
    );

  const { sketchName } = req.params;
  const filePath = path.join(__dirname, '../sketches', sketchName, `${sketchName}.html`);

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Sketch not found');
    }
  });
});

// Serve static files from each sketch's dist directory
app.use('/sketches/:sketchName/dist', (req, res, next) => {
  const { sketchName } = req.params;
  const distPath = makeDistPath(sketchName);

  express.static(distPath)(req, res, next);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

function makeSketchPath(sketchName: string) {
  return path.join(__dirname, '../sketches', sketchName, `${sketchName}.html`);
}

function makeDistPath(sketchName: any) {
  return path.join(__dirname, '../sketches', sketchName, 'dist');
}
