import express from 'express';
import * as Paths from './server.paths';
import * as Middleware from './server.middleware';
import * as Main from './routes/main';
import * as Sketches from './routes/sketches';
import * as Api from './routes/api';
import { installErrorHandlers } from '../lib/bootstrap';
import { createLogger } from '../lib/logger';

installErrorHandlers();
const log = createLogger('server');

const app = express();
const port = 2000;

app.use(express.json());
app.use(express.static(Paths.paths.public()));

// Main page routes
app.get('/', Main.route);
app.get('/nav/:sketchName', Middleware.requireValidSketchName, Main.route);

// Sketch file routes
app.get('/sketches/:sketchName', Middleware.requireValidSketchName, Sketches.htmlRoute);
app.use('/sketches/:sketchName/dist', Middleware.requireValidSketchName, Sketches.distRoute);

// API routes
app.get('/api/sketches/:sketchName/params', Middleware.requireValidSketchName, Api.getParamsRoute);
app.post('/api/sketches/:sketchName/params', Middleware.requireValidSketchName, Api.updateParamsRoute);

const server = app.listen(port, () => {
  log.info(`Server running on http://localhost:${port}`, { port });
});

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    log.error(`Port ${port} is already in use`, { port, error: error.message });
  } else if (error.code === 'EACCES') {
    log.error(`Permission denied for port ${port}`, { port, error: error.message });
  } else {
    log.error('Server failed to start', { error: error.message });
  }
  process.exit(1);
});
