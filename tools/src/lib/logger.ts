import winston from 'winston';

const { combine, timestamp, printf, errors, colorize } = winston.format;

// Custom format for dev (human-readable)
const devFormat = printf(({ timestamp, level, message, module, stack, ...meta }) => {
  const prefix = module ? `[${module}]` : '';
  const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
  const stackStr = stack ? `\n${stack}` : '';
  return `${timestamp} ${level} ${prefix} ${message}${metaStr}${stackStr}`;
});

// Create base logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    process.env.NODE_ENV === 'production' ? winston.format.json() : combine(colorize(), devFormat)
  ),
  transports: [new winston.transports.Console()],
});

export type Logger = winston.Logger;

// Factory for module-specific loggers
export const createLogger = (module: string): Logger => logger.child({ module });
