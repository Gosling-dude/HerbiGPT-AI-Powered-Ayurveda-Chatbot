import type { MCPServer, MCPToolCall, MCPToolResult, MCPToolDefinition } from '../types/index.js';
import { logger } from '../utils/logger.js';

interface StoredEmbedding {
  id: string;
  text: string;
  vector: number[];
  metadata: Record<string, string>;
}

/**
 * MCP Server for vector retrieval, embeddings, and storage.
 * Placeholder implementation using in-memory storage.
 * Will be upgraded to Vertex AI Vector Search in GCP deployment.
 */
export class DataServer implements MCPServer {
  name = 'data-server';
  description = 'MCP server for vector retrieval, embeddings, and storage';

  private store: Map<string, StoredEmbedding> = new Map();

  tools: MCPToolDefinition[] = [
    {
      name: 'vector_search',
      description: 'Search for similar vectors in the store',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          topK: { type: 'number', default: 4 },
        },
        required: ['query'],
      },
    },
    {
      name: 'store_embedding',
      description: 'Store a text with its embedding',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          text: { type: 'string' },
          metadata: { type: 'object' },
        },
        required: ['id', 'text'],
      },
    },
    {
      name: 'get_store_stats',
      description: 'Get statistics about the data store',
      inputSchema: { type: 'object', properties: {} },
    },
  ];

  async executeTool(call: MCPToolCall): Promise<MCPToolResult> {
    switch (call.name) {
      case 'vector_search': {
        const { query, topK } = call.arguments as { query: string; topK?: number };
        // Simple keyword-based search as placeholder for vector similarity
        const queryTerms = query.toLowerCase().split(/\s+/);
        const results = Array.from(this.store.values())
          .map(item => {
            const text = item.text.toLowerCase();
            const score = queryTerms.reduce((s, term) => s + (text.includes(term) ? 1 : 0), 0);
            return { item, score };
          })
          .filter(r => r.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, topK || 4)
          .map(r => ({ id: r.item.id, text: r.item.text, metadata: r.item.metadata, score: r.score }));

        return { content: JSON.stringify({ results, count: results.length }) };
      }

      case 'store_embedding': {
        const { id, text, metadata } = call.arguments as {
          id: string; text: string; metadata?: Record<string, string>;
        };
        this.store.set(id, {
          id,
          text,
          vector: [], // Placeholder — real implementation would compute embeddings
          metadata: metadata || {},
        });
        logger.debug(`Stored embedding: ${id}`);
        return { content: JSON.stringify({ stored: true, id }) };
      }

      case 'get_store_stats': {
        return {
          content: JSON.stringify({
            total_documents: this.store.size,
            storage_type: 'in-memory',
            note: 'Will be upgraded to Vertex AI Vector Search in GCP deployment',
          }),
        };
      }

      default:
        return { content: `Unknown tool: ${call.name}`, isError: true };
    }
  }
}
