import { Result } from '@swan-io/boxed';
import type { Request, Response, NextFunction } from 'express';

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

// Prevent path traversal attacks.
function validateSketchName(name: unknown): Result<string, string> {
  if (!name || typeof name !== 'string') {
    return Result.Error('Sketch name is required');
  }

  if (name.includes('/') || name.includes('\\') || name.includes('..')) {
    return Result.Error('Invalid sketch name: path traversal not allowed');
  }

  if (!/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/.test(name)) {
    return Result.Error('Invalid sketch name: only alphanumeric, hyphen, underscore allowed');
  }

  return Result.Ok(name);
}