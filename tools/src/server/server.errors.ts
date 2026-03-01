import { Result } from '@swan-io/boxed';
import { z } from 'zod';
import type { Response } from 'express';
import { createLogger } from '../lib/logger';

const log = createLogger('server/errors');

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
    log.error(err.message, { cause: err.cause.message });
  }

  res.status(err.status).json({ error: err.message });
};

const jsonValue: z.ZodType<import('../lib/types').ConfigValue | import('../lib/types').ConfigRecord> = z.lazy(() =>
  z.union([z.string(), z.number(), z.boolean(), z.null(), z.record(z.string(), jsonValue)])
);

const ParamsBody = z.object({
  params: z.record(z.string(), jsonValue),
});

export const validateParamsBody = (body: unknown): Result<Record<string, unknown>, ServerError> =>
  Result.fromExecution(() => ParamsBody.parse(body))
    .map(({ params }) => params)
    .mapError(() => badRequest('Invalid parameters: expected object with params record'));
