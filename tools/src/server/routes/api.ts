import { Result, Future } from '@swan-io/boxed';
import type { Request, Response } from 'express';
import type { ZodType } from 'zod';

import * as Paths from '../server.paths';
import * as Errors from '../server.errors';
import * as Utils from '../server.utils';
import { createLogger } from '../../lib/logger';

const log = createLogger('routes/api');

// --- Route Handlers ---

export const getParamsRoute = (req: Request, res: Response) => {
  fetchSketchParams(req.params.sketchName).tap(
    Utils.sendResult(res, (params) => res.json({ params }))
  );
};

export const updateParamsRoute = (req: Request, res: Response) => {
  Errors.validateParamsBody(req.body)
    .tapError((err) => log.warn('Validation failed', { error: err, body: req.body }))
    .match({
    Ok: (params) =>
      updateSketchParams(req.params.sketchName, params).tap(
        Utils.sendResult(res, () => res.json({ success: true }))
      ),
    Error: Errors.handleError(res),
  });
};

// --- Supporting Functions ---

function fetchSketchParams(sketchName: string): Future<Result<Record<string, unknown>, Errors.ServerError>> {
  const sketchPaths = Paths.paths.sketch(sketchName);

  log.info(`Loading params for sketch: ${sketchName}`, { sketchName });

  return Utils.readFile(sketchPaths.paramsJson)
    .tapOk(() => log.debug(`Read params file: ${sketchPaths.paramsJson}`))
    .tapError((err) => log.warn(`Failed to read params file`, { error: err }))
    .mapError((err: unknown) =>
      Errors.isErrnoException(err) && err.code === 'ENOENT'
        ? Errors.notFound(`Parameters not found for sketch '${sketchName}'`)
        : Errors.serverError('Failed to read parameters', err)
    )
    .mapOkToResult((fileContent) =>
      Result.fromExecution(() => JSON.parse(fileContent) as Record<string, unknown>)
        .mapError((err) => Errors.serverError(`Failed to parse params JSON for sketch '${sketchName}'`, err))
    );
}

function loadSchemaModule(schemaPath: string): Future<Result<ZodType, Errors.ServerError>> {
  return Future.fromPromise(import(schemaPath))
    .tapOk((module) =>
      log.debug(`Loaded schema module`, { hasDefault: 'default' in module })
    )
    .tapError((err) => log.warn(`Failed to load schema module`, { error: err }))
    .mapError((err: unknown) =>
      Errors.isErrnoException(err) && err.code === 'MODULE_NOT_FOUND'
        ? Errors.notFound(`Schema module not found at '${schemaPath}'`)
        : Errors.serverError('Failed to load schema module', err)
    )
    .mapOkToResult((module) => {
      const schema = module.paramsSchema;
      if (!schema || typeof schema.parse !== 'function') {
        return Result.Error(
          Errors.serverError(
            `Schema module is invalid: must export a zod schema as paramsSchema`
          )
        );
      }
      return Result.Ok(schema as ZodType);
    });
}

function updateSketchParams(
  sketchName: string,
  params: Record<string, unknown>
): Future<Result<void, Errors.ServerError>> {
  const sketchPaths = Paths.paths.sketch(sketchName);

  return loadSchemaModule(sketchPaths.schema)
    .mapOkToResult((schema) =>
      Result.fromExecution(() => schema.parse(params))
        .mapError((err) => Errors.badRequest(`Validation failed for sketch '${sketchName}': ${err}`))
    )
    .flatMapOk((validated) =>
      Utils.writeFile(sketchPaths.paramsJson, JSON.stringify(validated, null, 2) + '\n')
        .mapError((err) => Errors.serverError('Failed to write parameters', err))
    );
}
