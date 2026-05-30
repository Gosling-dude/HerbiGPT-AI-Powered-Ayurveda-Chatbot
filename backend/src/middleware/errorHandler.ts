import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(err: AppError, req: Request, res: Response, _next: NextFunction): void {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational ?? false;

  logger.error('Unhandled error', {
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    statusCode,
    error: err.message,
    stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined,
    isOperational,
  });

  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
    requestId: req.requestId,
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: `Route ${req.method} ${req.path} not found`,
    requestId: req.requestId,
  });
}

export function createAppError(message: string, statusCode: number): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}
