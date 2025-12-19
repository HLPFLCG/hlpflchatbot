/**
 * Personalization Engine
 * Generates personalized responses and recommendations based on user profile
 */

import type { UserProfile, PersonalizationContext } from '../types';
import { UserProfiling } from './user-profiling';
import { ConversationMemory } from './conversation-memory';

export class PersonalizationEngine {
  private userProfiling: UserProfiling;
  private conversationMemory: ConversationMemory;

  constructor(userProfiling: UserProfiling, conversationMemory: ConversationMemory) {
    this.userProfiling = userProfiling;
    this.conversationMemory = conversationMemory;
  }

  /**
   * Get personalization context for a user
   */
  async getPersonalizationContext(
    sessionId: string
  ): Promise<PersonalizationContext> {
    try {
      // Get user profile
      const profile = await this.userProfiling.getProfile(sessionId);

      // Get conversation history
      const conversationHistory =
        await this.conversationMemory.getConversationHistory(sessionId, 5);

      // Get conversation summary
      const conversationSummary =
        await this.conversationMemory.getConversationSummary(sessionId);

      // Calculate lead score
      const leadScore = await this.userProfiling.calculateLeadScore(sessionId);

      return {
        profile: profile || undefined,
        conversationHistory,
        conversationSummary,
        leadScore,
        recommendations: this.generateRecommendations(profile),
        personalizedGreeting: this.generatePersonalizedGreeting(profile),
        suggestedQuestions: this.generateSuggestedQuestions(profile),
      };
    } catch (error) {
      console.error('Error getting personalization context:', error);
      return {
        conversationHistory: [],
        conversationSummary: {
          totalMessages: 0,
          firstMessage: null,
          lastMessage: null,
          commonIntents: [],
          avgConfidence: 0,
          sentimentTrend: 'neutral',
        },
        leadScore: {
          score: 0,
          factors: {},
          isQualified: false,
          confidence: 0,
        },
        recommendations: [],
        personalizedGreeting: 'Hello! How can I help you today?',
        suggestedQuestions: [],
      };
    }
  }

  /**
   * Generate personalized greeting
   */
  private generatePersonalizedGreeting(
    profile: UserProfile | null
  ): string {
    if (!profile) {
      return 'Hello! Welcome to HLPFL Records. How can I assist you today?';
    }

    // Returning user
    if (profile.totalSessions > 1) {
      const greeting = profile.name
        ? `Welcome back, ${profile.name}!`
        : 'Welcome back!';

      // Add context based on last interaction
      if (profile.lastIntent) {
        const intentGreetings: Record<string, string> = {
          artist_submission: 'Ready to continue with your artist submission?',
          service_inquiry: 'Have more questions about our services?',
          booking_request: 'Would you like to proceed with booking?',
          pricing_inquiry: 'Need more information about pricing?',
        };

        const contextGreeting = intentGreetings[profile.lastIntent];
        if (contextGreeting) {
          return `${greeting} ${contextGreeting}`;
        }
      }

      return `${greeting} How can I help you today?`;
    }

    // First-time user
    return 'Hello! Welcome to HLPFL Records. I\'m here to help you with artist development, music production, distribution, and more. What brings you here today?';
  }

