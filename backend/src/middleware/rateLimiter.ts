import rateLimit from 'express-rate-limit';
import { getConfig } from '../config/env.js';

export function createRateLimiter() {
  const config = getConfig();
  
  return rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Too many requests. Please try again later.',
    },
    keyGenerator: (req) => {
      return req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
    },
  });
}
