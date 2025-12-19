/**
 * OpenAI API Client
 * Handles communication with OpenAI GPT-4 API
 * Includes error handling, retries, and rate limiting
 */

import type { OpenAIMessage, OpenAIRequest, OpenAIResponse, OpenAIError } from '../types';

export interface OpenAIClientOptions {
  baseUrl?: string;
  model?: string;
  maxRetries?: number;
  timeout?: number;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stream?: boolean;
}

export interface TokenUsage {
  prompt: number;
  completion: number;
  total: number;
}

export class OpenAIClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;
  private maxRetries: number;
  private timeout: number;
  private requestCount: number;
  private tokenUsage: TokenUsage;

  constructor(apiKey: string, options: OpenAIClientOptions = {}) {
    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl || 'https://api.openai.com/v1';
    this.model = options.model || 'gpt-4-turbo-preview';
    this.maxRetries = options.maxRetries || 3;
    this.timeout = options.timeout || 30000; // 30 seconds
    this.requestCount = 0;
    this.tokenUsage = {
      prompt: 0,
      completion: 0,
      total: 0,
    };
  }

  /**
   * Create a chat completion
   * @param messages - Array of message objects
   * @param options - Additional options
   * @returns Completion response
   */
  async createChatCompletion(
    messages: OpenAIMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<OpenAIResponse> {
    const requestBody: OpenAIRequest = {
      model: options.model || this.model,
      messages: messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 500,
      top_p: options.topP ?? 1,
      frequency_penalty: options.frequencyPenalty ?? 0,
      presence_penalty: options.presencePenalty ?? 0,
      stream: options.stream,
    };

    let lastError: Error | undefined;
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.makeRequest('/chat/completions', requestBody);

        // Track token usage
        if (response.usage) {
          this.tokenUsage.prompt += response.usage.prompt_tokens;
          this.tokenUsage.completion += response.usage.completion_tokens;
          this.tokenUsage.total += response.usage.total_tokens;
        }

        this.requestCount++;
        return response;
      } catch (error) {
        lastError = error as Error;

        // Don't retry on certain errors
        const statusError = error as { status?: number };
        if (
          statusError.status === 400 ||
          statusError.status === 401 ||
          statusError.status === 403
        ) {
          throw error;
        }

        // Exponential backoff
        if (attempt < this.maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await this.sleep(delay);
        }
      }
    }

    throw lastError;
  }

  /**
   * Make API request
   * @param endpoint - API endpoint
   * @param body - Request body
   * @returns Response data
   */
  private async makeRequest(endpoint: string, body: OpenAIRequest): Promise<OpenAIResponse> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(this.timeout),
    });

    const data = (await response.json()) as OpenAIResponse | OpenAIError;

    if (!response.ok) {
      const errorData = data as OpenAIError;
      const error = new Error(errorData.error?.message || 'OpenAI API request failed') as Error & {
        status: number;
        data: OpenAIError;
      };
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    return data as OpenAIResponse;
  }

  /**
   * Sleep for specified milliseconds
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Get token usage statistics
   * @returns Token usage object
   */
  getTokenUsage(): TokenUsage {
    return { ...this.tokenUsage };
  }

  /**
   * Get request count
   * @returns Number of requests made
   */
  getRequestCount(): number {
    return this.requestCount;
  }

  /**
   * Reset statistics
   */
  resetStats(): void {
    this.requestCount = 0;
    this.tokenUsage = {
      prompt: 0,
      completion: 0,
      total: 0,
    };
  }

  /**
   * Estimate cost based on token usage
   * @param model - Model name (defaults to instance model)
   * @returns Estimated cost in USD
   */
  estimateCost(model?: string): number {
    const modelName = model || this.model;

    // Pricing per 1K tokens (as of Dec 2024)
    const pricing: Record<string, { prompt: number; completion: number }> = {
      'gpt-4-turbo-preview': { prompt: 0.01, completion: 0.03 },
      'gpt-4': { prompt: 0.03, completion: 0.06 },
      'gpt-3.5-turbo': { prompt: 0.0005, completion: 0.0015 },
    };

    const modelPricing = pricing[modelName] || pricing['gpt-4-turbo-preview'];
    
    if (!modelPricing) {
      return 0;
    }

    const promptCost = (this.tokenUsage.prompt / 1000) * modelPricing.prompt;
    const completionCost = (this.tokenUsage.completion / 1000) * modelPricing.completion;

    return promptCost + completionCost;
  }

  /**
   * Health check - verify API key is valid
   * @returns True if API is accessible
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.createChatCompletion(
        [{ role: 'user', content: 'Hello' }],
        { maxTokens: 5 }
      );
      return true;
    } catch (error) {
      console.error('OpenAI health check failed:', error);
      return false;
    }
  }

  /**
   * Count tokens in text (approximate)
   * @param text - Text to count tokens for
   * @returns Approximate token count
   */
  countTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    // For accurate counting, use tiktoken library
    return Math.ceil(text.length / 4);
  }
}