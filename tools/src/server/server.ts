import express from 'express';
import * as ServerPaths from './server.paths';
import * as ServerMiddleware from './server.middleware';
import * as ServerSketches from './server.sketches';

const app = express();
const port = 2000;

app.use(express.json());
app.use(express.static(ServerPaths.paths.public()));

app.get('/', (_, res) => {
  ServerSketches.renderMainPage().tap((result) =>
    result.match({
      Ok: (html) => res.send(html),
      Error: ServerMiddleware.handleError(res),
    })
  );
});

app.get('/nav/:sketchname', (req, res) => {
  ServerMiddleware.validateSketchName(req.params.sketchname).match({
    Ok: (validName) => {
      ServerSketches.renderMainPage(validName).tap((result) =>
        result.match({
          Ok: (html) => res.send(html),
          Error: ServerMiddleware.handleError(res),
        })
      );
    },
    Error: (message) => res.status(400).json({ error: message }),
  });
});

app.get('/sketches/:sketchName', ServerMiddleware.requireValidSketchName, (req, res) => {
  ServerMiddleware.sendFile(res, ServerPaths.paths.sketch(req.params.sketchName).html).tap((result) =>
    result.match({
      Ok: () => { },
      Error: ServerMiddleware.handleError(res),
    })
  );
});

app.use(
  '/sketches/:sketchName/dist',
  ServerMiddleware.requireValidSketchName,
  (req, res, next) => {
    express.static(ServerPaths.paths.sketch(req.params.sketchName).dist)(req, res, next);
  }
);

app.get('/api/sketches/:sketchName/params', ServerMiddleware.requireValidSketchName, (req, res) => {
  ServerSketches.fetchSketchParams(req.params.sketchName).tap((result) =>
    result.match({
      Ok: (params) => res.json({ params }),
      Error: ServerMiddleware.handleError(res),
    })
  );
});

app.post('/api/sketches/:sketchName/params', ServerMiddleware.requireValidSketchName, (req, res) => {
  ServerMiddleware.validateParamsBody(req.body).match({
    Ok: (params) =>
      ServerSketches.updateSketchParams(req.params.sketchName, params).tap((result) =>
        result.match({
          Ok: () => res.json({ success: true }),
          Error: ServerMiddleware.handleError(res),
        })
      ),
    Error: ServerMiddleware.handleError(res),
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
