/**
 * OpenAI API Client
 * Handles communication with OpenAI GPT-4 API
 * Includes error handling, retries, and rate limiting
 */

export class OpenAIClient {
  constructor(apiKey, options = {}) {
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
   * @param {array} messages - Array of message objects
   * @param {object} options - Additional options
   * @returns {Promise<object>} - Completion response
   */
  async createChatCompletion(messages, options = {}) {
    const requestBody = {
      model: options.model || this.model,
      messages: messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens || 500,
      top_p: options.topP ?? 1,
      frequency_penalty: options.frequencyPenalty ?? 0,
      presence_penalty: options.presencePenalty ?? 0,
      ...options,
    };

    let lastError;
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
        lastError = error;

        // Don't retry on certain errors
        if (error.status === 400 || error.status === 401 || error.status === 403) {
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
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @returns {Promise<object>} - Response data
   */
  async makeRequest(endpoint, body) {
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

    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.error?.message || 'OpenAI API request failed');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  /**
   * Extract text from completion response
   * @param {object} response - Completion response
   * @returns {string} - Extracted text
   */
  extractText(response) {
    return response.choices?.[0]?.message?.content || '';
  }

  /**
   * Extract JSON from completion response
   * @param {object} response - Completion response
   * @returns {object} - Parsed JSON
   */
  extractJSON(response) {
    const text = this.extractText(response);
    try {
      return JSON.parse(text);
    } catch (error) {
      console.error('Failed to parse JSON from response:', text);
      throw new Error('Invalid JSON response from OpenAI');
    }
  }

  /**
   * Get token usage statistics
   * @returns {object} - Token usage stats
   */
  getTokenUsage() {
    return {
      ...this.tokenUsage,
      requestCount: this.requestCount,
      averageTokensPerRequest:
        this.requestCount > 0 ? Math.round(this.tokenUsage.total / this.requestCount) : 0,
    };
  }

  /**
   * Estimate cost based on token usage
   * @param {string} model - Model name
   * @returns {object} - Cost estimate
   */
  estimateCost(model = this.model) {
    // Pricing as of Dec 2024 (approximate)
    const pricing = {
      'gpt-4-turbo-preview': {
        prompt: 0.01 / 1000, // $0.01 per 1K tokens
        completion: 0.03 / 1000, // $0.03 per 1K tokens
      },
      'gpt-4': {
        prompt: 0.03 / 1000,
        completion: 0.06 / 1000,
      },
      'gpt-3.5-turbo': {
        prompt: 0.0005 / 1000,
        completion: 0.0015 / 1000,
      },
    };

    const modelPricing = pricing[model] || pricing['gpt-4-turbo-preview'];

    const promptCost = this.tokenUsage.prompt * modelPricing.prompt;
    const completionCost = this.tokenUsage.completion * modelPricing.completion;
    const totalCost = promptCost + completionCost;

    return {
      promptCost: promptCost.toFixed(4),
      completionCost: completionCost.toFixed(4),
      totalCost: totalCost.toFixed(4),
      currency: 'USD',
    };
  }

  /**
   * Reset usage statistics
   */
  resetUsage() {
    this.tokenUsage = {
      prompt: 0,
      completion: 0,
      total: 0,
    };
    this.requestCount = 0;
  }

  /**
   * Sleep utility
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create a simple completion (convenience method)
   * @param {string} prompt - User prompt
   * @param {object} options - Additional options
   * @returns {Promise<string>} - Completion text
   */
  async complete(prompt, options = {}) {
    const messages = [
      {
        role: 'user',
        content: prompt,
      },
    ];

    const response = await this.createChatCompletion(messages, options);
    return this.extractText(response);
  }

  /**
   * Create a completion with system message
   * @param {string} systemMessage - System message
   * @param {string} userMessage - User message
   * @param {object} options - Additional options
   * @returns {Promise<string>} - Completion text
   */
  async completeWithSystem(systemMessage, userMessage, options = {}) {
    const messages = [
      {
        role: 'system',
        content: systemMessage,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ];

    const response = await this.createChatCompletion(messages, options);
    return this.extractText(response);
  }

  /**
   * Create a JSON completion
   * @param {string} systemMessage - System message
   * @param {string} userMessage - User message
   * @param {object} options - Additional options
   * @returns {Promise<object>} - Parsed JSON response
   */
  async completeJSON(systemMessage, userMessage, options = {}) {
    const messages = [
      {
        role: 'system',
        content: systemMessage,
      },
      {
        role: 'user',
        content: userMessage,
      },
    ];

    // Force JSON response format if supported
    const requestOptions = {
      ...options,
      response_format: { type: 'json_object' },
    };

    const response = await this.createChatCompletion(messages, requestOptions);
    return this.extractJSON(response);
  }

  /**
   * Health check
   * @returns {Promise<boolean>} - True if API is accessible
   */
  async healthCheck() {
    try {
      await this.complete('Say "OK"', { maxTokens: 10 });
      return true;
    } catch (error) {
      console.error('OpenAI health check failed:', error);
      return false;
    }
  }
}

/**
 * Create OpenAI client instance
 * @param {string} apiKey - OpenAI API key
 * @param {object} options - Client options
 * @returns {OpenAIClient} - Client instance
 */
export function createOpenAIClient(apiKey, options = {}) {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }
  return new OpenAIClient(apiKey, options);
}

export default OpenAIClient;
