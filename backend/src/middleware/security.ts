import helmet from 'helmet';
import { Request, Response, NextFunction } from 'express';

export const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

export function sanitizeInput(req: Request, _res: Response, next: NextFunction): void {
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        // Strip HTML tags
        req.body[key] = req.body[key]
          .replace(/<[^>]*>/g, '')
          .trim();
        // Limit string length to 2000 characters
        if (req.body[key].length > 2000) {
          req.body[key] = req.body[key].substring(0, 2000);
        }
      }
    }
  }
  next();
}
