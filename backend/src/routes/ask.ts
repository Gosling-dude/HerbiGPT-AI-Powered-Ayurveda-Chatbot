import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { getOrchestrator } from '../mcp/orchestrator.js';
import { createRequestLogger } from '../utils/logger.js';
import { createAppError } from '../middleware/errorHandler.js';

const router = Router();

const askSchema = z.object({
  question: z
    .string()
    .min(1, 'Question is required')
    .max(2000, 'Question too long (max 2000 characters)')
    .transform(v => v.trim()),
});

/**
 * POST /ask — Process a user question through the MCP RAG pipeline
 */
router.post('/ask', async (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const log = createRequestLogger(req.requestId);

  try {
    // Validate request body
    const parseResult = askSchema.safeParse(req.body);
    if (!parseResult.success) {
      const errors = parseResult.error.issues.map(i => i.message).join(', ');
      throw createAppError(errors, 400);
    }

    const { question } = parseResult.data;
    log.info('Processing question', { question: question.substring(0, 100) });

    // Process through MCP orchestrator
    const orchestrator = getOrchestrator();
    const result = await orchestrator.processQuestion(question);
    const durationMs = Date.now() - start;

    log.info('Question processed successfully', {
      model: result.model,
      mode: result.mode,
      sourcesCount: result.sources.length,
      durationMs,
    });

    res.json({
      success: true,
      answer: result.answer,
      model: result.model,
      mode: result.mode,
      sources: result.sources,
      requestId: req.requestId,
      durationMs,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
