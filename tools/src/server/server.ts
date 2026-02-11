import express from 'express';
import * as ServerPaths from './server.paths';
import * as ServerErrors from './server.errors';
import * as ServerMiddleware from './server.middleware';
import * as ServerUtils from './server.utils';
import * as MainRoutes from './routes/main';
import * as SketchRoutes from './routes/sketches';
import * as ApiRoutes from './routes/api';

const app = express();
const port = 2000;

app.use(express.json());
app.use(express.static(ServerPaths.paths.public()));

// Main page routes
app.get('/', (_, res) => {
  MainRoutes.handleMainPage().tap(ServerUtils.sendResult(res, (html) => res.send(html)));
});

app.get('/nav/:sketchName', ServerMiddleware.requireValidSketchName, (req, res) => {
  MainRoutes.handleMainPage(req.params.sketchName).tap(ServerUtils.sendResult(res, (html) => res.send(html)));
});

// Sketch file routes
app.get('/sketches/:sketchName', ServerMiddleware.requireValidSketchName, (req, res) => {
  ServerUtils.sendFile(res, SketchRoutes.getSketchHtmlPath(req.params.sketchName)).tap(
    ServerUtils.sendResult(res, () => { })
  );
});

app.use('/sketches/:sketchName/dist', ServerMiddleware.requireValidSketchName, (req, res, next) => {
  express.static(SketchRoutes.getSketchDistPath(req.params.sketchName))(req, res, next);
});

// API routes
app.get('/api/sketches/:sketchName/params', ServerMiddleware.requireValidSketchName, (req, res) => {
  ApiRoutes.handleGetParams(req.params.sketchName).tap(
    ServerUtils.sendResult(res, (params) => res.json({ params }))
  );
});

app.post('/api/sketches/:sketchName/params', ServerMiddleware.requireValidSketchName, (req, res) => {
  ServerErrors.validateParamsBody(req.body).match({
    Ok: (params) =>
      ApiRoutes.handleUpdateParams(req.params.sketchName, params).tap(
        ServerUtils.sendResult(res, () => res.json({ success: true }))
      ),
    Error: ServerErrors.handleError(res),
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
