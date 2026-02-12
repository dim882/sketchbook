import { Result, Future } from '@swan-io/boxed';
import type { Logger } from './logger';

/**
 * Tap a Result to log its outcome. Never swallows errors.
 * Use instead of bare .match() with empty Ok handlers.
 */
export const logResult =
  <T, E>(log: Logger, operation: string, successMessage?: string | ((value: T) => string)) =>
  (result: Result<T, E>): Result<T, E> => {
    result.match({
      Ok: (value) => {
        const message =
          typeof successMessage === 'function'
            ? successMessage(value)
            : successMessage || `${operation} succeeded`;
        log.info(message, { operation });
      },
      Error: (error) => {
        log.error(`${operation} failed`, { operation, error });
      },
    });
    return result;
  };

/**
 * Convert a Result to void while ensuring errors are logged.
 * Replaces silent `Ok: () => {}` patterns.
 */
export const logAndDiscard =
  <T, E>(log: Logger, operation: string) =>
  (result: Result<T, E>): void => {
    logResult(log, operation)(result);
  };

/**
 * Unwrap a Result with a default value, but LOG the error first.
 * NEVER silently swallow errors like .getOr() does.
 */
export const getOrLog =
  <T, E>(log: Logger, operation: string, defaultValue: T) =>
  (result: Result<T, E>): T =>
    result.match({
      Ok: (value) => value,
      Error: (error) => {
        log.warn(`${operation} failed, using default value`, {
          operation,
          error,
        });
        return defaultValue;
      },
    });

/**
 * For Future<Result<T, E>>, log and return the result.
 * Makes async operations visible.
 */
export const logFutureResult =
  <T, E>(log: Logger, operation: string, successMessage?: string | ((value: T) => string)) =>
  (future: Future<Result<T, E>>): Future<Result<T, E>> => {
    log.debug(`${operation} started`, { operation });
    return future.tap((result) => {
      logResult(log, operation, successMessage)(result);
    });
  };
