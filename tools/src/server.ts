import express from 'express';
import {
  paths,
  validateSketchName,
  requireValidSketchName,
  renderMainPage,
  fetchSketchParams,
  updateSketchParams,
  handleError,
} from './utils/server.utils';

const app = express();
const port = 2000;

app.use(express.json());
app.use(express.static(paths.public()));

app.get('/', async (_, res) => {
  (await renderMainPage().toPromise()).match({
    Ok: (html) => res.send(html),
    Error: handleError(res),
  });
});

app.get('/nav/:sketchname', async (req, res) => {
  validateSketchName(req.params.sketchname).match({
    Ok: async (validName) => {
      (await renderMainPage(validName).toPromise()).match({
        Ok: (html) => res.send(html),
        Error: handleError(res),
      });
    },
    Error: (message) => res.status(400).json({ error: message }),
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

app.get('/api/sketches/:sketchName/params', requireValidSketchName, async (req, res) => {
  (await fetchSketchParams(req.params.sketchName).toPromise()).match({
    Ok: (params) => res.json({ params }),
    Error: handleError(res),
  });
});

app.post('/api/sketches/:sketchName/params', requireValidSketchName, async (req, res) => {
  const { params } = req.body;

  if (!params || typeof params !== 'object') {
    return res.status(400).json({ error: 'Invalid parameters: expected object' });
  }

  (await updateSketchParams(req.params.sketchName, params).toPromise()).match({
    Ok: () => res.json({ success: true }),
    Error: handleError(res),
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
