import type { AskResponse, HealthResponse } from '../types';

const API_BASE = process.env.REACT_APP_API_URL || '';

class APIService {
  private baseUrl: string;
  private maxRetries: number;
  private retryDelayMs: number;

  constructor(baseUrl: string, maxRetries = 3, retryDelayMs = 1000) {
    this.baseUrl = baseUrl;
    this.maxRetries = maxRetries;
    this.retryDelayMs = retryDelayMs;
  }

  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    retries = this.maxRetries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text();
          let errorMessage: string;
          try {
            const parsed = JSON.parse(errorBody);
            errorMessage = parsed.error || `Server error (${response.status})`;
          } catch {
            errorMessage = `Server error (${response.status})`;
          }
          throw new Error(errorMessage);
        }

        return await response.json() as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on 4xx errors
        if (lastError.message.includes('400') || lastError.message.includes('429')) {
          throw lastError;
        }

        if (attempt < retries) {
          const delay = this.retryDelayMs * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  async askQuestion(question: string): Promise<AskResponse> {
    return this.fetchWithRetry<AskResponse>(
      `${this.baseUrl}/ask`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      }
    );
  }

  async checkHealth(): Promise<HealthResponse> {
    return this.fetchWithRetry<HealthResponse>(
      `${this.baseUrl}/health`,
      { method: 'GET' },
      1
    );
  }
}

export const api = new APIService(API_BASE);
export default api;
