/**
 * AI-Powered Response Generator
 * Generates dynamic, context-aware responses using GPT-4
 */

import { buildPrompt, getSystemPrompt } from '../utils/prompt-templates.js';

export class AIResponseGenerator {
  constructor(openaiClient, liveData, options = {}) {
    this.openai = openaiClient;
    this.liveData = liveData;
    this.maxTokens = options.maxTokens || 500;
    this.temperature = options.temperature || 0.7;
  }

  /**
   * Generate response based on intent, entities, and sentiment
   * @param {string} intent - Detected intent
   * @param {object} entities - Extracted entities
   * @param {object} sentiment - Sentiment analysis
   * @param {string} message - Original user message
   * @param {object} context - Additional context
   * @returns {Promise<object>} - Generated response
   */
  async generateResponse(intent, entities, sentiment, message, context = {}) {
    try {
      // Gather relevant information based on intent
      const relevantInfo = await this.gatherRelevantInfo(intent, entities);

      // Build context object
      const fullContext = {
        intent: intent,
        entities: entities,
        sentiment: sentiment,
        relevantInfo: relevantInfo,
        conversationHistory: context.conversationHistory || [],
        userProfile: context.userProfile || {}
      };

      // Build prompt
      const messages = this.buildMessages(fullContext, message);

      // Generate response
      const response = await this.openai.createChatCompletion(messages, {
        temperature: this.temperature,
        maxTokens: this.maxTokens
      });

      const responseText = this.openai.extractText(response);

      // Format response with quick actions
      const formattedResponse = this.formatResponse(responseText, intent, relevantInfo);

      return formattedResponse;
    } catch (error) {
      console.error('Response generation error:', error);
      
      // Fallback to template-based response
      return this.fallbackResponse(intent, entities, message);
    }
  }

  /**
   * Gather relevant information based on intent
   * @param {string} intent - User intent
   * @param {object} entities - Extracted entities
   * @returns {Promise<object>} - Relevant information
   */
  async gatherRelevantInfo(intent, entities) {
    const info = {};

    try {
      switch(intent) {
        case 'company_info':
          info.stats = await this.liveData.getCompanyStats();
          info.contact = {
            email: 'contact@hlpflrecords.com',
            phone: '+1 (555) 123-4567',
            website: 'https://hlpfl.org'
          };
          break;

        case 'artist_roster':
          info.artists = await this.liveData.getArtistRoster();
          if (entities.genre) {
            info.artists = info.artists.filter(a => 
              a.genre.toLowerCase().includes(entities.genre.toLowerCase())
            );
          }
          break;

        case 'recent_releases':
          const days = entities.timeline?.urgency === 'immediate' ? 7 : 30;
          info.releases = await this.liveData.getRecentReleases(days);
          break;

        case 'events_inquiry':
          info.events = await this.liveData.getUpcomingEvents();
          break;

        case 'service_inquiry':
          if (entities.service_type) {
            info.serviceDetails = await this.liveData.getServiceAvailability(entities.service_type);
            info.pricing = await this.liveData.getServicePricing(entities.service_type);
          }
          info.testimonials = await this.liveData.getTestimonials(entities.service_type);
          break;

        case 'testimonial_request':
          info.testimonials = await this.liveData.getTestimonials();
          break;

        case 'artist_submission':
          info.submissionProcess = {
            steps: [
              'Visit hlpfl.org/contact',
              'Fill out the submission form',
              'Include links to your music',
              'Add a brief bio',
              'Our A&R team reviews within 1-2 weeks'
            ],
            requirements: [
              'High-quality recordings',
              'Original music',
              'Artist bio',
              'Social media links'
            ]
          };
          break;

        default:
          info.general = await this.liveData.getCompanyStats();
      }
    } catch (error) {
      console.error('Error gathering relevant info:', error);
    }

    return info;
  }

