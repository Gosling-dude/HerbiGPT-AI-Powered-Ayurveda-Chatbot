export interface AskResponse {
  success: boolean;
  answer: string;
  model?: string;
  mode?: 'rag' | 'llm_only' | 'fallback';
  sources?: string[];
  requestId?: string;
  durationMs?: number;
  // Legacy fields
  result?: string;
  status?: string;
  message?: string;
  error?: string;
}

export interface HealthResponse {
  status: string;
  message: string;
  model: string;
  uptime: number;
  timestamp: string;
}

export interface APIError {
  success: false;
  error: string;
  requestId?: string;
}
