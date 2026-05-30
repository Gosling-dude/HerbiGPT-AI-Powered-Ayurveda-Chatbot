import winston from 'winston';
import { getConfig } from '../config/env.js';

const config = getConfig();

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  config.NODE_ENV === 'production'
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
          const reqId = requestId ? ` [${requestId}]` : '';
          const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${level}${reqId}: ${message}${metaStr}`;
        })
      )
);

export const logger = winston.createLogger({
  level: config.LOG_LEVEL,
  format: logFormat,
  defaultMeta: { service: 'herbigpt-backend' },
  transports: [
    new winston.transports.Console(),
  ],
});

export function createRequestLogger(requestId: string) {
  return logger.child({ requestId });
}
