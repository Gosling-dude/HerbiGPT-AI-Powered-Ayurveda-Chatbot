import express from 'express';
import cors from 'cors';
import { getConfig, validateConfig } from './config/env.js';
import { logger } from './utils/logger.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { requestLoggerMiddleware } from './middleware/logging.js';
import { securityHeaders, sanitizeInput } from './middleware/security.js';
import { createRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import healthRoutes from './routes/health.js';
import askRoutes from './routes/ask.js';

async function startServer(): Promise<void> {
  // Validate environment
  const config = getConfig();
  validateConfig();

  logger.info('Starting HerbiGPT Backend...', {
    nodeEnv: config.NODE_ENV,
    port: config.PORT,
    host: config.HOST,
  });

  const app = express();

  // ── Core Middleware ──────────────────────────────────────────
  app.use(securityHeaders);
  app.use(cors({
    origin: config.CORS_ORIGIN === '*' ? true : config.CORS_ORIGIN.split(','),
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    credentials: true,
  }));
  app.use(express.json({ limit: '10kb' }));
  app.use(requestIdMiddleware);
  app.use(requestLoggerMiddleware);
  app.use(sanitizeInput);

  // ── Rate Limiting ───────────────────────────────────────────
  app.use('/ask', createRateLimiter());

  // ── Routes ──────────────────────────────────────────────────
  app.use('/', healthRoutes);
  app.use('/', askRoutes);

  // ── Error Handling ──────────────────────────────────────────
  app.use(notFoundHandler);
  app.use(errorHandler);

  // ── Start Server ────────────────────────────────────────────
  const server = app.listen(config.PORT, config.HOST, () => {
    logger.info(`✓ HerbiGPT Backend running on http://${config.HOST.replace('0.0.0.0', 'localhost')}:${config.PORT}`, {
      endpoints: {
        health: `GET /health`,
        ready: `GET /ready`,
        live: `GET /live`,
        metrics: `GET /metrics`,
        ask: `POST /ask`,
        mcpTools: `GET /mcp/tools`,
      },
    });
  });

  // ── Graceful Shutdown ───────────────────────────────────────
  const shutdown = (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception', { error: err.message, stack: err.stack });
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled Rejection', { reason: String(reason) });
  });
}

startServer().catch((err) => {
  logger.error('Failed to start server', { error: err.message, stack: err.stack });
  process.exit(1);
});
