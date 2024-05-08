const express = require('express');
const fs = require('fs');
const path = require('path');
const R = require('ramda');
const app = express();
const port = 3000;

const getSketchName = R.propPath(['params', 'sketchName']);

const computeDistPath = (sketchName) => path.join(__dirname, '../sketches', sketchName, 'dist');

const serveStatic = (distPath) => express.static(distPath);

// prettier-ignore
const serveSketchAssets = R.pipe(
  getSketchName, 
  computeDistPath, 
  serveStatic
);

// Route to list all sketches
app.get('/', (req, res) => {
  const distPath = path.join(__dirname, '../sketches');

  fs.readdir(distPath, { withFileTypes: true }, (err, files) => {
    if (err) {
      res.status(500).send('Failed to read sketches directory');
      return;
    }

    const dirs = files.filter((file) => file.isDirectory()).map((dir) => dir.name);
    let html = `
      <h1>Sketches</h1>
      <ul>
        ${dirs.map((dir) => `<li><a href="/sketches/${dir}">${dir}</a></li>`).join('')}
      </ul>
      `;

    res.send(html);
  });
});

app.get('/sketches/:sketchName', (req, res) => {
  const sketchName = req.params.sketchName;
  const filePath = path.join(__dirname, '../sketches', sketchName, `${sketchName}.html`);
  console.log(filePath);

  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('Sketch not found');
    }
  });
});

app.use('/sketches/:sketchName/dist', (req, res, next) => {
  serveSketchAssets(req)(req, res, next);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
