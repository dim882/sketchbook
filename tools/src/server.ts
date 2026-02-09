import express, { Request, Response, NextFunction } from 'express';
import fs from 'node:fs/promises';
import { Result } from '@swan-io/boxed';
import { paths, getSketchParams, getSketchDirsData } from './utils/server.utils';

const app = express();
const port = 2000;

app.use(express.json());
app.use(express.static(paths.public()));

/**
 * Validates a sketch name to prevent path traversal attacks.
 * Returns Ok with the validated name, or Error with a message.
 */
function validateSketchName(name: unknown): Result<string, string> {
  if (!name || typeof name !== 'string') {
    return Result.Error('Sketch name is required');
  }

  // Check for path traversal attempts
  if (name.includes('/') || name.includes('\\') || name.includes('..')) {
    return Result.Error('Invalid sketch name: path traversal not allowed');
  }

  // Only allow alphanumeric, hyphen, underscore, and dot
  if (!/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/.test(name)) {
    return Result.Error('Invalid sketch name: only alphanumeric, hyphen, underscore allowed');
  }

  return Result.Ok(name);
}

/**
 * Middleware to validate sketch name parameter.
 */
function requireValidSketchName(req: Request, res: Response, next: NextFunction) {
  const validation = validateSketchName(req.params.sketchName);

  validation.match({
    Ok: (validName) => {
      req.params.sketchName = validName;
      next();
    },
    Error: (message) => {
      res.status(400).json({ error: message });
    },
  });
}

async function renderMainPage(sketchName?: string) {
  const htmlTemplate = await fs.readFile(paths.uiIndex(), 'utf8');
  const initialData = JSON.stringify({
    dirs: await getSketchDirsData(paths.sketches()),
    initialSketch: sketchName || null,
  });

  return htmlTemplate.replace('${initialData}', initialData);
}

app.get('/', async (req, res) => {
  try {
    res.send(await renderMainPage());
  } catch (err) {
    console.error('Error rendering main page:', err);
    res.status(500).json({ error: 'Failed to render main page' });
  }
});

app.get('/nav/:sketchname', async (req, res) => {
  const validation = validateSketchName(req.params.sketchname);

  return validation.match({
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

  res.sendFile(paths.html(sketchName), (err) => {
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
    express.static(paths.dist(req.params.sketchName))(req, res, next);
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
      const code = (err as NodeJS.ErrnoException).code;

      if (code === 'ENOENT' || code === 'MODULE_NOT_FOUND') {
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

      let template: string;
      try {
        template = await fs.readFile(paths.template(sketchName), 'utf-8');
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

      await fs.writeFile(paths.params(sketchName), template, 'utf-8');

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
