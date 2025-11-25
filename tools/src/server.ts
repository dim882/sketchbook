// Initialize CSS modules hook BEFORE any other imports that might import CSS
import './css-modules-init';

import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { h } from 'preact';
import { loadCSSModulesMapping, renderMainPage, paths, getSketchParams } from './server.utils';
import SketchList from './ui/SketchList';

const app = express();
const port = 2000;

app.use(express.json());
app.use(express.static(paths.public()));

async function initializeServer() {
  const styles = await loadCSSModulesMapping();

  const SketchListWithStyles = (props: any) => h(SketchList, { ...props, styles });

  app.get('/', async (req, res) => {
    try {
      const renderedHtml = await renderMainPage(paths.sketches(), paths.uiIndex(), SketchListWithStyles);
      res.send(renderedHtml);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).send('Failed to process request');
    }
  });

  app.get('/nav/:sketchname', async (req, res) => {
    try {
      const renderedHtml = await renderMainPage(
        paths.sketches(),
        paths.uiIndex(),
        SketchListWithStyles,
        req.params.sketchname
      );
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

    res.sendFile(paths.html(sketchName), (err) => {
      if (err) {
        console.error('Error sending file:', err);
        res.status(404).send('Sketch not found');
      }
    });
  });

  app.use('/sketches/:sketchName/dist', (req, res, next) => {
    express.static(paths.dist(req.params.sketchName), {
      setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        }
      },
    })(req, res, next);
  });

  app.get('/api/sketches/:sketchName/params', async (req, res) => {
    try {
      const { sketchName } = req.params;
      const params = await getSketchParams(sketchName);

      res.json({ params });
    } catch (err) {
      console.error('Error reading params:', err);

      res.status(404).json({ error: 'Parameters file not found' });
    }
  });

  app.post('/api/sketches/:sketchName/params', async (req, res) => {
    try {
      const { sketchName } = req.params;
      const { params } = req.body;

      if (!params || typeof params !== 'object') {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      let template = await fs.readFile(paths.template(sketchName), 'utf-8');

      Object.entries(params).forEach(([key, value]) => {
        template = template.replace(new RegExp(`{{${key}}}`, 'g'), value.toString());
      });

      await fs.writeFile(paths.params(sketchName), template, 'utf-8');

      res.json({ success: true });
    } catch (err) {
      console.error('Error writing params:', err);
      res.status(500).json({ error: 'Failed to write parameters' });
    }
  });

  app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

initializeServer().catch((err) => {
  console.error('Failed to initialize server:', err);
  process.exit(1);
});
