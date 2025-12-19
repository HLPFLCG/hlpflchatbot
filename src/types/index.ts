/**
 * Type Definitions for HLPFL Chatbot
 * Centralized type definitions for the entire application
 */

/* ============================================
   ENVIRONMENT & CONFIGURATION TYPES
   ============================================ */

export interface Env {
  OPENAI_API_KEY?: string;
  ENVIRONMENT?: 'development' | 'staging' | 'production';
  ALLOWED_ORIGINS?: string;
  RATE_LIMIT_ENABLED?: string;
  CACHE_ENABLED?: string;
  CACHE?: KVNamespace | Map<string, any>;
  DB?: D1Database;
}

// Cloudflare D1 Database Types
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec(query: string): Promise<D1ExecResult>;
}

export interface D1PreparedStatement {
  bind(...values: any[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<D1Result<T>>;
  all<T = unknown>(): Promise<D1Result<T>>;
  raw<T = unknown>(): Promise<T[]>;
}

export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  meta: {
    duration?: number;
    size_after?: number;
    rows_read?: number;
    rows_written?: number;
    last_row_id?: number;
    changes?: number;
  };
  error?: string;
}

export interface D1ExecResult {
  count: number;
  duration: number;
}

/* ============================================
   API REQUEST & RESPONSE TYPES
   ============================================ */

export interface ChatRequest {
  message: string;
  sessionId?: string;
  context?: ConversationContext;
}

export interface ChatResponse {
  response: string;
  intent?: string;
  entities?: ExtractedEntities;
  sentiment?: SentimentAnalysis;
  suggestions?: string[];
  quickActions?: QuickAction[];
  metadata?: ResponseMetadata;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

/* ============================================
   AI MODULE TYPES
   ============================================ */

export interface IntentClassification {
  intent: string;
  confidence: number;
  category: IntentCategory;
  subIntents?: string[];
}

export type IntentCategory =
  | 'greeting'
  | 'service_inquiry'
  | 'artist_submission'
  | 'pricing'
  | 'support'
  | 'company_info'
  | 'technical'
  | 'feedback'
  | 'complaint'
  | 'general'
  | 'unknown';

export interface ExtractedEntities {
  serviceType?: string[];
  genre?: string[];
  timeline?: string;
  budget?: string;
  location?: string;
  artistName?: string;
  urgency?: 'high' | 'medium' | 'low';
  experienceLevel?: 'beginner' | 'intermediate' | 'professional';
}

export interface SentimentAnalysis {
  sentiment: 'positive' | 'negative' | 'neutral';
  score: number;
  emotions: Emotion[];
  urgency: 'high' | 'medium' | 'low';
  tone: 'formal' | 'casual' | 'professional' | 'friendly';
}

export interface Emotion {
  type: EmotionType;
  intensity: number;
}

export type EmotionType =
  | 'excited'
  | 'frustrated'
  | 'curious'
  | 'anxious'
  | 'hopeful'
  | 'confused'
  | 'satisfied'
  | 'disappointed'
  | 'neutral';

export interface AIResponse {
  content: string;
  reasoning?: string;
  confidence: number;
  tokensUsed?: number;
  model?: string;
}

/* ============================================
   CONVERSATION & CONTEXT TYPES
   ============================================ */

export interface ConversationContext {
  sessionId: string;
  userId?: string;
  history: Message[];
  userProfile?: UserProfile;
  currentIntent?: string;
  entities?: ExtractedEntities;
  sentiment?: SentimentAnalysis;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: MessageMetadata;
}

export interface MessageMetadata {
  intent?: string;
  entities?: ExtractedEntities;
  sentiment?: SentimentAnalysis;
  tokensUsed?: number;
  responseTime?: number;
}

export interface UserProfile {
  id: string;
  name?: string;
  email?: string;
  preferences?: UserPreferences;
  history?: ConversationSummary[];
}

export interface UserPreferences {
  language?: string;
  timezone?: string;
  communicationStyle?: 'formal' | 'casual';
  interests?: string[];
}

export interface ConversationSummary {
  sessionId: string;
  startTime: number;
  endTime?: number;
  messageCount: number;
  topics: string[];
  outcome?: string;
}

/* ============================================
   UI & INTERACTION TYPES
   ============================================ */

export interface QuickAction {
  id: string;
  label: string;
  action: string;
  icon?: string;
}

export interface ResponseMetadata {
  responseTime: number;
  cached: boolean;
  confidence: number;
  sources?: string[];
}

/* ============================================
   CACHE TYPES
   ============================================ */

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  ttl: number;
  hits: number;
}

export interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  averageResponseTime: number;
  oldestEntry?: number;
  newestEntry?: number;
}

