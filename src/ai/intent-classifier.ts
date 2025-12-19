/**
 * AI-Powered Intent Classifier
 * Uses GPT-4 to understand user intent with high accuracy
 */

// @ts-ignore - Will be migrated to TypeScript
import { buildPrompt } from '../utils/prompt-templates.js';
import type { OpenAIClient } from './openai-client';
import type { OpenAIMessage } from '../types';

export interface IntentClassificationOptions {
  useCache?: boolean;
  cacheTimeout?: number;
}

export interface IntentClassificationResult {
  intent: string;
  confidence: number;
  raw?: string;
  fallback?: boolean;
}

interface CachedIntent {
  data: IntentClassificationResult;
  timestamp: number;
}

export class AIIntentClassifier {
  private openai: OpenAIClient;
  private useCache: boolean;
  private cache: Map<string, CachedIntent>;
  private cacheTimeout: number;
  private intents: string[];

  constructor(openaiClient: OpenAIClient, options: IntentClassificationOptions = {}) {
    this.openai = openaiClient;
    this.useCache = options.useCache !== false;
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes

    // Available intents
    this.intents = [
      'greeting',
      'artist_submission',
      'service_inquiry',
      'pricing_inquiry',
      'booking_request',
      'company_info',
      'artist_roster',
      'recent_releases',
      'events_inquiry',
      'technical_support',
      'general_inquiry',
      'follow_up',
      'contact_request',
      'testimonial_request',
      'career_advice',
    ];
  }

  /**
   * Classify user intent using GPT-4
   * @param message - User message
   * @param conversationHistory - Previous messages
   * @returns Intent classification result
   */
  async classifyIntent(
    message: string,
    conversationHistory: OpenAIMessage[] = []
  ): Promise<IntentClassificationResult> {
    try {
      // Check cache first
      if (this.useCache) {
        const cached = this.getFromCache(message);
        if (cached) {
          return cached;
        }
      }

      // Build context from conversation history
      const context = this.buildContext(conversationHistory);

      // Build prompt
      const messages = buildPrompt('intentClassification', { message });

      // Add conversation context if available
      if (context && messages[0]) {
        messages[0].content += `\n\nConversation context: ${context}`;
      }

      // Call OpenAI
      const response = await this.openai.createChatCompletion(messages, {
        temperature: 0.3,
        maxTokens: 50,
      });

      const messageContent = response.choices[0]?.message?.content;
      const intent = messageContent ? messageContent.trim().toLowerCase() : 'general_inquiry';

      // Validate intent
      const validIntent = this.validateIntent(intent);

      const result: IntentClassificationResult = {
        intent: validIntent,
        confidence: this.calculateConfidence(response),
        raw: intent,
      };

      // Cache result
      if (this.useCache) {
        this.saveToCache(message, result);
      }

      return result;
    } catch (error) {
      console.error('Intent classification error:', error);

      // Fallback to rule-based classification
      return this.fallbackClassification(message);
    }
  }

  /**
   * Validate and normalize intent
   * @param intent - Raw intent from GPT-4
   * @returns Validated intent
   */
  private validateIntent(intent: string): string {
    // Remove any extra text
    const cleaned = intent.toLowerCase().trim();

    // Check if it's a valid intent
    if (this.intents.includes(cleaned)) {
      return cleaned;
    }

    // Try to find closest match
    for (const validIntent of this.intents) {
      if (cleaned.includes(validIntent) || validIntent.includes(cleaned)) {
        return validIntent;
      }
    }

    // Default to general_inquiry
    return 'general_inquiry';
  }

  /**
   * Calculate confidence score from response
   * @param response - OpenAI response
   * @returns Confidence score (0-1)
   */
  private calculateConfidence(_response: any): number {
    // Use logprobs if available, otherwise default to high confidence
    // This is a simplified version - in production, you'd use actual logprobs
    return 0.9;
  }

  /**
   * Build context from conversation history
   * @param conversationHistory - Previous messages
   * @returns Context string
   */
  private buildContext(conversationHistory: OpenAIMessage[]): string {
    if (!conversationHistory || conversationHistory.length === 0) {
      return '';
    }

    // Get last 3 messages for context
    const recentMessages = conversationHistory.slice(-3);
    return recentMessages.map((msg) => `${msg.role}: ${msg.content}`).join('\n');
  }

  /**
   * Fallback to rule-based classification
   * @param message - User message
   * @returns Intent classification result
   */
  private fallbackClassification(message: string): IntentClassificationResult {
    const lowerMessage = message.toLowerCase();

    let intent = 'general_inquiry';

    if (
      lowerMessage.includes('hello') ||
      lowerMessage.includes('hi') ||
      lowerMessage.includes('hey')
    ) {
      intent = 'greeting';
    } else if (
      lowerMessage.includes('submit') ||
      lowerMessage.includes('demo') ||
      lowerMessage.includes('my music')
    ) {
      intent = 'artist_submission';
    } else if (
      lowerMessage.includes('service') ||
      lowerMessage.includes('offer') ||
      lowerMessage.includes('what do you')
    ) {
      intent = 'service_inquiry';
    } else if (
      lowerMessage.includes('price') ||
      lowerMessage.includes('cost') ||
      lowerMessage.includes('how much')
    ) {
      intent = 'pricing_inquiry';
    } else if (
      lowerMessage.includes('book') ||
      lowerMessage.includes('schedule') ||
      lowerMessage.includes('appointment')
    ) {
      intent = 'booking_request';
    } else if (
      lowerMessage.includes('about') ||
      lowerMessage.includes('company') ||
      lowerMessage.includes('who are')
    ) {
      intent = 'company_info';
    } else if (lowerMessage.includes('artist') || lowerMessage.includes('roster')) {
      intent = 'artist_roster';
    } else if (lowerMessage.includes('release') || lowerMessage.includes('new music')) {
      intent = 'recent_releases';
    } else if (
      lowerMessage.includes('event') ||
      lowerMessage.includes('show') ||
      lowerMessage.includes('concert')
    ) {
      intent = 'events_inquiry';
    } else if (
      lowerMessage.includes('contact') ||
      lowerMessage.includes('email') ||
      lowerMessage.includes('phone')
    ) {
      intent = 'contact_request';
    }

    return {
      intent: intent,
      confidence: 0.7,
      fallback: true,
    };
  }

  /**
   * Cache management
   */
  private getFromCache(message: string): IntentClassificationResult | null {
    const key = this.getCacheKey(message);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    return null;
  }

  private saveToCache(message: string, data: IntentClassificationResult): void {
    const key = this.getCacheKey(message);
    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
    });
  }

  private getCacheKey(message: string): string {
    return message.toLowerCase().trim();
  }

  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get intent statistics
   * @returns Intent statistics
   */
  getStats(): { cacheSize: number; availableIntents: number; intents: string[] } {
    return {
      cacheSize: this.cache.size,
      availableIntents: this.intents.length,
      intents: this.intents,
    };
  }
}

export default AIIntentClassifier;