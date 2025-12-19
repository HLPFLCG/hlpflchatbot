/**
 * AI-Powered Response Generator
 * Generates contextual, personalized responses using GPT-4
 */

// @ts-ignore - Will be migrated to TypeScript
import { buildPrompt } from '../utils/prompt-templates.js';
import type { OpenAIClient } from './openai-client';
import type {
  OpenAIMessage,
  ExtractedEntities,
  SentimentAnalysis,
  ChatResponse,
} from '../types';

export interface ResponseGenerationOptions {
  useCache?: boolean;
  cacheTimeout?: number;
}

export interface ResponseContext {
  intent?: string;
  entities?: ExtractedEntities;
  sentiment?: SentimentAnalysis;
  conversationHistory?: OpenAIMessage[];
  liveData?: Record<string, any>;
  userProfile?: Record<string, any>;
}

export class AIResponseGenerator {
  private openai: OpenAIClient;
  private cache: Map<string, any>;

  constructor(openaiClient: OpenAIClient, _options: ResponseGenerationOptions = {}) {
    this.openai = openaiClient;
    this.cache = new Map();
    // Cache options available for future use
  }

  /**
   * Generate response to user message
   * @param message - User message
   * @param context - Response context
   * @returns Generated response
   */
  async generateResponse(message: string, context: ResponseContext = {}): Promise<ChatResponse> {
    try {
      // Build system prompt with context
      const systemPrompt = this.buildSystemPrompt(context);

      // Build conversation messages
      const messages: OpenAIMessage[] = [
        { role: 'system', content: systemPrompt },
        ...(context.conversationHistory || []),
        { role: 'user', content: message },
      ];

      // Call OpenAI
      const response = await this.openai.createChatCompletion(messages, {
        temperature: 0.7,
        maxTokens: 500,
      });

      const responseText = response.choices[0]?.message?.content || 'I apologize, but I encountered an error. Please try again.';

      // Generate suggestions and quick actions
      const suggestions = this.generateSuggestions(context);
      const quickActions = this.generateQuickActions(context);

      return {
        response: responseText,
        intent: context.intent,
        entities: context.entities,
        sentiment: context.sentiment,
        suggestions,
        quickActions,
        metadata: {
          responseTime: 0,
          cached: false,
          confidence: 0.9,
        },
      };
    } catch (error) {
      console.error('Response generation error:', error);

      // Fallback response
      return this.fallbackResponse(message, context);
    }
  }

  /**
   * Build system prompt with context
   */
  private buildSystemPrompt(context: ResponseContext): string {
    let prompt = `You are an AI assistant for HLPFL Records, a world-class record label and artist development company based in Grand Rapids, Michigan.

Your role is to:
- Provide helpful, accurate information about HLPFL Records services
- Assist artists with their music career questions
- Be professional yet friendly and approachable
- Provide specific, actionable advice when possible

Company Information:
- Founded: 2009 (15+ years in business)
- Location: Grand Rapids, Michigan
- Services: Artist Development, Music Production, Global Distribution, Publishing & Rights, Marketing & Promotion, Career Management
- Statistics: 50+ artists, 200+ releases, 1B+ streams, 30+ industry awards`;

    // Add intent context
    if (context.intent) {
      prompt += `\n\nUser Intent: ${context.intent}`;
    }

    // Add entity context
    if (context.entities && Object.keys(context.entities).length > 0) {
      prompt += `\n\nExtracted Information: ${JSON.stringify(context.entities)}`;
    }

    // Add sentiment context
    if (context.sentiment) {
      prompt += `\n\nUser Sentiment: ${context.sentiment.sentiment} (${context.sentiment.tone} tone)`;
      if (context.sentiment.urgency === 'high') {
        prompt += '\nNote: User has high urgency - prioritize quick, actionable responses.';
      }
    }

    // Add live data context
    if (context.liveData) {
      prompt += `\n\nCurrent Data: ${JSON.stringify(context.liveData)}`;
    }

    return prompt;
  }

  /**
   * Generate follow-up suggestions
   */
  private generateSuggestions(context: ResponseContext): string[] {
    const suggestions: string[] = [];

    if (context.intent === 'artist_submission') {
      suggestions.push(
        'What genres do you specialize in?',
        'Do you have any released music I can listen to?',
        'What are your career goals?'
      );
    } else if (context.intent === 'service_inquiry') {
      suggestions.push(
        'Which service are you most interested in?',
        'What is your timeline for this project?',
        'Do you have a budget in mind?'
      );
    } else if (context.intent === 'pricing_inquiry') {
      suggestions.push(
        'Would you like to schedule a consultation?',
        'What services are you interested in?',
        'Can you tell me about your project?'
      );
    } else {
      suggestions.push(
        'Tell me more about your music',
        'What can I help you with today?',
        'Would you like to learn about our services?'
      );
    }

    return suggestions.slice(0, 3);
  }

  /**
   * Generate quick actions
   */
  private generateQuickActions(context: ResponseContext): ChatResponse['quickActions'] {
    const actions: ChatResponse['quickActions'] = [];

    if (context.intent === 'artist_submission') {
      actions?.push(
        { id: 'submit', label: 'Submit Demo', action: 'submit_demo' },
        { id: 'requirements', label: 'View Requirements', action: 'view_requirements' }
      );
    } else if (context.intent === 'service_inquiry') {
      actions?.push(
        { id: 'services', label: 'View All Services', action: 'view_services' },
        { id: 'contact', label: 'Contact Us', action: 'contact' }
      );
    } else if (context.intent === 'pricing_inquiry') {
      actions?.push(
        { id: 'consultation', label: 'Schedule Consultation', action: 'schedule_consultation' },
        { id: 'pricing', label: 'View Pricing', action: 'view_pricing' }
      );
    }

    return actions;
  }

  /**
   * Fallback response
   */
  private fallbackResponse(_message: string, context: ResponseContext): ChatResponse {
    let response = 'Thank you for your message! ';

    if (context.intent === 'greeting') {
      response += "I'm the HLPFL Records AI assistant. How can I help you with your music career today?";
    } else if (context.intent === 'artist_submission') {
      response +=
        "I'd love to hear about your music! HLPFL Records is always looking for talented artists. Could you tell me more about your style and what you're looking for?";
    } else if (context.intent === 'service_inquiry') {
      response +=
        'HLPFL Records offers comprehensive services including Artist Development, Music Production, Global Distribution, Publishing & Rights, Marketing & Promotion, and Career Management. Which service interests you most?';
    } else {
      response +=
        "I'm here to help with any questions about HLPFL Records and our services. What would you like to know?";
    }

    return {
      response,
      intent: context.intent,
      entities: context.entities,
      sentiment: context.sentiment,
      suggestions: this.generateSuggestions(context),
      quickActions: this.generateQuickActions(context),
      metadata: {
        responseTime: 0,
        cached: false,
        confidence: 0.7,
      },
    };
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

export default AIResponseGenerator;