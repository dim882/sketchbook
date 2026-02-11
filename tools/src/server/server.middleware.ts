import * as path from 'node:path';
import { Result, Future } from '@swan-io/boxed';
import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err;
}

export interface ServerError {
  status: number;
  message: string;
  cause?: Error;
}

export const notFound = (message: string): ServerError => ({ status: 404, message });

export const badRequest = (message: string): ServerError => ({ status: 400, message });

export const serverError = (message: string, cause?: unknown): ServerError => ({
  status: 500,
  message,
  cause: cause instanceof Error ? cause : undefined,
});

// Wraps res.sendFile in a Future at the I/O boundary
export const sendFile = (res: Response, filePath: string): Future<Result<void, ServerError>> =>
  Future.fromPromise(
    new Promise<void>((resolve, reject) => {
      res.sendFile(filePath, (err) => (err ? reject(err) : resolve()));
    })
  ).mapError((err: unknown) =>
    isErrnoException(err) && err.code === 'ENOENT'
      ? notFound(`File not found: ${path.basename(filePath)}`)
      : serverError('Failed to send file', err)
  );

const ParamsBody = z.object({ params: z.record(z.string(), z.string()) });

export const validateParamsBody = (body: unknown): Result<Record<string, string>, ServerError> =>
  Result.fromExecution(() => ParamsBody.parse(body))
    .map(({ params }) => params)
    .mapError(() => badRequest('Invalid parameters: expected object with params record'));

export const handleError = (res: Response) => (err: ServerError) => {
  if (err.cause) {
    console.error(`${err.message}:`, err.cause);
  }

  res.status(err.status).json({ error: err.message });
};

// Validates a sketch name to prevent path traversal attacks.
export function validateSketchName(name: unknown): Result<string, string> {
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
