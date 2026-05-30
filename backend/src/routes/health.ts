import { Router, Request, Response } from 'express';
import { getOrchestrator } from '../mcp/orchestrator.js';
import { getLLMService } from '../services/llm.js';

const router = Router();
const startTime = Date.now();

/**
 * GET /health — Basic health check
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'HerbiGPT Backend is running',
    model: getLLMService().activeModel,
    uptime: Math.round((Date.now() - startTime) / 1000),
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /ready — Readiness probe (checks service dependencies)
 */
router.get('/ready', async (_req: Request, res: Response) => {
  try {
    const orchestrator = getOrchestrator();
    const llmHealthy = await getLLMService().checkHealth();
    const knowledgeReady = orchestrator.isKnowledgeReady;

    const isReady = llmHealthy && knowledgeReady;

    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'ready' : 'not_ready',
      checks: {
        llm: llmHealthy,
        knowledgeBase: knowledgeReady,
      },
    });
  } catch (error) {
    res.status(503).json({
      status: 'not_ready',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /live — Liveness probe (process is alive)
 */
router.get('/live', (_req: Request, res: Response) => {
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

/**
 * GET /metrics — Application metrics
 */
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const orchestrator = getOrchestrator();
    const metrics = await orchestrator.getMetrics();
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve metrics' });
  }
});

/**
 * GET /mcp/tools — List all available MCP tools
 */
router.get('/mcp/tools', (_req: Request, res: Response) => {
  const orchestrator = getOrchestrator();
  const tools = orchestrator.listTools();
  res.json({ tools, count: tools.length });
});

export default router;