  /**
   * Generate personalized recommendations
   */
  private generateRecommendations(
    profile: UserProfile | null
  ): string[] {
    const recommendations: string[] = [];

    if (!profile) {
      return [
        'Learn about our artist development programs',
        'Explore our music production services',
        'Check out our distribution options',
        'View our success stories',
      ];
    }

    // Based on preferred services
    if (profile.preferredServices && profile.preferredServices.length > 0) {
      profile.preferredServices.forEach((service) => {
        const serviceRecommendations: Record<string, string> = {
          'Artist Development': 'Schedule a career planning consultation',
          'Music Production': 'Book a studio session',
          'Distribution': 'Get your music on 150+ platforms',
          'Marketing': 'Launch a promotional campaign',
          'Publishing': 'Protect your music rights',
        };

        const recommendation = serviceRecommendations[service];
        if (recommendation) {
          recommendations.push(recommendation);
        }
      });
    }

    // Based on conversion stage
    const stageRecommendations: Record<string, string[]> = {
      awareness: [
        'Learn about our 50/50 partnership model',
        'See what makes HLPFL different',
        'Meet our team of industry experts',
      ],
      consideration: [
        'Compare our service packages',
        'Read artist testimonials',
        'Schedule a free consultation',
      ],
      decision: [
        'Review our contract terms',
        'Get a personalized quote',
        'Talk to one of our A&R representatives',
      ],
      action: [
        'Complete your artist profile',
        'Submit your demo',
        'Schedule your first session',
      ],
    };

    const stageRecs = stageRecommendations[profile.conversionStage] || [];
    recommendations.push(...stageRecs);

    // Based on budget
    if (profile.budgetRange) {
      if (profile.budgetRange.includes('$1000-$5000')) {
        recommendations.push('Explore our starter packages');
      } else if (profile.budgetRange.includes('$5000-$10000')) {
        recommendations.push('Check out our professional packages');
      } else if (profile.budgetRange.includes('$10000+')) {
        recommendations.push('Learn about our premium services');
      }
    }

    // Based on timeline
    if (profile.timeline) {
      if (profile.timeline === 'immediate') {
        recommendations.push('View our immediate availability');
      } else if (profile.timeline.includes('1-3 months')) {
        recommendations.push('Reserve your spot for next quarter');
      }
    }

    // Return unique recommendations (max 5)
    return [...new Set(recommendations)].slice(0, 5);
  }

  /**
   * Generate suggested questions
   */
  private generateSuggestedQuestions(
    profile: UserProfile | null
  ): string[] {
    const questions: string[] = [];

    if (!profile) {
      return [
        'What services do you offer?',
        'How does your partnership model work?',
        'What genres do you work with?',
        'How much does it cost?',
      ];
    }

    // Based on preferred genres
    if (profile.preferredGenres && profile.preferredGenres.length > 0) {
      const genre = profile.preferredGenres[0];
      questions.push(`What ${genre} artists have you worked with?`);
    }

    // Based on conversion stage
    const stageQuestions: Record<string, string[]> = {
      awareness: [
        'What makes HLPFL different from other labels?',
        'How long have you been in business?',
        'What is your success rate?',
      ],
      consideration: [
        'What is included in your packages?',
        'How long does the process take?',
        'Can I see examples of your work?',
      ],
      decision: [
        'What are the contract terms?',
        'When can we get started?',
        'What is the next step?',
      ],
      action: [
        'How do I submit my demo?',
        'When will I hear back?',
        'What documents do I need?',
      ],
    };

    const stageQs = stageQuestions[profile.conversionStage] || [];
    questions.push(...stageQs);

    // Based on last intent
    if (profile.lastIntent) {
      const intentQuestions: Record<string, string[]> = {
        pricing_inquiry: [
          'Do you offer payment plans?',
          'Are there any hidden fees?',
        ],
        service_inquiry: [
          'Can I customize my package?',
          'Do you offer bundle discounts?',
        ],
        booking_request: [
          'What dates are available?',
          'How far in advance should I book?',
        ],
      };

      const intentQs = intentQuestions[profile.lastIntent] || [];
      questions.push(...intentQs);
    }

    // Return unique questions (max 4)
    return [...new Set(questions)].slice(0, 4);
  }

  /**
   * Personalize response based on user context
   */
  async personalizeResponse(
    sessionId: string,
    baseResponse: string
  ): Promise<string> {
    try {
      const context = await this.getPersonalizationContext(sessionId);
      const profile = context.profile;

      if (!profile) {
        return baseResponse;
      }

      let personalizedResponse = baseResponse;

      // Add name if available
      if (profile.name && !baseResponse.includes(profile.name)) {
        personalizedResponse = personalizedResponse.replace(
          /^(Hello|Hi|Hey)/i,
          `$1 ${profile.name}`
        );
      }

      // Add context based on preferences
      if (profile.preferredServices && profile.preferredServices.length > 0) {
        const services = profile.preferredServices.join(', ');
        if (
          baseResponse.includes('services') &&
          !baseResponse.includes(services)
        ) {
          personalizedResponse += `\n\nBased on your interest in ${services}, I can provide more specific information if you'd like.`;
        }
      }

      // Add urgency if timeline is immediate
      if (profile.timeline === 'immediate') {
        if (
          baseResponse.includes('book') ||
          baseResponse.includes('schedule')
        ) {
          personalizedResponse += '\n\nI see you\'re looking to get started right away. Let me check our immediate availability for you.';
        }
      }

      // Add lead nurturing for qualified leads
      if (context.leadScore.isQualified && context.leadScore.score >= 70) {
        if (!baseResponse.includes('consultation')) {
          personalizedResponse += '\n\nYou seem like a great fit for HLPFL! Would you like to schedule a free consultation with one of our A&R representatives?';
        }
      }

      return personalizedResponse;
    } catch (error) {
      console.error('Error personalizing response:', error);
      return baseResponse;
    }
  }

