# 🗄️ HLPFL Chatbot - Database Schema Documentation

**Version**: 1.0.0  
**Database**: Cloudflare D1 (SQLite)  
**Created**: December 19, 2024  

---

## 📋 Overview

The HLPFL Chatbot uses Cloudflare D1 (SQLite-based) database to store conversation history, user profiles, feedback, and analytics events. This enables:

- **Conversation Continuity**: Remember past interactions
- **User Profiling**: Track preferences and behavior
- **Personalization**: Tailor responses to individual users
- **Analytics**: Measure engagement and performance
- **Lead Management**: Track and qualify potential customers

---

## 🗂️ Database Tables

### 1. conversation_history
**Purpose**: Store all chat messages and AI analysis results

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `session_id` | TEXT | Session identifier (required) |
| `user_id` | TEXT | Persistent user ID (optional) |
| `message` | TEXT | User's input message |
| `response` | TEXT | Chatbot's response |
| `intent` | TEXT | Classified intent |
| `entities` | TEXT | JSON string of extracted entities |
| `sentiment` | TEXT | Sentiment analysis result |
| `confidence` | REAL | Intent confidence (0.0-1.0) |
| `ip_address` | TEXT | User's IP address |
| `user_agent` | TEXT | Browser/device info |
| `referer` | TEXT | Referring page |
| `created_at` | DATETIME | Message timestamp |

**Indexes**:
- `idx_conversation_session_id` on `session_id`
- `idx_conversation_user_id` on `user_id`
- `idx_conversation_created_at` on `created_at`
- `idx_conversation_intent` on `intent`

**Example Query**:
```sql
-- Get conversation history for a session
SELECT message, response, intent, created_at
FROM conversation_history
WHERE session_id = 'abc123'
ORDER BY created_at DESC
LIMIT 10;
```

---

### 2. user_profiles
**Purpose**: Track user behavior, preferences, and engagement

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `session_id` | TEXT | Session ID (unique, required) |
| `user_id` | TEXT | Persistent user ID (unique) |
| `name` | TEXT | User's name |
| `email` | TEXT | User's email |
| `phone` | TEXT | User's phone |
| `preferred_genres` | TEXT | JSON array of genres |
| `preferred_services` | TEXT | JSON array of services |
| `budget_range` | TEXT | Budget range |
| `timeline` | TEXT | Project timeline |
| `location` | TEXT | User location |
| `total_messages` | INTEGER | Total messages sent |
| `total_sessions` | INTEGER | Number of sessions |
| `avg_session_duration` | INTEGER | Avg duration (seconds) |
| `last_intent` | TEXT | Most recent intent |
| `common_intents` | TEXT | JSON array of common intents |
| `engagement_score` | REAL | Engagement level (0-100) |
| `conversion_stage` | TEXT | Funnel stage |
| `is_qualified_lead` | BOOLEAN | Lead qualification status |
| `lead_score` | REAL | Lead score (0-100) |
| `contact_preference` | TEXT | Preferred contact method |
| `best_contact_time` | TEXT | Best time to contact |
| `timezone` | TEXT | User's timezone |
| `first_seen` | DATETIME | First interaction |
| `last_seen` | DATETIME | Last interaction |
| `ip_address` | TEXT | IP address |
| `user_agent` | TEXT | User agent |
| `referer` | TEXT | Referring page |
| `is_active` | BOOLEAN | Active status |
| `is_blocked` | BOOLEAN | Blocked status |
| `notes` | TEXT | Internal notes |

**Indexes**:
- `idx_user_profiles_session_id` on `session_id`
- `idx_user_profiles_user_id` on `user_id`
- `idx_user_profiles_email` on `email`
- `idx_user_profiles_last_seen` on `last_seen`
- `idx_user_profiles_conversion_stage` on `conversion_stage`
- `idx_user_profiles_is_qualified_lead` on `is_qualified_lead`
- `idx_user_profiles_lead_score` on `lead_score`

**Conversion Stages**:
- `awareness`: Just discovered HLPFL
- `consideration`: Evaluating services
- `decision`: Ready to decide
- `action`: Taking action (booking, signing up)

**Example Query**:
```sql
-- Get qualified leads with high engagement
SELECT name, email, lead_score, engagement_score, conversion_stage
FROM user_profiles
WHERE is_qualified_lead = 1
  AND lead_score >= 70
  AND is_active = 1
ORDER BY lead_score DESC
LIMIT 20;
```

---