/* ============================================
   KNOWLEDGE BASE TYPES
   ============================================ */

export interface CompanyInfo {
  name: string;
  tagline: string;
  founded: number;
  location: string;
  description: string;
  mission: string;
  vision: string;
  values: string[];
  statistics: CompanyStatistics;
  contact: ContactInfo;
}

export interface CompanyStatistics {
  artists: number;
  releases: number;
  streams: string;
  awards: number;
  yearsInBusiness: number;
}

export interface ContactInfo {
  email: string;
  phone: string;
  address?: string;
  socialMedia?: SocialMediaLinks;
}

export interface SocialMediaLinks {
  instagram?: string;
  twitter?: string;
  facebook?: string;
  linkedin?: string;
  youtube?: string;
}

export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  features: string[];
  pricing?: PricingInfo;
  duration?: string;
}

export interface PricingInfo {
  type: 'fixed' | 'variable' | 'custom';
  amount?: number;
  currency?: string;
  description?: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  relatedQuestions?: string[];
}

/* ============================================
   LIVE DATA TYPES
   ============================================ */

export interface Artist {
  id: string;
  name: string;
  genre: string[];
  bio: string;
  image?: string;
  socialMedia?: SocialMediaLinks;
  statistics?: ArtistStatistics;
  releases?: Release[];
}

export interface ArtistStatistics {
  totalStreams: number;
  monthlyListeners: number;
  followers: number;
  releases: number;
}

export interface Release {
  id: string;
  title: string;
  artist: string;
  type: 'single' | 'ep' | 'album';
  releaseDate: string;
  genre: string[];
  coverArt?: string;
  streamingLinks?: StreamingLinks;
  statistics?: ReleaseStatistics;
}

export interface StreamingLinks {
  spotify?: string;
  appleMusic?: string;
  youtube?: string;
  soundcloud?: string;
  tidal?: string;
}

export interface ReleaseStatistics {
  totalStreams: number;
  peakPosition?: number;
  chartAppearances?: number;
}

export interface Event {
  id: string;
  title: string;
  type: 'concert' | 'festival' | 'workshop' | 'webinar' | 'other';
  date: string;
  location: string;
  description: string;
  artists?: string[];
  ticketLink?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  publishDate: string;
  category: string;
  tags: string[];
  image?: string;
}

export interface Testimonial {
  id: string;
  author: string;
  role: string;
  content: string;
  rating: number;
  date: string;
  image?: string;
}

/* ============================================
   VALIDATION TYPES
   ============================================ */

export interface ValidationResult {
  isValid: boolean;
  sanitized: string;
  errors: string[];
}

export interface SanitizationOptions {
  maxLength?: number;
  allowHtml?: boolean;
  stripScripts?: boolean;
  allowedTags?: string[];
}

/* ============================================
   RATE LIMITING TYPES
   ============================================ */

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  info: RateLimitInfo;
}

/* ============================================
   SECURITY TYPES
   ============================================ */

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'Strict-Transport-Security': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'X-XSS-Protection': string;
}

export interface CorsOptions {
  allowedOrigins: string[] | '*';
  allowedMethods: string[];
  allowedHeaders: string[];
  exposedHeaders?: string[];
  maxAge?: number;
  credentials?: boolean;
}

/* ============================================
   OPENAI API TYPES
   ============================================ */

export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIRequest {
  model: string;
  messages: OpenAIMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  stream?: boolean;
}

export interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: OpenAIChoice[];
  usage: OpenAIUsage;
}

export interface OpenAIChoice {
  index: number;
  message: OpenAIMessage;
  finish_reason: string;
}

export interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenAIError {
  error: {
    message: string;
    type: string;
    param?: string;
    code?: string;
  };
}

