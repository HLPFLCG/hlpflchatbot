-- Migration: 002_create_user_profiles.sql
-- Description: Create user profiles table for tracking user behavior and preferences
-- Created: December 19, 2024

-- User Profiles Table
-- Stores user behavior, preferences, and engagement metrics
CREATE TABLE IF NOT EXISTS user_profiles (
  -- Primary key
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- User identification
  session_id TEXT UNIQUE NOT NULL,
  user_id TEXT UNIQUE,
  
  -- User information
  name TEXT,
  email TEXT,
  phone TEXT,
  
  -- Preferences and interests
  preferred_genres TEXT, -- JSON array of music genres
  preferred_services TEXT, -- JSON array of services interested in
  budget_range TEXT,
  timeline TEXT,
  location TEXT,
  
  -- Behavior tracking
  total_messages INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 1,
  avg_session_duration INTEGER DEFAULT 0, -- in seconds
  last_intent TEXT,
  common_intents TEXT, -- JSON array of most common intents
  
  -- Engagement metrics
  engagement_score REAL DEFAULT 0.0, -- 0.0 to 100.0
  conversion_stage TEXT DEFAULT 'awareness', -- awareness, consideration, decision, action
  is_qualified_lead BOOLEAN DEFAULT 0,
  lead_score REAL DEFAULT 0.0, -- 0.0 to 100.0
  
  -- Contact preferences
  contact_preference TEXT, -- email, phone, whatsapp, etc.
  best_contact_time TEXT,
  timezone TEXT,
  
  -- Metadata
  first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  referer TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT 1,
  is_blocked BOOLEAN DEFAULT 0,
  notes TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_session_id ON user_profiles(session_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_seen ON user_profiles(last_seen);
CREATE INDEX IF NOT EXISTS idx_user_profiles_conversion_stage ON user_profiles(conversion_stage);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_qualified_lead ON user_profiles(is_qualified_lead);
CREATE INDEX IF NOT EXISTS idx_user_profiles_lead_score ON user_profiles(lead_score);

-- Comments
-- session_id: Unique session identifier (required)
-- user_id: Persistent user identifier across sessions (optional)
-- name, email, phone: Contact information collected during conversation
-- preferred_genres: JSON array like ["Hip Hop", "R&B", "Pop"]
-- preferred_services: JSON array like ["Recording", "Distribution", "Marketing"]
-- budget_range: User's budget (e.g., "$1000-$5000", "$5000-$10000")
-- timeline: When they want to start (e.g., "immediate", "1-3 months", "3-6 months")
-- location: User's location for local services
-- total_messages: Total number of messages sent by user
-- total_sessions: Number of separate conversation sessions
-- avg_session_duration: Average time spent in conversation (seconds)
-- last_intent: Most recent classified intent
-- common_intents: JSON array of frequently used intents
-- engagement_score: Overall engagement level (0-100)
-- conversion_stage: Where user is in the funnel
-- is_qualified_lead: Whether user meets qualification criteria
-- lead_score: Predictive score for conversion likelihood (0-100)
-- contact_preference: Preferred communication channel
-- best_contact_time: When user prefers to be contacted
-- timezone: User's timezone for scheduling
-- first_seen: First interaction timestamp
-- last_seen: Most recent interaction timestamp
-- is_active: Whether profile is currently active
-- is_blocked: Whether user is blocked (spam/abuse)
-- notes: Internal notes about the user