### 3. user_feedback
**Purpose**: Collect ratings, feedback, and satisfaction metrics

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `session_id` | TEXT | Session ID (required) |
| `user_id` | TEXT | User ID |
| `conversation_id` | INTEGER | Specific conversation |
| `feedback_type` | TEXT | Type of feedback |
| `rating` | INTEGER | Overall rating (1-5) |
| `comment` | TEXT | Written feedback |
| `helpfulness_rating` | INTEGER | Helpfulness (1-5) |
| `accuracy_rating` | INTEGER | Accuracy (1-5) |
| `speed_rating` | INTEGER | Speed (1-5) |
| `friendliness_rating` | INTEGER | Friendliness (1-5) |
| `feedback_sentiment` | TEXT | Sentiment of feedback |
| `feedback_topics` | TEXT | JSON array of topics |
| `issue_category` | TEXT | Issue category |
| `issue_severity` | TEXT | Issue severity |
| `is_resolved` | BOOLEAN | Resolution status |
| `resolution_notes` | TEXT | Resolution notes |
| `resolved_at` | DATETIME | Resolution timestamp |
| `created_at` | DATETIME | Feedback timestamp |
| `ip_address` | TEXT | IP address |
| `user_agent` | TEXT | User agent |
| `requires_follow_up` | BOOLEAN | Follow-up needed |
| `followed_up_at` | DATETIME | Follow-up timestamp |
| `follow_up_notes` | TEXT | Follow-up notes |

**Feedback Types**:
- `rating`: Star rating
- `comment`: Written feedback
- `bug_report`: Bug or issue
- `feature_request`: Feature suggestion

**Issue Severities**:
- `low`: Minor issue
- `medium`: Moderate issue
- `high`: Significant issue
- `critical`: Critical issue

**Indexes**:
- `idx_feedback_session_id` on `session_id`
- `idx_feedback_user_id` on `user_id`
- `idx_feedback_type` on `feedback_type`
- `idx_feedback_rating` on `rating`
- `idx_feedback_created_at` on `created_at`
- `idx_feedback_requires_follow_up` on `requires_follow_up`
- `idx_feedback_is_resolved` on `is_resolved`

**Example Query**:
```sql
-- Get average ratings by aspect
SELECT 
  AVG(rating) as overall_rating,
  AVG(helpfulness_rating) as helpfulness,
  AVG(accuracy_rating) as accuracy,
  AVG(speed_rating) as speed,
  AVG(friendliness_rating) as friendliness,
  COUNT(*) as total_feedback
FROM user_feedback
WHERE created_at >= datetime('now', '-30 days');
```

---

### 4. analytics_events
**Purpose**: Track all user interactions and system events

| Column | Type | Description |
|--------|------|-------------|
| `id` | INTEGER | Primary key (auto-increment) |
| `event_type` | TEXT | Type of event (required) |
| `event_category` | TEXT | Event category (required) |
| `event_action` | TEXT | Specific action (required) |
| `event_label` | TEXT | Additional context |
| `session_id` | TEXT | Session ID (required) |
| `user_id` | TEXT | User ID |
| `event_value` | REAL | Numeric value |
| `event_data` | TEXT | JSON event data |
| `page_url` | TEXT | Page URL |
| `page_title` | TEXT | Page title |
| `referer` | TEXT | Referring page |
| `response_time` | INTEGER | Response time (ms) |
| `api_endpoint` | TEXT | API endpoint |
| `http_status` | INTEGER | HTTP status code |
| `error_message` | TEXT | Error message |
| `error_stack` | TEXT | Error stack trace |
| `ip_address` | TEXT | IP address |
| `user_agent` | TEXT | User agent |
| `browser` | TEXT | Browser name |
| `device_type` | TEXT | Device type |
| `os` | TEXT | Operating system |
| `screen_resolution` | TEXT | Screen resolution |
| `country` | TEXT | Country |
| `region` | TEXT | Region/state |
| `city` | TEXT | City |
| `timezone` | TEXT | Timezone |
| `created_at` | DATETIME | Event timestamp |
| `is_processed` | BOOLEAN | Processing status |
| `processed_at` | DATETIME | Processing timestamp |

**Event Types**:
- `page_view`: Page viewed
- `chat_start`: Chat initiated
- `chat_message`: Message sent
- `chat_end`: Chat ended
- `button_click`: Button clicked
- `link_click`: Link clicked
- `form_submit`: Form submitted
- `error`: Error occurred
- `api_call`: API called

**Event Categories**:
- `engagement`: User engagement
- `conversion`: Conversion action
- `technical`: Technical event
- `user_action`: User action

**Indexes**:
- `idx_analytics_event_type` on `event_type`
- `idx_analytics_event_category` on `event_category`
- `idx_analytics_session_id` on `session_id`
- `idx_analytics_user_id` on `user_id`
- `idx_analytics_created_at` on `created_at`
- `idx_analytics_is_processed` on `is_processed`
- `idx_analytics_device_type` on `device_type`
- `idx_analytics_country` on `country`

