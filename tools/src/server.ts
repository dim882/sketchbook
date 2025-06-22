import express from 'express';
import path from 'node:path';
import fs from 'node:fs/promises';
import { h } from 'preact';
import { loadCSSModulesMapping, renderMainPage, paths } from './server.utils';
import SketchList from './ui/SketchList';

const app = express();
const port = 2000;

app.use(express.json());
app.use(express.static(paths.public()));

// Initialize server with CSS modules mapping
async function initializeServer() {
  const styles = await loadCSSModulesMapping();

  // Create a SketchList component with styles for SSR
  const SketchListWithStyles = (props: any) => h(SketchList, { ...props, styles });

  app.get('/', async (req, res) => {
    try {
      const renderedHtml = await renderMainPage(paths.sketches(), paths.uiIndex(), SketchListWithStyles, styles);
      res.send(renderedHtml);
    } catch (err) {
      console.error('Error:', err);
      res.status(500).send('Failed to process request');
    }
  });

  app.get('/nav/:sketchname', async (req, res) => {
    try {
      const sketchName = req.params.sketchname;
      const renderedHtml = await renderMainPage(
        paths.sketches(),
        paths.uiIndex(),
        SketchListWithStyles,
        styles,
        sketchName
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

    const sketchPath = paths.html(sketchName);

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
    const distPath = paths.dist(sketchName);

    express.static(distPath, {
      setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        }
      },
    })(req, res, next);
  });

  // API endpoint to get parameters for a sketch
  app.get('/api/sketches/:sketchName/params', async (req, res) => {
    try {
      const { sketchName } = req.params;
      const paramsPath = paths.params(sketchName);
      const fileContent = await fs.readFile(paramsPath, 'utf-8');

      // Import the sketch-specific handler
      const sketchHandler = await import(paths.serverHandler(sketchName));
      const params = sketchHandler.getParams(fileContent);

      res.json({ params });
    } catch (err) {
      console.error('Error reading params:', err);
      res.status(404).json({ error: 'Parameters file not found' });
    }
  });

  // API endpoint to update parameters for a sketch
  app.post('/api/sketches/:sketchName/params', async (req, res) => {
    try {
      const { sketchName } = req.params;
      const { params } = req.body;

      if (!params || typeof params !== 'object') {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      // Read the template file
      const templatePath = paths.template(sketchName);
      let template = await fs.readFile(templatePath, 'utf-8');

      // Substitute parameter values
      Object.entries(params).forEach(([key, value]) => {
        template = template.replace(new RegExp(`{{${key}}}`, 'g'), value.toString());
      });

      const paramsPath = paths.params(sketchName);
      await fs.writeFile(paramsPath, template, 'utf-8');

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

// Start the server
initializeServer().catch((err) => {
  console.error('Failed to initialize server:', err);
  process.exit(1);
});
