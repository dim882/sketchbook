import express from 'express';
import fs from 'node:fs';
import path from 'node:path';

const app = express();
const port = 2000;
const publicPath = path.join(__dirname, './public');
const sketchesPath = path.join(__dirname, '../sketches');
const makeSketchPath = (sketchName: string) => path.join(__dirname, '../sketches', sketchName, `${sketchName}.html`);
const makeDistPath = (sketchName: string) => path.join(__dirname, '../sketches', sketchName, 'dist');

app.use(express.static(publicPath));

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
      <link rel="stylesheet" href="/styles.css">
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Anybody:wght@100&family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap" rel="stylesheet">

      <style>
      </style>

      <div class="container">
        <div class="list">
          <h1>Sketches</h1>
          <ul>
            ${dirs.map((dir) => 
              `<li><a href="/sketches/${dir}" target="sketchFrame">${dir}</a></li>`)
              .join('')
            }
          </ul>
        </div>
        <div class="preview">
          <iframe name="sketchFrame" src="about:blank"></iframe>
        </div>
      </div>
    `);
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
