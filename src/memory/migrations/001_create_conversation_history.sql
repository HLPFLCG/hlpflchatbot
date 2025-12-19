-- Migration: 001_create_conversation_history.sql
-- Description: Create conversation history table for storing all chat messages
-- Created: December 19, 2024

-- Conversation History Table
-- Stores all messages exchanged between users and the chatbot
CREATE TABLE IF NOT EXISTS conversation_history (
  -- Primary key
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Session and user identification
  session_id TEXT NOT NULL,
  user_id TEXT,
  
  -- Message content
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  
  -- AI analysis results
  intent TEXT,
  entities TEXT, -- JSON string of extracted entities
  sentiment TEXT,
  confidence REAL,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  referer TEXT,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes for fast lookups
  FOREIGN KEY (session_id) REFERENCES user_profiles(session_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_session_id ON conversation_history(session_id);
CREATE INDEX IF NOT EXISTS idx_conversation_user_id ON conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_created_at ON conversation_history(created_at);
CREATE INDEX IF NOT EXISTS idx_conversation_intent ON conversation_history(intent);

-- Comments
-- session_id: Unique identifier for each conversation session
-- user_id: Optional persistent user identifier (cookie/auth)
-- message: User's input message
-- response: Chatbot's response
-- intent: Classified intent (greeting, inquiry, booking, etc.)
-- entities: JSON string containing extracted entities
-- sentiment: Sentiment analysis result (positive, negative, neutral)
-- confidence: Confidence score for intent classification (0.0 to 1.0)
-- ip_address: User's IP address for analytics
-- user_agent: Browser/device information
-- referer: Page where chat was initiated
-- created_at: Timestamp of message creation