import { Result, Future } from '@swan-io/boxed';

import * as Types from '../../lib/types';
import * as Paths from '../server.paths';
import * as Errors from '../server.errors';
import * as Utils from '../server.utils';

// --- Route Handlers ---

export const handleGetParams = (sketchName: string) => fetchSketchParams(sketchName);

export const handleUpdateParams = (sketchName: string, params: Record<string, string>) =>
  updateSketchParams(sketchName, params);

// --- Supporting Functions ---

function isValidServerHandler(module: unknown): module is { default: Types.SketchServerHandler } {
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

function fetchSketchParams(sketchName: string): Future<Result<Types.SketchParams, Errors.ServerError>> {
  const sketchPaths = Paths.paths.sketch(sketchName);

  console.log(`[fetchSketchParams] Loading params for sketch: ${sketchName}`);

  return Utils.readFile(sketchPaths.params)
    .tapOk(() => console.log(`[fetchSketchParams] Read params file: ${sketchPaths.params}`))
    .tapError((err) => console.log(`[fetchSketchParams] Failed to read params file:`, err))
    .mapError((err: unknown) =>
      Errors.isErrnoException(err) && err.code === 'ENOENT'
        ? Errors.notFound(`Parameters not found for sketch '${sketchName}'`)
        : Errors.serverError('Failed to read parameters', err)
    )
    .flatMapOk((fileContent) =>
      Future.fromPromise(import(sketchPaths.serverHandler))
        .tapOk((module) =>
          console.log(`[fetchSketchParams] Loaded server handler, has default export: ${'default' in module}`)
        )
        .tapError((err) => console.log(`[fetchSketchParams] Failed to load server handler:`, err))
        .mapError((err: unknown) =>
          Errors.isErrnoException(err) && err.code === 'MODULE_NOT_FOUND'
            ? Errors.notFound(`Server handler not found for sketch '${sketchName}'`)
            : Errors.serverError('Failed to load server handler', err)
        )
        .mapOkToResult((module) =>
          !isValidServerHandler(module)
            ? Result.Error(
              Errors.serverError(
                `Server handler for sketch '${sketchName}' is invalid: must export default object with getParams function`
              )
            )
            : Result.fromExecution(() => module.default.getParams(fileContent))
              .mapError((err) =>
                Errors.serverError(`Failed to parse params for sketch '${sketchName}'`, err))
        )
    );
}

function updateSketchParams(
  sketchName: string,
  params: Record<string, string>
): Future<Result<void, Errors.ServerError>> {
  const sketchPaths = Paths.paths.sketch(sketchName);

  return Utils.readFile(sketchPaths.template)
    .mapError((err: unknown) =>
      Errors.isErrnoException(err) && err.code === 'ENOENT'
        ? Errors.notFound(`Template not found for sketch '${sketchName}'`)
        : Errors.serverError('Failed to read template', err)
    )
    .flatMapOk((template) =>
      Utils.writeFile(sketchPaths.params, applyTemplateParams(template, params))
        .mapError((err) => Errors.serverError('Failed to write parameters', err))
    );
}
