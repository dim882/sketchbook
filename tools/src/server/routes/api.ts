import { Result, Future } from '@swan-io/boxed';

import * as LibTypes from '../../lib/types';
import * as ServerPaths from '../server.paths';
import * as ServerErrors from '../server.errors';
import * as ServerUtils from '../server.utils';

// --- Route Handlers ---

export const handleGetParams = (sketchName: string) => fetchSketchParams(sketchName);

export const handleUpdateParams = (sketchName: string, params: Record<string, string>) =>
  updateSketchParams(sketchName, params);

// --- Supporting Functions ---

function isValidServerHandler(module: unknown): module is { default: LibTypes.SketchServerHandler } {
  return (
    module !== null &&
    typeof module === 'object' &&
    'default' in module &&
    module.default !== null &&
    typeof module.default === 'object' &&
    'getParams' in module.default &&
    typeof (module.default as Record<string, unknown>).getParams === 'function'
  );
}

const applyTemplateParams = (template: string, params: Record<string, string>) =>
  Object.entries(params).reduce(
    (tpl, [key, value]) => tpl.replaceAll(`{{${key}}}`, value),
    template
  );

function fetchSketchParams(sketchName: string): Future<Result<LibTypes.SketchParams, ServerErrors.ServerError>> {
  const sketchPaths = ServerPaths.paths.sketch(sketchName);

  console.log(`[fetchSketchParams] Loading params for sketch: ${sketchName}`);

  return ServerUtils.readFile(sketchPaths.params)
    .tapOk(() => console.log(`[fetchSketchParams] Read params file: ${sketchPaths.params}`))
    .tapError((err) => console.log(`[fetchSketchParams] Failed to read params file:`, err))
    .mapError((err: unknown) =>
      ServerErrors.isErrnoException(err) && err.code === 'ENOENT'
        ? ServerErrors.notFound(`Parameters not found for sketch '${sketchName}'`)
        : ServerErrors.serverError('Failed to read parameters', err)
    )
    .flatMapOk((fileContent) =>
      Future.fromPromise(import(sketchPaths.serverHandler))
        .tapOk((module) =>
          console.log(`[fetchSketchParams] Loaded server handler, has default export: ${'default' in module}`)
        )
        .tapError((err) => console.log(`[fetchSketchParams] Failed to load server handler:`, err))
        .mapError((err: unknown) =>
          ServerErrors.isErrnoException(err) && err.code === 'MODULE_NOT_FOUND'
            ? ServerErrors.notFound(`Server handler not found for sketch '${sketchName}'`)
            : ServerErrors.serverError('Failed to load server handler', err)
        )
        .mapOkToResult((module) =>
          !isValidServerHandler(module)
            ? Result.Error(
              ServerErrors.serverError(
                `Server handler for sketch '${sketchName}' is invalid: must export default object with getParams function`
              )
            )
            : Result.fromExecution(() => module.default.getParams(fileContent))
              .mapError((err) =>
                ServerErrors.serverError(`Failed to parse params for sketch '${sketchName}'`, err))
        )
    );
}

function updateSketchParams(
  sketchName: string,
  params: Record<string, string>
): Future<Result<void, ServerErrors.ServerError>> {
  const sketchPaths = ServerPaths.paths.sketch(sketchName);

  return ServerUtils.readFile(sketchPaths.template)
    .mapError((err: unknown) =>
      ServerErrors.isErrnoException(err) && err.code === 'ENOENT'
        ? ServerErrors.notFound(`Template not found for sketch '${sketchName}'`)
        : ServerErrors.serverError('Failed to read template', err)
    )
    .flatMapOk((template) =>
      ServerUtils.writeFile(sketchPaths.params, applyTemplateParams(template, params))
        .mapError((err) => ServerErrors.serverError('Failed to write parameters', err))
    );
}
