-- Migration: 004_create_analytics_events.sql
-- Description: Create analytics events table for tracking user interactions and system events
-- Created: December 19, 2024

-- Analytics Events Table
-- Stores all trackable events for analytics and monitoring
CREATE TABLE IF NOT EXISTS analytics_events (
  -- Primary key
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Event identification
  event_type TEXT NOT NULL, -- 'page_view', 'chat_start', 'chat_message', 'chat_end', 'button_click', 'link_click', 'form_submit', 'error', 'api_call'
  event_category TEXT NOT NULL, -- 'engagement', 'conversion', 'technical', 'user_action'
  event_action TEXT NOT NULL, -- Specific action taken
  event_label TEXT, -- Additional context
  
  -- User context
  session_id TEXT NOT NULL,
  user_id TEXT,
  
  -- Event data
  event_value REAL, -- Numeric value (e.g., response time, rating)
  event_data TEXT, -- JSON string with additional event data
  
  -- Page/location context
  page_url TEXT,
  page_title TEXT,
  referer TEXT,
  
  -- Technical context
  response_time INTEGER, -- in milliseconds
  api_endpoint TEXT,
  http_status INTEGER,
  error_message TEXT,
  error_stack TEXT,
  
  -- User environment
  ip_address TEXT,
  user_agent TEXT,
  browser TEXT,
  device_type TEXT, -- 'desktop', 'mobile', 'tablet'
  os TEXT,
  screen_resolution TEXT,
  
  -- Geolocation (if available)
  country TEXT,
  region TEXT,
  city TEXT,
  timezone TEXT,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Metadata
  is_processed BOOLEAN DEFAULT 0,
  processed_at DATETIME,
  
  FOREIGN KEY (session_id) REFERENCES user_profiles(session_id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_event_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_analytics_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_is_processed ON analytics_events(is_processed);
CREATE INDEX IF NOT EXISTS idx_analytics_device_type ON analytics_events(device_type);
CREATE INDEX IF NOT EXISTS idx_analytics_country ON analytics_events(country);

-- Create view for common analytics queries
CREATE VIEW IF NOT EXISTS analytics_summary AS
SELECT 
  DATE(created_at) as date,
  event_category,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT user_id) as unique_users,
  AVG(response_time) as avg_response_time,
  AVG(event_value) as avg_event_value
FROM analytics_events
GROUP BY DATE(created_at), event_category, event_type;

-- Create view for user engagement metrics
CREATE VIEW IF NOT EXISTS user_engagement_metrics AS
SELECT 
  session_id,
  user_id,
  COUNT(*) as total_events,
  COUNT(DISTINCT event_type) as unique_event_types,
  MIN(created_at) as first_event,
  MAX(created_at) as last_event,
  (JULIANDAY(MAX(created_at)) - JULIANDAY(MIN(created_at))) * 86400 as session_duration_seconds,
  SUM(CASE WHEN event_category = 'conversion' THEN 1 ELSE 0 END) as conversion_events,
  SUM(CASE WHEN event_category = 'engagement' THEN 1 ELSE 0 END) as engagement_events
FROM analytics_events
GROUP BY session_id, user_id;

-- Create view for error tracking
CREATE VIEW IF NOT EXISTS error_tracking AS
SELECT 
  DATE(created_at) as date,
  event_type,
  error_message,
  COUNT(*) as error_count,
  COUNT(DISTINCT session_id) as affected_sessions,
  AVG(response_time) as avg_response_time
FROM analytics_events
WHERE event_category = 'technical' AND error_message IS NOT NULL
GROUP BY DATE(created_at), event_type, error_message
ORDER BY error_count DESC;

-- Comments
-- event_type: Specific type of event (page_view, chat_message, etc.)
-- event_category: High-level category (engagement, conversion, technical)
-- event_action: Specific action taken (clicked, submitted, viewed)
-- event_label: Additional context or identifier
-- session_id: Session where event occurred
-- user_id: User who triggered event
-- event_value: Numeric value associated with event
-- event_data: JSON string with additional structured data
-- page_url: URL where event occurred
-- page_title: Title of the page
-- referer: Referring page
-- response_time: Time taken for operation (milliseconds)
-- api_endpoint: API endpoint called (if applicable)
-- http_status: HTTP status code (if applicable)
-- error_message: Error message (if error occurred)
-- error_stack: Stack trace (if error occurred)
-- ip_address: User's IP address
-- user_agent: Full user agent string
-- browser: Parsed browser name
-- device_type: Type of device (desktop, mobile, tablet)
-- os: Operating system
-- screen_resolution: Screen resolution (e.g., "1920x1080")
-- country, region, city: Geolocation data
-- timezone: User's timezone
-- created_at: When event occurred
-- is_processed: Whether event has been processed for analytics
-- processed_at: When event was processed