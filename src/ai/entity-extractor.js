/**
 * AI-Powered Entity Extractor
 * Extracts structured entities from user messages using GPT-4
 */

import { buildPrompt } from '../utils/prompt-templates.js';

export class AIEntityExtractor {
  constructor(openaiClient, options = {}) {
    this.openai = openaiClient;
    this.useCache = options.useCache !== false;
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
  }

  /**
   * Extract entities from user message
   * @param {string} message - User message
   * @param {object} context - Additional context
   * @returns {Promise<object>} - Extracted entities
   */
  async extractEntities(message, context = {}) {
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

      // Call OpenAI with JSON response format
      const response = await this.openai.completeJSON(
        messages[0].content,
        messages[1].content,
        {
          temperature: 0.3,
          maxTokens: 200
        }
      );

      // Validate and normalize entities
      const entities = this.validateEntities(response);

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
   * @param {object} entities - Raw entities from GPT-4
   * @returns {object} - Validated entities
   */
  validateEntities(entities) {
    const validated = {};

    // Service type
    if (entities.service_type) {
      validated.service_type = this.normalizeServiceType(entities.service_type);
    }

    // Genre
    if (entities.genre) {
      validated.genre = this.normalizeGenre(entities.genre);
    }

    // Timeline
    if (entities.timeline) {
      validated.timeline = this.normalizeTimeline(entities.timeline);
    }

    // Budget
    if (entities.budget) {
      validated.budget = this.normalizeBudget(entities.budget);
    }

    // Location
    if (entities.location) {
      validated.location = String(entities.location).trim();
    }

    // Artist name
    if (entities.artist_name) {
      validated.artist_name = String(entities.artist_name).trim();
    }

    // Urgency
    if (entities.urgency) {
      validated.urgency = this.normalizeUrgency(entities.urgency);
    }

    // Experience level
    if (entities.experience_level) {
      validated.experience_level = this.normalizeExperienceLevel(entities.experience_level);
    }

    return validated;
  }

  /**
   * Normalize service type
   * @param {string} serviceType - Raw service type
   * @returns {string} - Normalized service type
   */
  normalizeServiceType(serviceType) {
    const normalized = String(serviceType).toLowerCase().trim();
    
    const serviceMap = {
      'production': 'music_production',
      'recording': 'music_production',
      'studio': 'music_production',
      'distribution': 'global_distribution',
      'release': 'global_distribution',
      'development': 'artist_development',
      'coaching': 'artist_development',
      'marketing': 'marketing_promotion',
      'promotion': 'marketing_promotion',
      'social media': 'marketing_promotion',
      'publishing': 'publishing_rights',
      'rights': 'publishing_rights',
      'copyright': 'publishing_rights',
      'management': 'career_management',
      'career': 'career_management'
    };

    for (const [key, value] of Object.entries(serviceMap)) {
      if (normalized.includes(key)) {
        return value;
      }
    }

    return normalized;
  }

  /**
   * Normalize genre
   * @param {string} genre - Raw genre
   * @returns {string} - Normalized genre
   */
  normalizeGenre(genre) {
    const normalized = String(genre).toLowerCase().trim();
    
    const genreMap = {
      'hiphop': 'hip-hop',
      'hip hop': 'hip-hop',
      'rap': 'hip-hop',
      'r&b': 'rnb',
      'r and b': 'rnb',
      'edm': 'electronic',
      'techno': 'electronic',
      'house': 'electronic',
      'indie rock': 'indie',
      'alternative': 'indie'
    };

    return genreMap[normalized] || normalized;
  }

  /**
   * Normalize timeline
   * @param {string} timeline - Raw timeline
   * @returns {object} - Normalized timeline
   */
  normalizeTimeline(timeline) {
    const timelineStr = String(timeline).toLowerCase();
    
    // Extract urgency indicators
    const urgencyIndicators = {
      'asap': 'immediate',
      'urgent': 'immediate',
      'immediately': 'immediate',
      'soon': 'short-term',
      'this week': 'short-term',
      'this month': 'short-term',
      'next month': 'medium-term',
      'few months': 'medium-term',
      'later': 'long-term',
      'eventually': 'long-term'
    };

    for (const [key, value] of Object.entries(urgencyIndicators)) {
      if (timelineStr.includes(key)) {
        return {
          raw: timeline,
          urgency: value
        };
      }
    }

    return {
      raw: timeline,
      urgency: 'unspecified'
    };
  }

  /**
   * Normalize budget
   * @param {string} budget - Raw budget
   * @returns {object} - Normalized budget
   */
  normalizeBudget(budget) {
    const budgetStr = String(budget).toLowerCase();
    
    // Extract budget range
    const ranges = {
      'low': { min: 0, max: 1000 },
      'small': { min: 0, max: 1000 },
      'limited': { min: 0, max: 1000 },
      'medium': { min: 1000, max: 5000 },
      'moderate': { min: 1000, max: 5000 },
      'high': { min: 5000, max: 20000 },
      'large': { min: 5000, max: 20000 },
      'unlimited': { min: 20000, max: null }
    };

    for (const [key, value] of Object.entries(ranges)) {
      if (budgetStr.includes(key)) {
        return {
          raw: budget,
          range: key,
          ...value
        };
      }
    }

    // Try to extract numbers
    const numbers = budgetStr.match(/\d+/g);
    if (numbers) {
      const amount = parseInt(numbers[0]);
      return {
        raw: budget,
        amount: amount,
        currency: budgetStr.includes('$') ? 'USD' : 'unspecified'
      };
    }

    return {
      raw: budget,
      range: 'unspecified'
    };
  }

  /**
   * Normalize urgency
   * @param {string} urgency - Raw urgency
   * @returns {string} - Normalized urgency
   */
  normalizeUrgency(urgency) {
    const normalized = String(urgency).toLowerCase().trim();
    
    if (['high', 'urgent', 'immediate', 'asap'].includes(normalized)) {
      return 'high';
    } else if (['medium', 'moderate', 'soon'].includes(normalized)) {
      return 'medium';
    } else if (['low', 'flexible', 'later'].includes(normalized)) {
      return 'low';
    }

    return normalized;
  }

  /**
   * Normalize experience level
   * @param {string} level - Raw experience level
   * @returns {string} - Normalized level
   */
  normalizeExperienceLevel(level) {
    const normalized = String(level).toLowerCase().trim();
    
    if (['beginner', 'new', 'starting', 'amateur'].includes(normalized)) {
      return 'beginner';
    } else if (['intermediate', 'some experience', 'developing'].includes(normalized)) {
      return 'intermediate';
    } else if (['professional', 'experienced', 'advanced', 'expert'].includes(normalized)) {
      return 'professional';
    }

    return normalized;
  }

  /**
   * Fallback to rule-based extraction
   * @param {string} message - User message
   * @returns {object} - Extracted entities
   */
  fallbackExtraction(message) {
    const entities = {};
    const lowerMessage = message.toLowerCase();

    // Service type detection
    const services = ['production', 'distribution', 'development', 'marketing', 'publishing', 'management'];
    for (const service of services) {
      if (lowerMessage.includes(service)) {
        entities.service_type = service;
        break;
      }
    }

    // Genre detection
    const genres = ['pop', 'rock', 'hip-hop', 'rap', 'electronic', 'indie', 'jazz', 'country', 'rnb'];
    for (const genre of genres) {
      if (lowerMessage.includes(genre)) {
        entities.genre = genre;
        break;
      }
    }

    // Urgency detection
    if (lowerMessage.includes('urgent') || lowerMessage.includes('asap') || lowerMessage.includes('immediately')) {
      entities.urgency = 'high';
    } else if (lowerMessage.includes('soon') || lowerMessage.includes('quickly')) {
      entities.urgency = 'medium';
    }

    // Budget detection
    if (lowerMessage.includes('budget') || lowerMessage.includes('cost') || lowerMessage.includes('price')) {
      if (lowerMessage.includes('low') || lowerMessage.includes('cheap') || lowerMessage.includes('affordable')) {
        entities.budget = { range: 'low' };
      } else if (lowerMessage.includes('high') || lowerMessage.includes('premium')) {
        entities.budget = { range: 'high' };
      }
    }

    return entities;
  }

  /**
   * Build context from conversation history
   * @param {array} conversationHistory - Previous messages
   * @returns {string} - Context string
   */
  buildContext(conversationHistory) {
    if (!conversationHistory || conversationHistory.length === 0) {
      return '';
    }

    const recentMessages = conversationHistory.slice(-3);
    return recentMessages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');
  }

  /**
   * Cache management
   */
  getFromCache(message) {
    const key = this.getCacheKey(message);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    
    return null;
  }

  saveToCache(message, data) {
    const key = this.getCacheKey(message);
    this.cache.set(key, {
      data: data,
      timestamp: Date.now()
    });
  }

  getCacheKey(message) {
    return message.toLowerCase().trim();
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * Get extraction statistics
   * @returns {object} - Extraction statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      supportedEntities: [
        'service_type',
        'genre',
        'timeline',
        'budget',
        'location',
        'artist_name',
        'urgency',
        'experience_level'
      ]
    };
  }
}

export default AIEntityExtractor;