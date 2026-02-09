import express from 'express';
import fs from 'node:fs/promises';
import {
  paths,
  getSketchParams,
  validateSketchName,
  requireValidSketchName,
  renderMainPage,
} from './utils/server.utils';

const app = express();
const port = 2000;

app.use(express.json());
app.use(express.static(paths.public()));

app.get('/', async (req, res) => {
  try {
    res.send(await renderMainPage());
  } catch (err) {
    console.error('Error rendering main page:', err);
    res.status(500).json({ error: 'Failed to render main page' });
  }
});

app.get('/nav/:sketchname', async (req, res) => {
  return validateSketchName(req.params.sketchname).match({
    Error: (message) => res.status(400).json({ error: message }),
    Ok: async (validName) => {
      try {
        res.send(await renderMainPage(validName));
      } catch (err) {
        console.error('Error rendering nav page:', err);
        res.status(500).json({ error: 'Failed to render page' });
      }
    },
  });
});

app.get('/sketches/:sketchName', requireValidSketchName, (req, res) => {
  const { sketchName } = req.params;

  res.sendFile(paths.sketch(sketchName).html, (err) => {
    if (err) {
      // Check if file doesn't exist vs other errors
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        res.status(404).json({ error: `Sketch '${sketchName}' not found` });
      } else {
        console.error('Error sending sketch file:', err);
        res.status(500).json({ error: 'Failed to load sketch' });
      }
    }
  });
});

app.use(
  '/sketches/:sketchName/dist',
  requireValidSketchName,
  (req, res, next) => {
    express.static(paths.sketch(req.params.sketchName).dist)(req, res, next);
  }
);

app.get(
  '/api/sketches/:sketchName/params',
  requireValidSketchName,
  async (req, res) => {
    try {
      const params = await getSketchParams(req.params.sketchName);
      res.json({ params });
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT' || (err as NodeJS.ErrnoException).code === 'MODULE_NOT_FOUND') {
        res.status(404).json({
          error: `Parameters not found for sketch '${req.params.sketchName}'`,
        });
      } else {
        console.error('Error reading params:', err);
        res.status(500).json({ error: 'Failed to read parameters' });
      }
    }
  }
);

app.post(
  '/api/sketches/:sketchName/params',
  requireValidSketchName,
  async (req, res) => {
    try {
      const { sketchName } = req.params;
      const { params } = req.body;

      if (!params || typeof params !== 'object') {
        return res.status(400).json({ error: 'Invalid parameters: expected object' });
      }

      const sketchPaths = paths.sketch(sketchName);
      let template: string;

      try {
        template = await fs.readFile(sketchPaths.template, 'utf-8');
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
          return res.status(404).json({
            error: `Template not found for sketch '${sketchName}'`,
          });
        }
        throw err;
      }

      // Replace template placeholders with values
      Object.entries(params).forEach(([key, value]) => {
        // Escape key for use in regex
        const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        template = template.replace(new RegExp(`\\{\\{${escapedKey}\\}\\}`, 'g'), String(value));
      });

      await fs.writeFile(sketchPaths.params, template, 'utf-8');

      res.json({ success: true });
    } catch (err) {
      console.error('Error writing params:', err);
      res.status(500).json({ error: 'Failed to write parameters' });
    }
  }
);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
