/**
 * AI-Powered Sentiment Analyzer
 * Analyzes user sentiment, emotions, and urgency using GPT-4
 */

// @ts-ignore - Will be migrated to TypeScript
import { buildPrompt } from '../utils/prompt-templates.js';
import type { OpenAIClient } from './openai-client';
import type { SentimentAnalysis, OpenAIMessage } from '../types';

export interface SentimentAnalysisOptions {
  useCache?: boolean;
  cacheTimeout?: number;
}

interface CachedSentiment {
  data: SentimentAnalysis;
  timestamp: number;
}

export class AISentimentAnalyzer {
  private openai: OpenAIClient;
  private useCache: boolean;
  private cache: Map<string, CachedSentiment>;
  private cacheTimeout: number;

  constructor(openaiClient: OpenAIClient, options: SentimentAnalysisOptions = {}) {
    this.openai = openaiClient;
    this.useCache = options.useCache !== false;
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
  }

  /**
   * Analyze sentiment of user message
   * @param message - User message
   * @param conversationHistory - Previous messages
   * @returns Sentiment analysis result
   */
  async analyzeSentiment(
    message: string,
    conversationHistory: OpenAIMessage[] = []
  ): Promise<SentimentAnalysis> {
    try {
      // Check cache first
      if (this.useCache) {
        const cached = this.getFromCache(message);
        if (cached) {
          return cached;
        }
      }

      // Build context
      const context = this.buildContext(conversationHistory);

      // Build prompt
      const messages = buildPrompt('sentimentAnalysis', { message });

      // Add context if available
      if (context) {
        messages[0].content += `\n\nConversation context: ${context}`;
      }

      // Call OpenAI
      const response = await this.openai.createChatCompletion(messages, {
        temperature: 0.3,
        maxTokens: 150,
      });

      // Parse JSON response
      const content = response.choices[0]?.message?.content || '{}';
      const rawSentiment = JSON.parse(content) as Record<string, any>;

      // Validate and normalize
      const sentiment = this.validateSentiment(rawSentiment);

      // Cache result
      if (this.useCache) {
        this.saveToCache(message, sentiment);
      }

      return sentiment;
    } catch (error) {
      console.error('Sentiment analysis error:', error);

      // Fallback to rule-based analysis
      return this.fallbackAnalysis(message);
    }
  }

  /**
   * Validate and normalize sentiment analysis
   * @param sentiment - Raw sentiment from GPT-4
   * @returns Validated sentiment
   */
  private validateSentiment(sentiment: Record<string, any>): SentimentAnalysis {
    return {
      sentiment: this.normalizeSentiment(sentiment['sentiment']),
      score: typeof sentiment['score'] === 'number' ? sentiment['score'] : 0.5,
      emotions: this.normalizeEmotions(sentiment['emotions']),
      urgency: this.normalizeUrgency(sentiment['urgency']),
      tone: this.normalizeTone(sentiment['tone']),
    };
  }

  /**
   * Normalize sentiment
   */
  private normalizeSentiment(sentiment: any): 'positive' | 'negative' | 'neutral' {
    const normalized = String(sentiment).toLowerCase().trim();
    if (normalized.includes('positive')) return 'positive';
    if (normalized.includes('negative')) return 'negative';
    return 'neutral';
  }

  /**
   * Normalize emotions
   */
  private normalizeEmotions(emotions: any): SentimentAnalysis['emotions'] {
    if (!Array.isArray(emotions)) return [];

    return emotions
      .map((emotion: any) => ({
        type: this.normalizeEmotionType(emotion.type || emotion),
        intensity: typeof emotion.intensity === 'number' ? emotion.intensity : 0.5,
      }))
      .slice(0, 3); // Keep top 3 emotions
  }

  /**
   * Normalize emotion type
   */
  private normalizeEmotionType(type: any): SentimentAnalysis['emotions'][0]['type'] {
    const normalized = String(type).toLowerCase().trim();
    const validTypes: SentimentAnalysis['emotions'][0]['type'][] = [
      'excited',
      'frustrated',
      'curious',
      'anxious',
      'hopeful',
      'confused',
      'satisfied',
      'disappointed',
      'neutral',
    ];

    for (const validType of validTypes) {
      if (normalized.includes(validType)) {
        return validType;
      }
    }

    return 'neutral';
  }

  /**
   * Normalize urgency
   */
  private normalizeUrgency(urgency: any): 'high' | 'medium' | 'low' {
    const normalized = String(urgency).toLowerCase().trim();
    if (normalized.includes('high') || normalized.includes('urgent')) return 'high';
    if (normalized.includes('low')) return 'low';
    return 'medium';
  }

  /**
   * Normalize tone
   */
  private normalizeTone(tone: any): 'formal' | 'casual' | 'professional' | 'friendly' {
    const normalized = String(tone).toLowerCase().trim();
    if (normalized.includes('formal')) return 'formal';
    if (normalized.includes('casual')) return 'casual';
    if (normalized.includes('professional')) return 'professional';
    return 'friendly';
  }

  /**
   * Build context from conversation history
   */
  private buildContext(conversationHistory: OpenAIMessage[]): string {
    if (!conversationHistory || conversationHistory.length === 0) {
      return '';
    }

    const recentMessages = conversationHistory.slice(-3);
    return recentMessages.map((msg) => `${msg.role}: ${msg.content}`).join('\n');
  }

  /**
   * Fallback to rule-based analysis
   */
  private fallbackAnalysis(message: string): SentimentAnalysis {
    const lowerMessage = message.toLowerCase();

    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let score = 0.5;
    const emotions: SentimentAnalysis['emotions'] = [];

    // Positive indicators
    if (
      lowerMessage.includes('great') ||
      lowerMessage.includes('excellent') ||
      lowerMessage.includes('love') ||
      lowerMessage.includes('thank')
    ) {
      sentiment = 'positive';
      score = 0.8;
      emotions.push({ type: 'satisfied', intensity: 0.8 });
    }

    // Negative indicators
    if (
      lowerMessage.includes('bad') ||
      lowerMessage.includes('terrible') ||
      lowerMessage.includes('hate') ||
      lowerMessage.includes('disappointed')
    ) {
      sentiment = 'negative';
      score = 0.2;
      emotions.push({ type: 'disappointed', intensity: 0.8 });
    }

    // Urgency indicators
    let urgency: 'high' | 'medium' | 'low' = 'medium';
    if (lowerMessage.includes('urgent') || lowerMessage.includes('asap')) {
      urgency = 'high';
      emotions.push({ type: 'anxious', intensity: 0.7 });
    }

    // Tone detection
    let tone: 'formal' | 'casual' | 'professional' | 'friendly' = 'friendly';
    if (lowerMessage.includes('dear') || lowerMessage.includes('sincerely')) {
      tone = 'formal';
    } else if (lowerMessage.includes('hey') || lowerMessage.includes('yo')) {
      tone = 'casual';
    }

    return {
      sentiment,
      score,
      emotions: emotions.length > 0 ? emotions : [{ type: 'neutral', intensity: 0.5 }],
      urgency,
      tone,
    };
  }

  /**
   * Cache management
   */
  private getFromCache(message: string): SentimentAnalysis | null {
    const key = message.toLowerCase().trim();
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    return null;
  }

  private saveToCache(message: string, data: SentimentAnalysis): void {
    const key = message.toLowerCase().trim();
    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
    });
  }

  clearCache(): void {
    this.cache.clear();
  }

  getStats(): { cacheSize: number } {
    return {
      cacheSize: this.cache.size,
    };
  }
}

export default AISentimentAnalyzer;