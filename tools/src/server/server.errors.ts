import { Result } from '@swan-io/boxed';
import { z } from 'zod';
import type { Response } from 'express';

export interface ServerError {
  status: number;
  message: string;
  cause?: Error;
}

export function isErrnoException(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && 'code' in err;
}

export const notFound = (message: string): ServerError => ({ status: 404, message });

export const badRequest = (message: string): ServerError => ({ status: 400, message });

export const serverError = (message: string, cause?: unknown): ServerError => ({
  status: 500,
  message,
  cause: cause instanceof Error ? cause : undefined,
});

export const handleError = (res: Response) => (err: ServerError) => {
  if (err.cause) {
    console.error(`${err.message}:`, err.cause);
  }

  res.status(err.status).json({ error: err.message });
};

const ParamsBody = z.object({ params: z.record(z.string(), z.string()) });

export const validateParamsBody = (body: unknown): Result<Record<string, string>, ServerError> =>
  Result.fromExecution(() => ParamsBody.parse(body))
    .map(({ params }) => params)
    .mapError(() => badRequest('Invalid parameters: expected object with params record'));
