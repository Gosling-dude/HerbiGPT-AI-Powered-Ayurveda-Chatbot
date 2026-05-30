import type { MCPServer, MCPToolCall, MCPToolResult } from '../types/index.js';
import { LLMServer } from './llm-server.js';
import { KnowledgeServer } from './knowledge-server.js';
import { MonitoringServer } from './monitoring-server.js';
import { DataServer } from './data-server.js';
import { logger } from '../utils/logger.js';

/**
 * MCP Orchestrator — coordinates tool calls across all MCP servers.
 * Replaces tightly-coupled service calls with MCP tool invocation patterns.
 */
export class MCPOrchestrator {
  private servers: Map<string, MCPServer> = new Map();
  private knowledgeServer: KnowledgeServer;
  private monitoringServer: MonitoringServer;

  constructor() {
    const llmServer = new LLMServer();
    this.knowledgeServer = new KnowledgeServer();
    this.monitoringServer = new MonitoringServer();
    const dataServer = new DataServer();

    this.servers.set(llmServer.name, llmServer);
    this.servers.set(this.knowledgeServer.name, this.knowledgeServer);
    this.servers.set(this.monitoringServer.name, this.monitoringServer);
    this.servers.set(dataServer.name, dataServer);

    logger.info(`MCP Orchestrator initialized with ${this.servers.size} servers: ${[...this.servers.keys()].join(', ')}`);
  }

  /**
   * Execute a tool on a specific MCP server.
   */
  async callTool(serverName: string, toolName: string, args: Record<string, unknown>): Promise<MCPToolResult> {
    const server = this.servers.get(serverName);
    if (!server) {
      return { content: `Server not found: ${serverName}`, isError: true };
    }

    const tool = server.tools.find(t => t.name === toolName);
    if (!tool) {
      return { content: `Tool not found: ${toolName} on server ${serverName}`, isError: true };
    }

    const start = Date.now();
    try {
      const result = await server.executeTool({ name: toolName, arguments: args });
      const duration = Date.now() - start;

      // Record metric via monitoring server
      await this.monitoringServer.executeTool({
        name: 'record_metric',
        arguments: { endpoint: `${serverName}/${toolName}`, latencyMs: duration, isError: result.isError || false },
      });

      return result;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      logger.error(`MCP tool call failed: ${serverName}/${toolName}`, { error: msg });
      return { content: msg, isError: true };
    }
  }

  /**
   * High-level RAG pipeline: search knowledge → build context → generate response.
   */
  async processQuestion(question: string): Promise<{ answer: string; model: string; mode: string; sources: string[] }> {
    const start = Date.now();

    // Step 1: Search knowledge base for relevant context
    const knowledgeResult = await this.callTool('knowledge-server', 'search_knowledge', { query: question, topK: 4 });
    
    let context = '';
    let sources: string[] = [];
    
    if (!knowledgeResult.isError) {
      try {
        const parsed = JSON.parse(knowledgeResult.content);
        if (parsed.results && parsed.results.length > 0) {
          context = parsed.results.map((r: any) => r.content).join('\n\n');
          sources = parsed.results.map((r: any) => r.source);
        }
      } catch {
        // If parsing fails, proceed without context
      }
    }

    // Step 2: Generate response using LLM with context
    const llmResult = await this.callTool('llm-server', 'generate_response', {
      question,
      context: context || undefined,
    });

    if (llmResult.isError) {
      throw new Error(`LLM generation failed: ${llmResult.content}`);
    }

    const parsed = JSON.parse(llmResult.content);
    const duration = Date.now() - start;

    // Step 3: Log the interaction
    await this.callTool('monitoring-server', 'log_event', {
      level: 'info',
      message: 'Question processed',
      metadata: {
        question: question.substring(0, 100),
        model: parsed.model,
        hasContext: !!context,
        sourcesCount: sources.length,
        durationMs: duration,
      },
    });

    return {
      answer: parsed.answer,
      model: parsed.model,
      mode: context ? 'rag' : 'llm_only',
      sources: [...new Set(sources)],
    };
  }

  /**
   * Get health status of all MCP servers.
   */
  async getHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};
    for (const [name, server] of this.servers) {
      try {
        // Simple check — try listing tools
        health[name] = server.tools.length > 0;
      } catch {
        health[name] = false;
      }
    }
    return health;
  }

  /**
   * List all available tools across all servers.
   */
  listTools(): Array<{ server: string; tool: string; description: string }> {
    const tools: Array<{ server: string; tool: string; description: string }> = [];
    for (const [serverName, server] of this.servers) {
      for (const tool of server.tools) {
        tools.push({ server: serverName, tool: tool.name, description: tool.description });
      }
    }
    return tools;
  }

  /**
   * Get metrics from monitoring server.
   */
  async getMetrics(): Promise<Record<string, unknown>> {
    const result = await this.callTool('monitoring-server', 'get_metrics', {});
    return JSON.parse(result.content);
  }

  get isKnowledgeReady(): boolean {
    return this.knowledgeServer.isReady;
  }
}

let _orchestrator: MCPOrchestrator | null = null;

export function getOrchestrator(): MCPOrchestrator {
  if (!_orchestrator) {
    _orchestrator = new MCPOrchestrator();
  }
  return _orchestrator;
}
