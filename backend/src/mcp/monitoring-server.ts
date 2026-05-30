import type { MCPServer, MCPToolCall, MCPToolResult, MCPToolDefinition } from '../types/index.js';
import { logger } from '../utils/logger.js';

interface MetricsData {
  requestCount: number;
  errorCount: number;
  totalLatencyMs: number;
  requestsByEndpoint: Record<string, number>;
  startTime: number;
}

/**
 * MCP Server for monitoring, logging, and metrics.
 */
export class MonitoringServer implements MCPServer {
  name = 'monitoring-server';
  description = 'MCP server for logs, metrics, and tracing';
  
  private metrics: MetricsData = {
    requestCount: 0,
    errorCount: 0,
    totalLatencyMs: 0,
    requestsByEndpoint: {},
    startTime: Date.now(),
  };

  tools: MCPToolDefinition[] = [
    {
      name: 'log_event',
      description: 'Log a structured event',
      inputSchema: {
        type: 'object',
        properties: {
          level: { type: 'string', enum: ['info', 'warn', 'error', 'debug'] },
          message: { type: 'string' },
          metadata: { type: 'object' },
        },
        required: ['level', 'message'],
      },
    },
    {
      name: 'record_metric',
      description: 'Record a request metric',
      inputSchema: {
        type: 'object',
        properties: {
          endpoint: { type: 'string' },
          latencyMs: { type: 'number' },
          isError: { type: 'boolean' },
        },
        required: ['endpoint', 'latencyMs'],
      },
    },
    {
      name: 'get_metrics',
      description: 'Get current metrics summary',
      inputSchema: { type: 'object', properties: {} },
    },
  ];

  async executeTool(call: MCPToolCall): Promise<MCPToolResult> {
    switch (call.name) {
      case 'log_event': {
        const { level, message, metadata } = call.arguments as {
          level: string; message: string; metadata?: Record<string, unknown>;
        };
        const logFn = (logger as any)[level] || logger.info;
        logFn.call(logger, message, metadata || {});
        return { content: 'Event logged' };
      }

      case 'record_metric': {
        const { endpoint, latencyMs, isError } = call.arguments as {
          endpoint: string; latencyMs: number; isError?: boolean;
        };
        this.metrics.requestCount++;
        this.metrics.totalLatencyMs += latencyMs;
        this.metrics.requestsByEndpoint[endpoint] = (this.metrics.requestsByEndpoint[endpoint] || 0) + 1;
        if (isError) this.metrics.errorCount++;
        return { content: 'Metric recorded' };
      }

      case 'get_metrics': {
        const uptimeMs = Date.now() - this.metrics.startTime;
        const avgLatency = this.metrics.requestCount > 0
          ? Math.round(this.metrics.totalLatencyMs / this.metrics.requestCount)
          : 0;

        return {
          content: JSON.stringify({
            uptime_seconds: Math.round(uptimeMs / 1000),
            total_requests: this.metrics.requestCount,
            error_count: this.metrics.errorCount,
            error_rate: this.metrics.requestCount > 0
              ? (this.metrics.errorCount / this.metrics.requestCount * 100).toFixed(2) + '%'
              : '0%',
            avg_latency_ms: avgLatency,
            requests_by_endpoint: this.metrics.requestsByEndpoint,
          }),
        };
      }

      default:
        return { content: `Unknown tool: ${call.name}`, isError: true };
    }
  }
}
