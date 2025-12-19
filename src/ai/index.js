/**
 * AI Module Integration
 * Combines all AI components into a unified interface
 */

import { OpenAIClient } from './openai-client.js';
import { AIIntentClassifier } from './intent-classifier.js';
import { AIEntityExtractor } from './entity-extractor.js';
import { AISentimentAnalyzer } from './sentiment-analyzer.js';
import { AIResponseGenerator } from './response-generator.js';

export class AIAssistant {
  constructor(env, liveData, options = {}) {
    // Initialize OpenAI client
    this.openai = new OpenAIClient(env.OPENAI_API_KEY, {
      model: options.model || 'gpt-4-turbo-preview',
      maxRetries: options.maxRetries || 3
    });

    // Initialize AI components
    this.intentClassifier = new AIIntentClassifier(this.openai, options);
    this.entityExtractor = new AIEntityExtractor(this.openai, options);
    this.sentimentAnalyzer = new AISentimentAnalyzer(this.openai, options);
    this.responseGenerator = new AIResponseGenerator(this.openai, liveData, options);

    this.liveData = liveData;
  }

  /**
   * Process user message with full AI pipeline
   * @param {string} message - User message
   * @param {object} context - Additional context
   * @returns {Promise<object>} - Complete AI response
   */
  async processMessage(message, context = {}) {
    try {
      // Step 1: Classify intent
      const intentResult = await this.intentClassifier.classifyIntent(
        message,
        context.conversationHistory
      );

      // Step 2: Extract entities
      const entities = await this.entityExtractor.extractEntities(
        message,
        context
      );

      // Step 3: Analyze sentiment
      const sentiment = await this.sentimentAnalyzer.analyzeSentiment(
        message,
        context
      );

      // Step 4: Generate response
      const response = await this.responseGenerator.generateResponse(
        intentResult.intent,
        entities,
        sentiment,
        message,
        context
      );

      // Return complete result
      return {
        message: message,
        intent: intentResult,
        entities: entities,
        sentiment: sentiment,
        response: response,
        timestamp: new Date().toISOString(),
        tokenUsage: this.openai.getTokenUsage(),
        cost: this.openai.estimateCost()
      };
    } catch (error) {
      console.error('AI processing error:', error);
      
      // Fallback response
      return {
        message: message,
        intent: { intent: 'fallback', confidence: 0, fallback: true },
        entities: {},
        sentiment: { sentiment: 'neutral', confidence: 0.5, emotion: 'neutral', urgency: 'medium', tone: 'casual' },
        response: await this.responseGenerator.fallbackResponse('fallback', {}, message),
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }

  /**
   * Get comprehensive statistics
   * @returns {object} - Statistics from all components
   */
  getStats() {
    return {
      openai: this.openai.getTokenUsage(),
      cost: this.openai.estimateCost(),
      intentClassifier: this.intentClassifier.getStats(),
      entityExtractor: this.entityExtractor.getStats(),
      sentimentAnalyzer: this.sentimentAnalyzer.getStats(),
      responseGenerator: this.responseGenerator.getStats()
    };
  }

  /**
   * Clear all caches
   */
  clearCaches() {
    this.intentClassifier.clearCache();
    this.entityExtractor.clearCache();
    this.sentimentAnalyzer.clearCache();
  }

  /**
   * Reset usage statistics
   */
  resetUsage() {
    this.openai.resetUsage();
  }

  /**
   * Health check for all AI components
   * @returns {Promise<object>} - Health status
   */
  async healthCheck() {
    const health = {
      openai: await this.openai.healthCheck(),
      timestamp: new Date().toISOString()
    };

    return {
      healthy: health.openai,
      details: health
    };
  }
}

/**
 * Create AI Assistant instance
 * @param {object} env - Environment variables
 * @param {object} liveData - Live data integration instance
 * @param {object} options - Configuration options
 * @returns {AIAssistant} - AI Assistant instance
 */
export function createAIAssistant(env, liveData, options = {}) {
  if (!env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required');
  }
  return new AIAssistant(env, liveData, options);
}

// Export individual components
export {
  OpenAIClient,
  AIIntentClassifier,
  AIEntityExtractor,
  AISentimentAnalyzer,
  AIResponseGenerator
};

export default AIAssistant;