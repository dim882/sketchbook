import { Result } from '@swan-io/boxed';
import type { Request, Response, NextFunction } from 'express';

// Validates a sketch name to prevent path traversal attacks.
function validateSketchName(name: unknown): Result<string, string> {
  if (!name || typeof name !== 'string') {
    return Result.Error('Sketch name is required');
  }

  // Check for path traversal attempts
  if (name.includes('/') || name.includes('\\') || name.includes('..')) {
    return Result.Error('Invalid sketch name: path traversal not allowed');
  }

  // Only allow alphanumeric, hyphen, underscore, and dot
  if (!/^[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)*$/.test(name)) {
    return Result.Error('Invalid sketch name: only alphanumeric, hyphen, underscore allowed');
  }

  return Result.Ok(name);
}

// Middleware to validate sketch name parameter
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
