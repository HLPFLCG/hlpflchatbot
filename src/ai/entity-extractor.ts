/**
 * AI-Powered Entity Extractor
 * Extracts structured entities from user messages using GPT-4
 */

// @ts-ignore - Will be migrated to TypeScript
import { buildPrompt } from '../utils/prompt-templates.js';
import type { OpenAIClient } from './openai-client';
import type { OpenAIMessage, ExtractedEntities } from '../types';

export interface EntityExtractionOptions {
  useCache?: boolean;
  cacheTimeout?: number;
}

export interface EntityExtractionContext {
  conversationHistory?: OpenAIMessage[];
}

interface CachedEntities {
  data: ExtractedEntities;
  timestamp: number;
}

export class AIEntityExtractor {
  private openai: OpenAIClient;
  private useCache: boolean;
  private cache: Map<string, CachedEntities>;
  private cacheTimeout: number;

  constructor(openaiClient: OpenAIClient, options: EntityExtractionOptions = {}) {
    this.openai = openaiClient;
    this.useCache = options.useCache !== false;
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
  }

  /**
   * Extract entities from user message
   * @param message - User message
   * @param context - Additional context
   * @returns Extracted entities
   */
  async extractEntities(
    message: string,
    context: EntityExtractionContext = {}
  ): Promise<ExtractedEntities> {
    try {
      // Check cache first
      if (this.useCache) {
        const cached = this.getFromCache(message);
        if (cached) {
          return cached;
        }
      }

      // Build prompt
      const messages = buildPrompt('entityExtraction', { message });

      // Add context if available
      if (context.conversationHistory) {
        messages[0].content += `\n\nConversation context: ${this.buildContext(context.conversationHistory)}`;
      }

      // Call OpenAI
      const response = await this.openai.createChatCompletion(messages, {
        temperature: 0.3,
        maxTokens: 200,
      });

      // Parse JSON response
      const content = response.choices[0]?.message?.content || '{}';
      const rawEntities = JSON.parse(content) as Record<string, any>;

      // Validate and normalize entities
      const entities = this.validateEntities(rawEntities);

      // Cache result
      if (this.useCache) {
        this.saveToCache(message, entities);
      }

      return entities;
    } catch (error) {
      console.error('Entity extraction error:', error);

      // Fallback to rule-based extraction
      return this.fallbackExtraction(message);
    }
  }

  /**
   * Validate and normalize extracted entities
   * @param entities - Raw entities from GPT-4
   * @returns Validated entities
   */
  private validateEntities(entities: Record<string, any>): ExtractedEntities {
    const validated: ExtractedEntities = {};

    // Service type
    if (entities['service_type']) {
      validated.serviceType = this.normalizeServiceType(entities['service_type']);
    }

    // Genre
    if (entities['genre']) {
      validated.genre = this.normalizeGenre(entities['genre']);
    }

    // Timeline
    if (entities['timeline']) {
      validated.timeline = this.normalizeTimeline(entities['timeline']);
    }

    // Budget
    if (entities['budget']) {
      validated.budget = this.normalizeBudget(entities['budget']);
    }

    // Location
    if (entities['location']) {
      validated.location = String(entities['location']).trim();
    }

    // Artist name
    if (entities['artist_name']) {
      validated.artistName = String(entities['artist_name']).trim();
    }

    // Urgency
    if (entities['urgency']) {
      validated.urgency = this.normalizeUrgency(entities['urgency']);
    }

    // Experience level
    if (entities['experience_level']) {
      validated.experienceLevel = this.normalizeExperienceLevel(entities['experience_level']);
    }

    return validated;
  }

  /**
   * Normalize service type
   * @param serviceType - Raw service type
   * @returns Normalized service type
   */
  private normalizeServiceType(serviceType: any): string[] {
    const normalized = String(serviceType).toLowerCase().trim();

    const serviceMap: Record<string, string> = {
      production: 'music_production',
      recording: 'music_production',
      studio: 'music_production',
      distribution: 'global_distribution',
      release: 'global_distribution',
      development: 'artist_development',
      coaching: 'artist_development',
      marketing: 'marketing_promotion',
      promotion: 'marketing_promotion',
      'social media': 'marketing_promotion',
      publishing: 'publishing_rights',
      rights: 'publishing_rights',
      copyright: 'publishing_rights',
      management: 'career_management',
      career: 'career_management',
    };

    for (const [key, value] of Object.entries(serviceMap)) {
      if (normalized.includes(key)) {
        return [value];
      }
    }

    return [normalized];
  }