  /**
   * Build messages for GPT-4
   * @param {object} context - Full context
   * @param {string} message - User message
   * @returns {array} - Messages array
   */
  buildMessages(context, message) {
    const messages = [];

    // System message with context
    const systemPrompt = `${getSystemPrompt()}

CURRENT CONTEXT:
${JSON.stringify(context, null, 2)}

Generate a helpful, personalized response that:
1. Acknowledges the user's ${context.sentiment.emotion} emotion
2. Addresses their ${context.intent} intent
3. Uses the relevant information provided
4. Matches their ${context.sentiment.tone} tone
5. Provides specific, actionable next steps
6. Maintains HLPFL's brand voice

${context.sentiment.urgency === 'high' ? 'NOTE: User has HIGH urgency - prioritize quick, direct solutions.' : ''}`;

    messages.push({
      role: 'system',
      content: systemPrompt
    });

    // Add conversation history if available
    if (context.conversationHistory && context.conversationHistory.length > 0) {
      const recentHistory = context.conversationHistory.slice(-3);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content
        });
      });
    }

    // User message
    messages.push({
      role: 'user',
      content: message
    });

    return messages;
  }

  /**
   * Format response with quick actions
   * @param {string} responseText - Generated response text
   * @param {string} intent - User intent
   * @param {object} relevantInfo - Relevant information
   * @returns {object} - Formatted response
   */
  formatResponse(responseText, intent, relevantInfo) {
    const response = {
      text: responseText,
      intent: intent,
      timestamp: new Date().toISOString()
    };

    // Add quick actions based on intent
    response.quickActions = this.getQuickActions(intent, relevantInfo);

    // Add suggested follow-ups
    response.suggestedFollowUps = this.getSuggestedFollowUps(intent);

    return response;
  }

  /**
   * Get quick actions for intent
   * @param {string} intent - User intent
   * @param {object} relevantInfo - Relevant information
   * @returns {array} - Quick actions
   */
  getQuickActions(intent, relevantInfo) {
    const actions = {
      artist_submission: [
        { label: 'Submit Music', url: 'https://hlpfl.org/contact', type: 'primary' },
        { label: 'View Requirements', url: 'https://hlpfl.org/requirements', type: 'secondary' },
        { label: 'See Success Stories', url: 'https://hlpfl.org/artists', type: 'secondary' }
      ],
      service_inquiry: [
        { label: 'View All Services', url: 'https://hlpfl.org/services', type: 'primary' },
        { label: 'Get a Quote', url: 'https://hlpfl.org/quote', type: 'primary' },
        { label: 'Schedule Consultation', url: 'https://hlpfl.org/schedule', type: 'secondary' }
      ],
      booking_request: [
        { label: 'Book Studio Time', url: 'https://hlpfl.org/booking', type: 'primary' },
        { label: 'View Availability', url: 'https://hlpfl.org/calendar', type: 'secondary' },
        { label: 'Contact Team', url: 'https://hlpfl.org/contact', type: 'secondary' }
      ],
      pricing_inquiry: [
        { label: 'View Pricing', url: 'https://hlpfl.org/pricing', type: 'primary' },
        { label: 'Get Custom Quote', url: 'https://hlpfl.org/quote', type: 'primary' }
      ],
      artist_roster: [
        { label: 'View All Artists', url: 'https://hlpfl.org/artists', type: 'primary' },
        { label: 'Listen on Spotify', url: 'https://open.spotify.com/user/hlpflrecords', type: 'secondary' }
      ],
      events_inquiry: [
        { label: 'View Events', url: 'https://hlpfl.org/events', type: 'primary' },
        { label: 'Get Tickets', url: 'https://hlpfl.org/tickets', type: 'secondary' }
      ],
      contact_request: [
        { label: 'Contact Us', url: 'https://hlpfl.org/contact', type: 'primary' },
        { label: 'Email Us', url: 'mailto:contact@hlpflrecords.com', type: 'secondary' },
        { label: 'Call Us', url: 'tel:+15551234567', type: 'secondary' }
      ]
    };

    return actions[intent] || [
      { label: 'Learn More', url: 'https://hlpfl.org', type: 'primary' },
      { label: 'Contact Us', url: 'https://hlpfl.org/contact', type: 'secondary' }
    ];
  }

  /**
   * Get suggested follow-up questions
   * @param {string} intent - User intent
   * @returns {array} - Suggested questions
   */
  getSuggestedFollowUps(intent) {
    const followUps = {
      company_info: [
        'What services do you offer?',
        'How can I submit my music?',
        'Who are your current artists?'
      ],
      artist_submission: [
        'What are the submission requirements?',
        'How long does the review process take?',
        'What happens after I submit?'
      ],
      service_inquiry: [
        'How much does it cost?',
        'Can I book a consultation?',
        'What\'s included in the service?'
      ],
      artist_roster: [
        'What genres do you work with?',
        'Can I hear some of their music?',
        'How do artists join HLPFL?'
      ],
      events_inquiry: [
        'How can I get tickets?',
        'Are there any upcoming showcases?',
        'Can I perform at an event?'
      ]
    };

    return followUps[intent] || [
      'Tell me more about HLPFL Records',
      'How can you help my music career?',
      'What makes HLPFL different?'
    ];
  }

  /**
   * Fallback to template-based response
   * @param {string} intent - User intent
   * @param {object} entities - Extracted entities
   * @param {string} message - User message
   * @returns {object} - Fallback response
   */
  async fallbackResponse(intent, entities, message) {
    const templates = {
      greeting: "Hello! Welcome to HLPFL Records. I'm here to help you with any questions about our artists, services, or how to submit your music. What can I assist you with today?",
      
      artist_submission: "Great question! We're always excited to discover new talent. Visit hlpfl.org/contact to submit your music. Our A&R team reviews all submissions within 1-2 weeks.",
      
      service_inquiry: "HLPFL Records provides comprehensive music business solutions including Artist Development, Music Production, Global Distribution, Publishing & Rights, Marketing & Promotion, and Career Management. Which area interests you most?",
      
      company_info: "HLPFL Records is a premier record label founded in 2009 in Grand Rapids, Michigan. We've helped 50+ artists achieve over 1 billion streams worldwide. Our mission is elevating artists to global recognition.",
      
      contact_request: "You can reach us at contact@hlpflrecords.com or call +1 (555) 123-4567. We're available Monday-Friday, 9 AM - 6 PM EST. Visit hlpfl.org/contact for more options.",
      
      fallback: "I'd be happy to help you learn about HLPFL Records! You can ask about our services, artists, how to submit music, or company information. What would you like to know?"
    };

    const text = templates[intent] || templates.fallback;

    return {
      text: text,
      intent: intent,
      timestamp: new Date().toISOString(),
      quickActions: this.getQuickActions(intent, {}),
      suggestedFollowUps: this.getSuggestedFollowUps(intent),
      fallback: true
    };
  }

  /**
   * Generate proactive suggestions
   * @param {object} userProfile - User profile
   * @param {array} conversationHistory - Conversation history
   * @returns {Promise<array>} - Proactive suggestions
   */
  async generateProactiveSuggestions(userProfile, conversationHistory) {
    try {
      const context = {
        userProfile: userProfile,
        conversationHistory: conversationHistory.slice(-5),
        timestamp: new Date().toISOString()
      };

      const messages = buildPrompt('proactiveSuggestion', { context });

      const response = await this.openai.completeJSON(
        messages[0].content,
        messages[1].content,
        {
          temperature: 0.7,
          maxTokens: 200
        }
      );

      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error generating proactive suggestions:', error);
      return [];
    }
  }

  /**
   * Get response statistics
   * @returns {object} - Response statistics
   */
  getStats() {
    return {
      maxTokens: this.maxTokens,
      temperature: this.temperature,
      supportedIntents: [
        'greeting',
        'artist_submission',
        'service_inquiry',
        'pricing_inquiry',
        'booking_request',
        'company_info',
        'artist_roster',
        'recent_releases',
        'events_inquiry',
        'contact_request',
        'testimonial_request',
        'career_advice'
      ]
    };
  }
}

export default AIResponseGenerator;