/* ============================================
   ANALYTICS & MONITORING TYPES
   ============================================ */

export interface AnalyticsEvent {
  type: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  data?: any;
}

export interface PerformanceMetrics {
  responseTime: number;
  tokensUsed: number;
  cacheHit: boolean;
  errorOccurred: boolean;
  endpoint: string;
}

export interface ErrorLog {
  timestamp: number;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  context?: any;
}

/* ============================================
   UTILITY TYPES
   ============================================ */

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

export type AsyncFunction<T = any> = (...args: any[]) => Promise<T>;

/* ============================================
   MEMORY & CONVERSATION TYPES
   ============================================ */

export interface ConversationMessage {
  id?: number;
  sessionId: string;
  userId?: string;
  message: string;
  response: string;
  intent?: string;
  entities?: ExtractedEntity[];
  sentiment?: string;
  confidence?: number;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  createdAt?: string;
}

export interface ConversationHistoryQuery {
  sessionId?: string;
  userId?: string;
  intent?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface ConversationStats {
  totalMessages: number;
  uniqueSessions: number;
  uniqueUsers: number;
  avgConfidence: number;
  sentimentDistribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
}

export interface UserProfile {
  id?: number;
  sessionId: string;
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  preferredGenres?: string[];
  preferredServices?: string[];
  budgetRange?: string;
  timeline?: string;
  location?: string;
  totalMessages?: number;
  totalSessions?: number;
  avgSessionDuration?: number;
  lastIntent?: string;
  commonIntents?: string[];
  engagementScore?: number;
  conversionStage?: 'awareness' | 'consideration' | 'decision' | 'action';
  isQualifiedLead?: boolean;
  leadScore?: number;
  contactPreference?: string;
  bestContactTime?: string;
  timezone?: string;
  firstSeen?: string;
  lastSeen?: string;
  ipAddress?: string;
  userAgent?: string;
  referer?: string;
  isActive?: boolean;
  isBlocked?: boolean;
  notes?: string;
}

export interface UserBehavior {
  messageCount?: number;
  sessionDuration?: number;
  intentCount?: number;
  sentimentScore?: number;
  returnRate?: number;
  lastIntent?: string;
}

export interface LeadScore {
  score: number;
  factors: Record<string, number>;
  isQualified: boolean;
  confidence: number;
}

export interface PersonalizationContext {
  profile?: UserProfile;
  conversationHistory: ConversationMessage[];
  conversationSummary: {
    totalMessages: number;
    firstMessage: string | null;
    lastMessage: string | null;
    commonIntents: string[];
    avgConfidence: number;
    sentimentTrend: string;
  };
  leadScore: LeadScore;
  recommendations: string[];
  personalizedGreeting: string;
  suggestedQuestions: string[];
}

export interface UserFeedback {
  id?: number;
  sessionId: string;
  userId?: string;
  conversationId?: number;
  feedbackType: 'rating' | 'comment' | 'bug_report' | 'feature_request';
  rating?: number;
  comment?: string;
  helpfulnessRating?: number;
  accuracyRating?: number;
  speedRating?: number;
  friendlinessRating?: number;
  feedbackSentiment?: string;
  feedbackTopics?: string[];
  issueCategory?: string;
  issueSeverity?: 'low' | 'medium' | 'high' | 'critical';
  isResolved?: boolean;
  resolutionNotes?: string;
  resolvedAt?: string;
  createdAt?: string;
  requiresFollowUp?: boolean;
  followedUpAt?: string;
  followUpNotes?: string;
}

export interface AnalyticsEventExtended extends AnalyticsEvent {
  eventType: string;
  eventCategory: 'engagement' | 'conversion' | 'technical' | 'user_action';
  eventAction: string;
  eventLabel?: string;
  eventValue?: number;
  eventData?: Record<string, any>;
  pageUrl?: string;
  pageTitle?: string;
  referer?: string;
  responseTime?: number;
  apiEndpoint?: string;
  httpStatus?: number;
  errorMessage?: string;
  errorStack?: string;
  browser?: string;
  deviceType?: 'desktop' | 'mobile' | 'tablet';
  os?: string;
  screenResolution?: string;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  isProcessed?: boolean;
  processedAt?: string;
}