  /**
   * Normalize genre
   * @param genre - Raw genre
   * @returns Normalized genre array
   */
  private normalizeGenre(genre: any): string[] {
    if (Array.isArray(genre)) {
      return genre.map((g) => String(g).toLowerCase().trim());
    }
    return [String(genre).toLowerCase().trim()];
  }

  /**
   * Normalize timeline
   * @param timeline - Raw timeline
   * @returns Normalized timeline
   */
  private normalizeTimeline(timeline: any): string {
    const normalized = String(timeline).toLowerCase().trim();

    const timelineMap: Record<string, string> = {
      asap: 'immediate',
      urgent: 'immediate',
      'right away': 'immediate',
      soon: 'short_term',
      'this week': 'short_term',
      'this month': 'short_term',
      'next month': 'medium_term',
      'few months': 'medium_term',
      'this year': 'long_term',
      'next year': 'long_term',
    };

    for (const [key, value] of Object.entries(timelineMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }

    return normalized;
  }

  /**
   * Normalize budget
   * @param budget - Raw budget
   * @returns Normalized budget
   */
  private normalizeBudget(budget: any): string {
    const normalized = String(budget).toLowerCase().trim();

    if (normalized.includes('low') || normalized.includes('cheap') || normalized.includes('affordable')) {
      return 'low';
    }
    if (normalized.includes('medium') || normalized.includes('moderate')) {
      return 'medium';
    }
    if (normalized.includes('high') || normalized.includes('premium') || normalized.includes('unlimited')) {
      return 'high';
    }

    return normalized;
  }

  /**
   * Normalize urgency
   * @param urgency - Raw urgency
   * @returns Normalized urgency
   */
  private normalizeUrgency(urgency: any): 'high' | 'medium' | 'low' {
    const normalized = String(urgency).toLowerCase().trim();

    if (normalized.includes('high') || normalized.includes('urgent') || normalized.includes('asap')) {
      return 'high';
    }
    if (normalized.includes('low') || normalized.includes('flexible')) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * Normalize experience level
   * @param level - Raw experience level
   * @returns Normalized experience level
   */
  private normalizeExperienceLevel(level: any): 'beginner' | 'intermediate' | 'professional' {
    const normalized = String(level).toLowerCase().trim();

    if (normalized.includes('beginner') || normalized.includes('new') || normalized.includes('starting')) {
      return 'beginner';
    }
    if (normalized.includes('professional') || normalized.includes('expert') || normalized.includes('advanced')) {
      return 'professional';
    }

    return 'intermediate';
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

    const recentMessages = conversationHistory.slice(-3);
    return recentMessages.map((msg) => `${msg.role}: ${msg.content}`).join('\n');
  }

  /**
   * Fallback to rule-based extraction
   * @param message - User message
   * @returns Extracted entities
   */
  private fallbackExtraction(message: string): ExtractedEntities {
    const lowerMessage = message.toLowerCase();
    const entities: ExtractedEntities = {};

    // Extract service type
    if (lowerMessage.includes('production') || lowerMessage.includes('recording')) {
      entities.serviceType = ['music_production'];
    } else if (lowerMessage.includes('distribution') || lowerMessage.includes('release')) {
      entities.serviceType = ['global_distribution'];
    } else if (lowerMessage.includes('marketing') || lowerMessage.includes('promotion')) {
      entities.serviceType = ['marketing_promotion'];
    }

    // Extract urgency
    if (lowerMessage.includes('urgent') || lowerMessage.includes('asap')) {
      entities.urgency = 'high';
    } else if (lowerMessage.includes('flexible') || lowerMessage.includes('no rush')) {
      entities.urgency = 'low';
    } else {
      entities.urgency = 'medium';
    }

    return entities;
  }

  /**
   * Cache management
   */
  private getFromCache(message: string): ExtractedEntities | null {
    const key = this.getCacheKey(message);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    return null;
  }

  private saveToCache(message: string, data: ExtractedEntities): void {
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
   * Get extraction statistics
   * @returns Extraction statistics
   */
  getStats(): { cacheSize: number } {
    return {
      cacheSize: this.cache.size,
    };
  }
}

export default AIEntityExtractor;