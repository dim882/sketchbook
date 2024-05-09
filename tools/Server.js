const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

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

// Route to handle sketch requests
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

// Serve static files from each sketch's dist directory
app.use('/sketches/:sketchName/dist', (req, res, next) => {
  const sketchName = req.params.sketchName;
  const distPath = path.join(__dirname, '../sketches', sketchName, 'dist');

  express.static(distPath)(req, res, next);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
