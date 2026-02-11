import express from 'express';
import {
  paths,
  validateSketchName,
  requireValidSketchName,
  renderMainPage,
  fetchSketchParams,
  updateSketchParams,
  validateParamsBody,
  sendFile,
  handleError,
} from './utils/server.utils';

const app = express();
const port = 2000;

app.use(express.json());
app.use(express.static(paths.public()));

app.get('/', (_, res) => {
  renderMainPage().tap((result) =>
    result.match({
      Ok: (html) => res.send(html),
      Error: handleError(res),
    })
  );
});

app.get('/nav/:sketchname', (req, res) => {
  validateSketchName(req.params.sketchname).match({
    Ok: (validName) => {
      renderMainPage(validName).tap((result) =>
        result.match({
          Ok: (html) => res.send(html),
          Error: handleError(res),
        })
      );
    },
    Error: (message) => res.status(400).json({ error: message }),
  });
});

app.get('/sketches/:sketchName', requireValidSketchName, (req, res) => {
  sendFile(res, paths.sketch(req.params.sketchName).html).tap((result) =>
    result.match({
      Ok: () => { },
      Error: handleError(res),
    })
  );
});

app.use(
  '/sketches/:sketchName/dist',
  requireValidSketchName,
  (req, res, next) => {
    express.static(paths.sketch(req.params.sketchName).dist)(req, res, next);
  }
);

app.get('/api/sketches/:sketchName/params', requireValidSketchName, (req, res) => {
  fetchSketchParams(req.params.sketchName).tap((result) =>
    result.match({
      Ok: (params) => res.json({ params }),
      Error: handleError(res),
    })
  );
});

app.post('/api/sketches/:sketchName/params', requireValidSketchName, (req, res) => {
  validateParamsBody(req.body).match({
    Ok: (params) =>
      updateSketchParams(req.params.sketchName, params).tap((result) =>
        result.match({
          Ok: () => res.json({ success: true }),
          Error: handleError(res),
        })
      ),
    Error: handleError(res),
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
