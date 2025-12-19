-- Migration: 003_create_user_feedback.sql
-- Description: Create user feedback table for collecting ratings and feedback
-- Created: December 19, 2024

-- User Feedback Table
-- Stores user ratings, feedback, and satisfaction metrics
CREATE TABLE IF NOT EXISTS user_feedback (
  -- Primary key
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Reference to conversation
  session_id TEXT NOT NULL,
  user_id TEXT,
  conversation_id INTEGER,
  
  -- Feedback type
  feedback_type TEXT NOT NULL, -- 'rating', 'comment', 'bug_report', 'feature_request'
  
  -- Rating (1-5 stars)
  rating INTEGER CHECK(rating >= 1 AND rating <= 5),
  
  -- Feedback content
  comment TEXT,
  
  -- Specific aspects rated
  helpfulness_rating INTEGER CHECK(helpfulness_rating >= 1 AND helpfulness_rating <= 5),
  accuracy_rating INTEGER CHECK(accuracy_rating >= 1 AND accuracy_rating <= 5),
  speed_rating INTEGER CHECK(speed_rating >= 1 AND speed_rating <= 5),
  friendliness_rating INTEGER CHECK(friendliness_rating >= 1 AND friendliness_rating <= 5),
  
  -- Sentiment analysis of feedback
  feedback_sentiment TEXT, -- positive, negative, neutral
  feedback_topics TEXT, -- JSON array of topics mentioned
  
  -- Issue tracking
  issue_category TEXT, -- 'technical', 'content', 'ux', 'other'
  issue_severity TEXT, -- 'low', 'medium', 'high', 'critical'
  is_resolved BOOLEAN DEFAULT 0,
  resolution_notes TEXT,
  resolved_at DATETIME,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  
  -- Follow-up
  requires_follow_up BOOLEAN DEFAULT 0,
  followed_up_at DATETIME,
  follow_up_notes TEXT,
  
  FOREIGN KEY (session_id) REFERENCES user_profiles(session_id) ON DELETE CASCADE,
  FOREIGN KEY (conversation_id) REFERENCES conversation_history(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_session_id ON user_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON user_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON user_feedback(feedback_type);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON user_feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON user_feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_feedback_requires_follow_up ON user_feedback(requires_follow_up);
CREATE INDEX IF NOT EXISTS idx_feedback_is_resolved ON user_feedback(is_resolved);

-- Comments
-- session_id: Session where feedback was given
-- user_id: User who provided feedback
-- conversation_id: Specific conversation being rated (optional)
-- feedback_type: Type of feedback (rating, comment, bug, feature)
-- rating: Overall rating (1-5 stars)
-- comment: User's written feedback
-- helpfulness_rating: How helpful was the chatbot (1-5)
-- accuracy_rating: How accurate were the responses (1-5)
-- speed_rating: How fast were the responses (1-5)
-- friendliness_rating: How friendly was the interaction (1-5)
-- feedback_sentiment: Sentiment of the feedback text
-- feedback_topics: JSON array of topics mentioned in feedback
-- issue_category: Category of issue if reporting a problem
-- issue_severity: How severe the issue is
-- is_resolved: Whether the issue has been resolved
-- resolution_notes: Notes about how issue was resolved
-- resolved_at: When the issue was resolved
-- requires_follow_up: Whether feedback needs follow-up
-- followed_up_at: When follow-up was completed
-- follow_up_notes: Notes from follow-up