**Example Query**:
```sql
-- Get daily event counts by type
SELECT 
  DATE(created_at) as date,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_events
WHERE created_at >= datetime('now', '-7 days')
GROUP BY DATE(created_at), event_type
ORDER BY date DESC, event_count DESC;
```

---

## 📊 Database Views

### analytics_summary
**Purpose**: Aggregated analytics by date and event type

```sql
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
```

### user_engagement_metrics
**Purpose**: User engagement metrics per session

```sql
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
```

### error_tracking
**Purpose**: Error tracking and monitoring

```sql
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
```

---

## 🔗 Relationships

```
user_profiles (1) ──< (many) conversation_history
user_profiles (1) ──< (many) user_feedback
user_profiles (1) ──< (many) analytics_events

conversation_history (1) ──< (many) user_feedback
```

---

## 🚀 Setup Instructions

### 1. Create D1 Database
```bash
# Create database
wrangler d1 create hlpfl-chatbot-db

# Note the database_id from output
```

### 2. Update wrangler.toml
```toml
[[d1_databases]]
binding = "DB"
database_name = "hlpfl-chatbot-db"
database_id = "your-database-id-here"
```

### 3. Run Migrations
```bash
# Run all migrations in order
wrangler d1 execute hlpfl-chatbot-db --file=src/memory/migrations/001_create_conversation_history.sql
wrangler d1 execute hlpfl-chatbot-db --file=src/memory/migrations/002_create_user_profiles.sql
wrangler d1 execute hlpfl-chatbot-db --file=src/memory/migrations/003_create_user_feedback.sql
wrangler d1 execute hlpfl-chatbot-db --file=src/memory/migrations/004_create_analytics_events.sql
```

### 4. Verify Setup
```bash
# List tables
wrangler d1 execute hlpfl-chatbot-db --command="SELECT name FROM sqlite_master WHERE type='table';"

# Check table structure
wrangler d1 execute hlpfl-chatbot-db --command="PRAGMA table_info(conversation_history);"
```

---

## 📈 Common Queries

### Get Recent Conversations
```sql
SELECT 
  ch.session_id,
  up.name,
  up.email,
  ch.message,
  ch.response,
  ch.intent,
  ch.created_at
FROM conversation_history ch
LEFT JOIN user_profiles up ON ch.session_id = up.session_id
WHERE ch.created_at >= datetime('now', '-24 hours')
ORDER BY ch.created_at DESC
LIMIT 50;
```

### Get User Profile with Stats
```sql
SELECT 
  up.*,
  COUNT(DISTINCT ch.id) as total_messages,
  AVG(uf.rating) as avg_rating,
  COUNT(DISTINCT ae.id) as total_events
FROM user_profiles up
LEFT JOIN conversation_history ch ON up.session_id = ch.session_id
LEFT JOIN user_feedback uf ON up.session_id = uf.session_id
LEFT JOIN analytics_events ae ON up.session_id = ae.session_id
WHERE up.session_id = 'abc123'
GROUP BY up.id;
```

### Get Qualified Leads
```sql
SELECT 
  name,
  email,
  phone,
  lead_score,
  engagement_score,
  conversion_stage,
  preferred_services,
  budget_range,
  timeline,
  last_seen
FROM user_profiles
WHERE is_qualified_lead = 1
  AND is_active = 1
  AND email IS NOT NULL
ORDER BY lead_score DESC, last_seen DESC
LIMIT 50;
```

### Get Performance Metrics
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_messages,
  COUNT(DISTINCT session_id) as unique_sessions,
  AVG(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) * 100 as positive_sentiment_pct,
  COUNT(DISTINCT intent) as unique_intents
FROM conversation_history
WHERE created_at >= datetime('now', '-30 days')
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🔒 Security Considerations

1. **Data Privacy**: Store only necessary user data
2. **Encryption**: Use HTTPS for all connections
3. **Access Control**: Limit database access to authorized services
4. **Data Retention**: Implement data retention policies
5. **GDPR Compliance**: Allow users to request data deletion
6. **Anonymization**: Consider anonymizing old data

---

## 📊 Performance Optimization

1. **Indexes**: All critical columns are indexed
2. **Query Optimization**: Use prepared statements
3. **Batch Operations**: Batch inserts when possible
4. **Connection Pooling**: Reuse database connections
5. **Caching**: Cache frequently accessed data
6. **Archiving**: Archive old data periodically

---

## 🔄 Maintenance

### Regular Tasks
- Monitor database size
- Review and optimize slow queries
- Archive old conversations (>90 days)
- Clean up inactive user profiles
- Update analytics aggregations
- Review error logs

### Backup Strategy
- Cloudflare D1 provides automatic backups
- Export critical data periodically
- Test restore procedures

---

**Database Schema Version**: 1.0.0  
**Last Updated**: December 19, 2024  
**Status**: Production Ready