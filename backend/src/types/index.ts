export interface AskRequest {
  question: string;
}

export interface AskResponse {
  success: boolean;
  answer: string;
  model: string;
  mode: 'rag' | 'llm_only' | 'fallback';
  requestId?: string;
  durationMs?: number;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'error';
  message: string;
  model: string;
  uptime: number;
  timestamp: string;
}

export interface ReadinessResponse {
  status: 'ready' | 'not_ready';
  checks: {
    llm: boolean;
    vectorStore: boolean;
  };
}

export interface MCPToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface MCPToolResult {
  content: string;
  isError?: boolean;
}

export interface MCPServer {
  name: string;
  description: string;
  tools: MCPToolDefinition[];
  executeTool(call: MCPToolCall): Promise<MCPToolResult>;
}

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}
