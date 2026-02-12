import express from 'express';
import type { Request, Response, NextFunction } from 'express';

import * as Paths from '../server.paths';
import * as Utils from '../server.utils';

// --- Route Handlers ---

export const sketchHtmlHandler = (req: Request, res: Response) => {
  const filePath = Paths.paths.sketch(req.params.sketchName).html;
  Utils.sendFile(res, filePath).tap(Utils.sendResult(res, () => {}));
};

export const sketchDistHandler = (req: Request, res: Response, next: NextFunction) => {
  const distPath = Paths.paths.sketch(req.params.sketchName).dist;
  express.static(distPath)(req, res, next);
};
