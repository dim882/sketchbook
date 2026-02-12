import { createLogger } from './logger';

const log = createLogger('process');

/**
 * Install global error handlers. Call this at the start of every entry point.
 * Ensures that no errors escape without being logged.
 */
export function installErrorHandlers(): void {
  process.on('uncaughtException', (error: Error) => {
    log.error('Uncaught exception - process will exit', {
      type: 'uncaughtException',
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason: unknown) => {
    log.error('Unhandled promise rejection', {
      type: 'unhandledRejection',
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
    // Don't exit for unhandled rejections in dev - let the developer see and fix
  });

  process.on('SIGTERM', () => {
    log.info('Received SIGTERM, shutting down gracefully');
    process.exit(0);
  });

  process.on('SIGINT', () => {
    log.info('Received SIGINT, shutting down gracefully');
    process.exit(0);
  });

  log.debug('Process error handlers installed');
}
