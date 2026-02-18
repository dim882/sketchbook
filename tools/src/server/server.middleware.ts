import { Result } from '@swan-io/boxed';
import type { Request, Response, NextFunction } from 'express';

export function extractSketchName(req: Request, _res: Response, next: NextFunction) {
  req.params.sketchName = req.params[0];
  next();
}

export function requireValidSketchName(req: Request, res: Response, next: NextFunction) {
  validateSketchName(req.params.sketchName).match({
    Ok: (validName) => {
      req.params.sketchName = validName;
      next();
    },
    Error: (message) => {
      res.status(400).json({ error: message });
    },
  });
}

export function validateSketchName(name: unknown): Result<string, string> {
  if (!name || typeof name !== 'string') {
    return Result.Error('Sketch name is required');
  }

  if (name.includes('\\') || name.includes('..')) {
    return Result.Error('Invalid sketch path: path traversal not allowed');
  }

  const cleaned = name.replace(/^\/+|\/+$/g, '');
  if (!cleaned) {
    return Result.Error('Sketch name is required');
  }

  const segments = cleaned.split('/');
  for (const segment of segments) {
    if (!/^[a-zA-Z0-9_-]+$/.test(segment)) {
      return Result.Error('Invalid path segment: only alphanumeric, hyphen, underscore allowed');
    }
  }

  return Result.Ok(cleaned);
}