import * as ServerPaths from '../server.paths';

// --- Route Handlers ---

export const getSketchHtmlPath = (sketchName: string) =>
  ServerPaths.paths.sketch(sketchName).html;

export const getSketchDistPath = (sketchName: string) =>
  ServerPaths.paths.sketch(sketchName).dist;
