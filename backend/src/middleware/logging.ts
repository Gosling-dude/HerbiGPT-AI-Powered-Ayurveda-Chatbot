import { Request, Response, NextFunction } from 'express';
import { createRequestLogger } from '../utils/logger.js';

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const log = createRequestLogger(req.requestId);

  log.info('Request received', {
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });

  const originalEnd = res.end.bind(res);
  res.end = function (this: Response, ...args: any[]): Response {
    const duration = Date.now() - start;
    log.info('Response sent', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs: duration,
    });
    return originalEnd(...args);
  } as typeof res.end;

  next();
}
