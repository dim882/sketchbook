import express from 'express';
import type { Request, Response, NextFunction } from 'express';

import * as Paths from '../server.paths';
import * as Utils from '../server.utils';

export const htmlRoute = (req: Request, res: Response) => {
  Utils
    .sendFile(res, Paths.paths.sketch(req.params.sketchName).html)
    .tap(Utils.sendResult(res, () => { }));
};

export const distRoute = (req: Request, res: Response, next: NextFunction) => {
  express.static(Paths.paths.sketch(req.params.sketchName).dist)(req, res, next);
};
