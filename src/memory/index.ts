/**
 * Memory Module - Unified Export
 * Provides conversation memory, user profiling, and personalization
 */

export { ConversationMemory } from './conversation-memory';
export { UserProfiling } from './user-profiling';
export { PersonalizationEngine } from './personalization-engine';

// Re-export types
export type {
  ConversationMessage,
  ConversationHistoryQuery,
  ConversationStats,
  UserProfile,
  UserBehavior,
  LeadScore,
  PersonalizationContext,
} from '../types';