import { Result, Future } from '@swan-io/boxed';
import type { Logger } from './logger';

/**
 * Tap a Result to log its outcome, then return the Result unchanged.
 * Use when you want visibility into success/failure without altering the flow.
 *
 * @example
 * // Log with default success message
 * saveFile(path, content)
 *   .tap(logResult(log, 'save file'))
 *   .flatMapOk(nextStep);
 *
 * @example
 * // Log with custom success message
 * fetchUser(id)
 *   .tap(logResult(log, 'fetch user', (user) => `Fetched user ${user.name}`))
 *   .flatMapOk(renderProfile);
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
 * Log a Result's outcome and discard the value.
 * Use when you need to perform a side effect but don't need the result.
 * Replaces the anti-pattern: `result.match({ Ok: () => {}, Error: ... })`
 *
 * @example
 * // Fire-and-forget cleanup with logging
 * const cleanup = cleanupTempFiles(dir);
 * logAndDiscard(log, 'cleanup temp files')(cleanup);
 *
 * @example
 * // In a forEach where you just want side effects logged
 * results.forEach(logAndDiscard(log, 'process item'));
 */
export const logAndDiscard =
  <T, E>(log: Logger, operation: string) =>
    (result: Result<T, E>): void => {
      logResult(log, operation)(result);
    };

/**
 * Extract a value from a Result, using a default on error, but LOG the error first.
 * Replaces `.getOr()` which silently swallows errors.
 *
 * @example
 * // In a .map() chain - logs warning if glob fails, continues with empty array
 * Future.fromPromise(fg(['**\/*.ts'], config))
 *   .map(getOrLog(log, 'glob search', []))
 *   .map(processFiles);
 *
 * @example
 * // Standalone usage
 * const config = getOrLog(log, 'load config', defaultConfig)(loadConfig());
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
 * Log the start and outcome of a Future<Result>.
 * Use for async operations where you want visibility into timing.
 * Note: This returns a function that takes and returns a Future, so use it inline.
 *
 * @example
 * // Wrap an async operation to log start/end
 * const loggedFetch = logFutureResult(log, 'fetch user data')(fetchUserData(userId));
 * loggedFetch.tap(sendResponse);
 *
 * @example
 * // Or create a logged version of an operation
 * const fetchWithLogging = (id: string) =>
 *   logFutureResult(log, 'fetch user')(fetchUserData(id));
 */
export const logFutureResult =
  <T, E>(log: Logger, operation: string, successMessage?: string | ((value: T) => string)) =>
    (future: Future<Result<T, E>>): Future<Result<T, E>> => {
      log.debug(`${operation} started`, { operation });

      return future.tap((result) => {
        logResult(log, operation, successMessage)(result);
      });
    };
