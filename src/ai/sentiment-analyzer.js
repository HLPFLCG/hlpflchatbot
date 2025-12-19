/**
 * AI-Powered Sentiment Analyzer
 * Analyzes user sentiment and emotion using GPT-4
 */

import { buildPrompt } from '../utils/prompt-templates.js';

export class AISentimentAnalyzer {
  constructor(openaiClient, options = {}) {
    this.openai = openaiClient;
    this.useCache = options.useCache !== false;
    this.cache = new Map();
    this.cacheTimeout = options.cacheTimeout || 300000; // 5 minutes
  }

  /**
   * Analyze sentiment of user message
   * @param {string} message - User message
   * @param {object} context - Additional context
   * @returns {Promise<object>} - Sentiment analysis result
   */
  async analyzeSentiment(message, context = {}) {
    try {
      // Check cache first
      if (this.useCache) {
        const cached = this.getFromCache(message);
        if (cached) {
          return cached;
        }
      }

      // Build prompt
      const messages = buildPrompt('sentimentAnalysis', { message });

      // Add context if available
      if (context.conversationHistory) {
        messages[0].content += `\n\nConversation context: ${this.buildContext(context.conversationHistory)}`;
      }

      // Call OpenAI with JSON response format
      const response = await this.openai.completeJSON(messages[0].content, messages[1].content, {
        temperature: 0.3,
        maxTokens: 150,
      });

      // Validate and normalize sentiment
      const sentiment = this.validateSentiment(response);

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
   * @param {object} sentiment - Raw sentiment from GPT-4
   * @returns {object} - Validated sentiment
   */
  validateSentiment(sentiment) {
    return {
      sentiment: this.normalizeSentiment(sentiment.sentiment),
      confidence: this.normalizeConfidence(sentiment.confidence),
      emotion: this.normalizeEmotion(sentiment.emotion),
      urgency: this.normalizeUrgency(sentiment.urgency),
      tone: this.normalizeTone(sentiment.tone),
    };
  }

  /**
   * Normalize sentiment value
   * @param {string} sentiment - Raw sentiment
   * @returns {string} - Normalized sentiment
   */
  normalizeSentiment(sentiment) {
    const normalized = String(sentiment).toLowerCase().trim();

    if (['positive', 'happy', 'excited', 'satisfied'].includes(normalized)) {
      return 'positive';
    } else if (['negative', 'unhappy', 'frustrated', 'disappointed'].includes(normalized)) {
      return 'negative';
    } else if (['neutral', 'mixed', 'unclear'].includes(normalized)) {
      return 'neutral';
    }

    return 'neutral';
  }

  /**
   * Normalize confidence score
   * @param {number} confidence - Raw confidence
   * @returns {number} - Normalized confidence (0-1)
   */
  normalizeConfidence(confidence) {
    const score = parseFloat(confidence);

    if (isNaN(score)) {
      return 0.5;
    }

    // Ensure between 0 and 1
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Normalize emotion
   * @param {string} emotion - Raw emotion
   * @returns {string} - Normalized emotion
   */
  normalizeEmotion(emotion) {
    const normalized = String(emotion).toLowerCase().trim();

    const validEmotions = [
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

    if (validEmotions.includes(normalized)) {
      return normalized;
    }

    // Map similar emotions
    const emotionMap = {
      happy: 'excited',
      angry: 'frustrated',
      interested: 'curious',
      worried: 'anxious',
      optimistic: 'hopeful',
      uncertain: 'confused',
      pleased: 'satisfied',
      upset: 'disappointed',
    };

    return emotionMap[normalized] || 'neutral';
  }

  /**
   * Normalize urgency
   * @param {string} urgency - Raw urgency
   * @returns {string} - Normalized urgency
   */
  normalizeUrgency(urgency) {
    const normalized = String(urgency).toLowerCase().trim();

    if (['high', 'urgent', 'immediate'].includes(normalized)) {
      return 'high';
    } else if (['medium', 'moderate', 'soon'].includes(normalized)) {
      return 'medium';
    } else if (['low', 'flexible', 'later'].includes(normalized)) {
      return 'low';
    }

    return 'medium';
  }

  /**
   * Normalize tone
   * @param {string} tone - Raw tone
   * @returns {string} - Normalized tone
   */
  normalizeTone(tone) {
    const normalized = String(tone).toLowerCase().trim();

    const validTones = ['formal', 'casual', 'professional', 'friendly'];

    if (validTones.includes(normalized)) {
      return normalized;
    }

    return 'casual';
  }

  /**
   * Fallback to rule-based analysis
   * @param {string} message - User message
   * @returns {object} - Sentiment analysis
   */
  fallbackAnalysis(message) {
    const lowerMessage = message.toLowerCase();

    // Sentiment detection
    let sentiment = 'neutral';
    let emotion = 'neutral';

    // Positive indicators
    const positiveWords = [
      'great',
      'awesome',
      'excellent',
      'love',
      'amazing',
      'perfect',
      'thank',
      'excited',
    ];
    const positiveCount = positiveWords.filter((word) => lowerMessage.includes(word)).length;

    // Negative indicators
    const negativeWords = [
      'bad',
      'terrible',
      'awful',
      'hate',
      'disappointed',
      'frustrated',
      'problem',
      'issue',
    ];
    const negativeCount = negativeWords.filter((word) => lowerMessage.includes(word)).length;

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      emotion = 'excited';
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      emotion = 'frustrated';
    }

    // Urgency detection
    let urgency = 'medium';
    if (
      lowerMessage.includes('urgent') ||
      lowerMessage.includes('asap') ||
      lowerMessage.includes('immediately')
    ) {
      urgency = 'high';
    } else if (lowerMessage.includes('whenever') || lowerMessage.includes('no rush')) {
      urgency = 'low';
    }

    // Tone detection
    let tone = 'casual';
    if (
      lowerMessage.includes('please') ||
      lowerMessage.includes('thank you') ||
      lowerMessage.includes('sir') ||
      lowerMessage.includes('madam')
    ) {
      tone = 'formal';
    } else if (
      lowerMessage.includes('hey') ||
      lowerMessage.includes('yo') ||
      lowerMessage.includes('sup')
    ) {
      tone = 'casual';
    }

    return {
      sentiment: sentiment,
      confidence: 0.6,
      emotion: emotion,
      urgency: urgency,
      tone: tone,
      fallback: true,
    };
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
    return recentMessages.map((msg) => `${msg.role}: ${msg.content}`).join('\n');
  }

  /**
   * Analyze sentiment trend over conversation
   * @param {array} conversationHistory - All messages
   * @returns {object} - Sentiment trend analysis
   */
  async analyzeTrend(conversationHistory) {
    if (!conversationHistory || conversationHistory.length < 2) {
      return {
        trend: 'stable',
        direction: 'neutral',
      };
    }

    const userMessages = conversationHistory.filter((msg) => msg.role === 'user');

    // Analyze first and last messages
    const firstSentiment = await this.analyzeSentiment(userMessages[0].content);
    const lastSentiment = await this.analyzeSentiment(
      userMessages[userMessages.length - 1].content
    );

    // Determine trend
    let trend = 'stable';
    let direction = 'neutral';

    if (firstSentiment.sentiment === 'negative' && lastSentiment.sentiment === 'positive') {
      trend = 'improving';
      direction = 'positive';
    } else if (firstSentiment.sentiment === 'positive' && lastSentiment.sentiment === 'negative') {
      trend = 'declining';
      direction = 'negative';
    } else if (firstSentiment.sentiment === lastSentiment.sentiment) {
      trend = 'stable';
      direction = lastSentiment.sentiment;
    }

    return {
      trend: trend,
      direction: direction,
      firstSentiment: firstSentiment,
      lastSentiment: lastSentiment,
    };
  }

  /**
   * Get response tone recommendation
   * @param {object} sentiment - Sentiment analysis result
   * @returns {object} - Tone recommendation
   */
  getResponseToneRecommendation(sentiment) {
    const recommendations = {
      positive: {
        tone: 'enthusiastic',
        style: 'Match their energy and excitement',
        emojis: true,
      },
      negative: {
        tone: 'empathetic',
        style: 'Be understanding and solution-focused',
        emojis: false,
      },
      neutral: {
        tone: 'professional',
        style: 'Be clear and informative',
        emojis: false,
      },
    };

    const base = recommendations[sentiment.sentiment] || recommendations.neutral;

    // Adjust for urgency
    if (sentiment.urgency === 'high') {
      base.priority = 'high';
      base.style += '. Address their needs quickly and directly.';
    }

    // Adjust for emotion
    if (sentiment.emotion === 'frustrated') {
      base.style = 'Be extra empathetic and offer immediate solutions';
    } else if (sentiment.emotion === 'confused') {
      base.style = 'Be clear, simple, and provide step-by-step guidance';
    }

    return base;
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
      timestamp: Date.now(),
    });
  }

  getCacheKey(message) {
    return message.toLowerCase().trim();
  }

  clearCache() {
    this.cache.clear();
  }

  /**
   * Get analysis statistics
   * @returns {object} - Analysis statistics
   */
  getStats() {
    return {
      cacheSize: this.cache.size,
      supportedSentiments: ['positive', 'negative', 'neutral'],
      supportedEmotions: [
        'excited',
        'frustrated',
        'curious',
        'anxious',
        'hopeful',
        'confused',
        'satisfied',
        'disappointed',
        'neutral',
      ],
      supportedUrgencies: ['high', 'medium', 'low'],
      supportedTones: ['formal', 'casual', 'professional', 'friendly'],
    };
  }
}

export default AISentimentAnalyzer;
