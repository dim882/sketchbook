import express from 'express';
import * as Paths from './server.paths';
import * as Errors from './server.errors';
import * as Middleware from './server.middleware';
import * as Utils from './server.utils';
import * as Main from './routes/main';
import * as Sketches from './routes/sketches';
import * as Api from './routes/api';

const app = express();
const port = 2000;

app.use(express.json());
app.use(express.static(Paths.paths.public()));

// Main page routes
app.get('/', (_, res) => {
  Main.handleMainPage().tap(Utils.sendResult(res, (html) => res.send(html)));
});

app.get('/nav/:sketchName', Middleware.requireValidSketchName, (req, res) => {
  Main.handleMainPage(req.params.sketchName).tap(Utils.sendResult(res, (html) => res.send(html)));
});

// Sketch file routes
app.get('/sketches/:sketchName', Middleware.requireValidSketchName, (req, res) => {
  Utils.sendFile(res, Sketches.getSketchHtmlPath(req.params.sketchName)).tap(
    Utils.sendResult(res, () => {})
  );
});

app.use('/sketches/:sketchName/dist', Middleware.requireValidSketchName, (req, res, next) => {
  express.static(Sketches.getSketchDistPath(req.params.sketchName))(req, res, next);
});

// API routes
app.get('/api/sketches/:sketchName/params', Middleware.requireValidSketchName, (req, res) => {
  Api.handleGetParams(req.params.sketchName).tap(
    Utils.sendResult(res, (params) => res.json({ params }))
  );
});

app.post('/api/sketches/:sketchName/params', Middleware.requireValidSketchName, (req, res) => {
  Errors.validateParamsBody(req.body).match({
    Ok: (params) =>
      Api.handleUpdateParams(req.params.sketchName, params).tap(
        Utils.sendResult(res, () => res.json({ success: true }))
      ),
    Error: Errors.handleError(res),
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
