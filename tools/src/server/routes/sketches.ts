import type { Request, Response } from 'express';

import * as Paths from '../server.paths';
import * as Utils from '../server.utils';

export const htmlRoute = (req: Request, res: Response) => {
  Utils
    .sendFile(res, Paths.paths.sketch(req.params.sketchName).html)
    .tap(Utils.sendResult(res, () => { }));
};
