import type { MCPServer, MCPToolCall, MCPToolResult, MCPToolDefinition } from '../types/index.js';
import { getLLMService } from '../services/llm.js';
import { logger } from '../utils/logger.js';

/**
 * MCP Server for LLM invocation.
 * Provides tools for generating responses and formatting prompts.
 */
export class LLMServer implements MCPServer {
  name = 'llm-server';
  description = 'MCP server for LLM model invocation and prompt orchestration';
  
  tools: MCPToolDefinition[] = [
    {
      name: 'generate_response',
      description: 'Generate a response to a user question using the configured LLM',
      inputSchema: {
        type: 'object',
        properties: {
          question: { type: 'string', description: 'The user question' },
          context: { type: 'string', description: 'Optional retrieved context for RAG' },
        },
        required: ['question'],
      },
    },
    {
      name: 'format_prompt',
      description: 'Format a prompt with context and question for the LLM',
      inputSchema: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          context: { type: 'string' },
          systemPrompt: { type: 'string' },
        },
        required: ['question'],
      },
    },
    {
      name: 'check_llm_health',
      description: 'Check if the LLM service is available',
      inputSchema: { type: 'object', properties: {} },
    },
  ];

  async executeTool(call: MCPToolCall): Promise<MCPToolResult> {
    switch (call.name) {
      case 'generate_response': {
        const { question, context } = call.arguments as { question: string; context?: string };
        const llm = getLLMService();
        try {
          const result = await llm.generate(question, context);
          return {
            content: JSON.stringify({
              answer: result.content,
              model: result.model,
              tokensUsed: result.tokensUsed,
            }),
          };
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          logger.error('LLM generate_response tool failed', { error: msg });
          return { content: msg, isError: true };
        }
      }

      case 'format_prompt': {
        const { question, context, systemPrompt } = call.arguments as {
          question: string; context?: string; systemPrompt?: string;
        };
        const prompt = [
          systemPrompt || 'You are HerbiGPT, an expert Ayurvedic wellness guide.',
          context ? `\nCONTEXT:\n${context}` : '',
          `\nQUESTION:\n${question}`,
          '\nANSWER:',
        ].join('');
        return { content: prompt };
      }

      case 'check_llm_health': {
        const llm = getLLMService();
        const healthy = await llm.checkHealth();
        return { content: JSON.stringify({ available: healthy, model: llm.activeModel }) };
      }

      default:
        return { content: `Unknown tool: ${call.name}`, isError: true };
    }
  }
}
