import * as Paths from '../server.paths';

// --- Route Handlers ---

export const getSketchHtmlPath = (sketchName: string) =>
  Paths.paths.sketch(sketchName).html;

export const getSketchDistPath = (sketchName: string) =>
  Paths.paths.sketch(sketchName).dist;