  /**
   * Get next best action for user
   */
  async getNextBestAction(sessionId: string): Promise<{
    action: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }> {
    try {
      const context = await this.getPersonalizationContext(sessionId);
      const profile = context.profile;
      const leadScore = context.leadScore;

      // High priority: Qualified lead ready to convert
      if (leadScore.isQualified && leadScore.score >= 80) {
        return {
          action: 'schedule_consultation',
          priority: 'high',
          reason: 'User is a highly qualified lead with strong intent',
        };
      }

      // High priority: Has contact info but needs more engagement
      if (profile?.email && profile.engagementScore < 50) {
        return {
          action: 'send_personalized_content',
          priority: 'high',
          reason: 'User provided contact info but needs more engagement',
        };
      }

      // Medium priority: Interested but missing key information
      if (
        profile &&
        profile.preferredServices &&
        profile.preferredServices.length > 0 &&
        !profile.budgetRange
      ) {
        return {
          action: 'ask_budget',
          priority: 'medium',
          reason: 'User is interested but budget information is missing',
        };
      }

      // Medium priority: High engagement but no contact info
      if (profile && profile.engagementScore >= 60 && !profile.email) {
        return {
          action: 'request_contact_info',
          priority: 'medium',
          reason: 'User is highly engaged but no contact information',
        };
      }

      // Low priority: New user, build awareness
      if (!profile || profile.totalSessions === 1) {
        return {
          action: 'provide_overview',
          priority: 'low',
          reason: 'New user needs introduction to HLPFL services',
        };
      }

      // Default: Continue conversation
      return {
        action: 'continue_conversation',
        priority: 'low',
        reason: 'Continue building relationship and gathering information',
      };
    } catch (error) {
      console.error('Error getting next best action:', error);
      return {
        action: 'continue_conversation',
        priority: 'low',
        reason: 'Default action',
      };
    }
  }

  /**
   * Track user interaction for personalization
   */
  async trackInteraction(
    sessionId: string,
    interaction: {
      type: 'message' | 'click' | 'view' | 'submit';
      data?: Record<string, any>;
    }
  ): Promise<void> {
    try {
      // Update user profile based on interaction
      const profile = await this.userProfiling.getProfile(sessionId);

      if (!profile) {
        return;
      }

      // Extract preferences from interaction data
      if (interaction.data) {
        const preferences: any = {};

        if (interaction.data.genre) {
          preferences.genres = [interaction.data.genre];
        }

        if (interaction.data.service) {
          preferences.services = [interaction.data.service];
        }

        if (interaction.data.budget) {
          preferences.budget = interaction.data.budget;
        }

        if (interaction.data.timeline) {
          preferences.timeline = interaction.data.timeline;
        }

        if (Object.keys(preferences).length > 0) {
          await this.userProfiling.trackPreferences(sessionId, preferences);
        }
      }

      // Update conversion stage based on interaction type
      if (interaction.type === 'submit') {
        await this.userProfiling.updateConversionStage(sessionId, 'action');
      }
    } catch (error) {
      console.error('Error tracking interaction:', error);
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const userProfilingHealth = await this.userProfiling.healthCheck();
      const conversationMemoryHealth =
        await this.conversationMemory.healthCheck();
      return userProfilingHealth && conversationMemoryHealth;
    } catch (error) {
      console.error('Personalization engine health check failed:', error);
      return false;
    }
  }
}

export default PersonalizationEngine;