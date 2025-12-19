/**
 * AI Module - Unified Interface
 * Combines all AI components into a single, easy-to-use interface
 */

import { OpenAIClient } from './openai-client';
import { AIIntentClassifier } from './intent-classifier';
import { AIEntityExtractor } from './entity-extractor';
import { AISentimentAnalyzer } from './sentiment-analyzer';
import { AIResponseGenerator } from './response-generator';
import type { OpenAIMessage, ChatResponse } from '../types';

export interface AIAssistantOptions {
  apiKey: string;
  model?: string;
  useCache?: boolean;
  cacheTimeout?: number;
}

export interface ProcessMessageOptions {
  conversationHistory?: OpenAIMessage[];
  liveData?: Record<string, any>;
  userProfile?: Record<string, any>;
}

export class AIAssistant {
  private openai: OpenAIClient;
  private intentClassifier: AIIntentClassifier;
  private entityExtractor: AIEntityExtractor;
  private sentimentAnalyzer: AISentimentAnalyzer;
  private responseGenerator: AIResponseGenerator;

  constructor(options: AIAssistantOptions) {
    // Initialize OpenAI client
    this.openai = new OpenAIClient(options.apiKey, {
      model: options.model,
    });

    // Initialize AI components
    this.intentClassifier = new AIIntentClassifier(this.openai, {
      useCache: options.useCache,
      cacheTimeout: options.cacheTimeout,
    });

    this.entityExtractor = new AIEntityExtractor(this.openai, {
      useCache: options.useCache,
      cacheTimeout: options.cacheTimeout,
    });

    this.sentimentAnalyzer = new AISentimentAnalyzer(this.openai, {
      useCache: options.useCache,
      cacheTimeout: options.cacheTimeout,
    });

    this.responseGenerator = new AIResponseGenerator(this.openai, {
      useCache: options.useCache,
      cacheTimeout: options.cacheTimeout,
    });
  }

  /**
   * Process user message through complete AI pipeline
   * @param message - User message
   * @param options - Processing options
   * @returns Complete chat response
   */
  async processMessage(message: string, options: ProcessMessageOptions = {}): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      // Run AI analysis in parallel for speed
      const [intentResult, entities, sentiment] = await Promise.all([
        this.intentClassifier.classifyIntent(message, options.conversationHistory),
        this.entityExtractor.extractEntities(message, {
          conversationHistory: options.conversationHistory,
        }),
        this.sentimentAnalyzer.analyzeSentiment(message, options.conversationHistory),
      ]);

      // Generate response with all context
      const response = await this.responseGenerator.generateResponse(message, {
        intent: intentResult.intent,
        entities,
        sentiment,
        conversationHistory: options.conversationHistory,
        liveData: options.liveData,
        userProfile: options.userProfile,
      });

      // Add response time
      if (response.metadata) {
        response.metadata.responseTime = Date.now() - startTime;
      }

      return response;
    } catch (error) {
      console.error('AI processing error:', error);

      // Return fallback response
      return {
        response: "I apologize, but I'm having trouble processing your message right now. Please try again or contact us directly at contact@hlpflrecords.com.",
        metadata: {
          responseTime: Date.now() - startTime,
          cached: false,
          confidence: 0.5,
        },
      };
    }
  }

  /**
   * Get comprehensive statistics
   */
  getStats(): {
    openai: { requestCount: number; tokenUsage: any; estimatedCost: number };
    intentClassifier: any;
    entityExtractor: any;
    sentimentAnalyzer: any;
    responseGenerator: any;
  } {
    return {
      openai: {
        requestCount: this.openai.getRequestCount(),
        tokenUsage: this.openai.getTokenUsage(),
        estimatedCost: this.openai.estimateCost(),
      },
      intentClassifier: this.intentClassifier.getStats(),
      entityExtractor: this.entityExtractor.getStats(),
      sentimentAnalyzer: this.sentimentAnalyzer.getStats(),
      responseGenerator: this.responseGenerator.getStats(),
    };
  }

  /**
   * Clear all caches
   */
  clearCaches(): void {
    this.intentClassifier.clearCache();
    this.entityExtractor.clearCache();
    this.sentimentAnalyzer.clearCache();
    this.responseGenerator.clearCache();
  }

  /**
   * Reset all statistics
   */
  resetStats(): void {
    this.openai.resetStats();
  }

  /**
   * Health check - verify all components are working
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await this.openai.healthCheck();
    } catch (error) {
      console.error('AI health check failed:', error);
      return false;
    }
  }
}

// Export all components
export { OpenAIClient } from './openai-client';
export { AIIntentClassifier } from './intent-classifier';
export { AIEntityExtractor } from './entity-extractor';
export { AISentimentAnalyzer } from './sentiment-analyzer';
export { AIResponseGenerator } from './response-generator';

export default AIAssistant;