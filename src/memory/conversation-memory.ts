/**
 * Conversation Memory Module
 * Manages conversation history storage and retrieval using Cloudflare D1
 */

import type {
  ConversationMessage,
  ConversationHistoryQuery,
  ConversationStats,
  D1Database,
} from '../types';

export class ConversationMemory {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Store a conversation message
   */
  async storeMessage(message: ConversationMessage): Promise<number> {
    try {
      const result = await this.db
        .prepare(
          `INSERT INTO conversation_history 
          (session_id, user_id, message, response, intent, entities, sentiment, confidence, ip_address, user_agent, referer)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .bind(
          message.sessionId,
          message.userId || null,
          message.message,
          message.response,
          message.intent || null,
          message.entities ? JSON.stringify(message.entities) : null,
          message.sentiment || null,
          message.confidence || null,
          message.ipAddress || null,
          message.userAgent || null,
          message.referer || null
        )
        .run();

      return result.meta.last_row_id || 0;
    } catch (error) {
      console.error('Error storing conversation message:', error);
      throw new Error('Failed to store conversation message');
    }
  }

  /**
   * Get conversation history for a session
   */
  async getConversationHistory(
    sessionId: string,
    limit: number = 10
  ): Promise<ConversationMessage[]> {
    try {
      const result = await this.db
        .prepare(
          `SELECT 
            id,
            session_id as sessionId,
            user_id as userId,
            message,
            response,
            intent,
            entities,
            sentiment,
            confidence,
            ip_address as ipAddress,
            user_agent as userAgent,
            referer,
            created_at as createdAt
          FROM conversation_history
          WHERE session_id = ?
          ORDER BY created_at DESC
          LIMIT ?`
        )
        .bind(sessionId, limit)
        .all();

      return (result.results || []).map((row: any) => ({
        id: row.id,
        sessionId: row.sessionId,
        userId: row.userId,
        message: row.message,
        response: row.response,
        intent: row.intent,
        entities: row.entities ? JSON.parse(row.entities) : null,
        sentiment: row.sentiment,
        confidence: row.confidence,
        ipAddress: row.ipAddress,
        userAgent: row.userAgent,
        referer: row.referer,
        createdAt: row.createdAt,
      }));
    } catch (error) {
      console.error('Error retrieving conversation history:', error);
      return [];
    }
  }

  /**
   * Get recent conversations across all sessions
   */
  async getRecentConversations(
    limit: number = 50,
    hoursAgo: number = 24
  ): Promise<ConversationMessage[]> {
    try {
      const result = await this.db
        .prepare(
          `SELECT 
            id,
            session_id as sessionId,
            user_id as userId,
            message,
            response,
            intent,
            entities,
            sentiment,
            confidence,
            created_at as createdAt
          FROM conversation_history
          WHERE created_at >= datetime('now', '-' || ? || ' hours')
          ORDER BY created_at DESC
          LIMIT ?`
        )
        .bind(hoursAgo, limit)
        .all();

      return (result.results || []).map((row: any) => ({
        id: row.id,
        sessionId: row.sessionId,
        userId: row.userId,
        message: row.message,
        response: row.response,
        intent: row.intent,
        entities: row.entities ? JSON.parse(row.entities) : null,
        sentiment: row.sentiment,
        confidence: row.confidence,
        createdAt: row.createdAt,
      }));
    } catch (error) {
      console.error('Error retrieving recent conversations:', error);
      return [];
    }
  }

  /**
   * Search conversations by intent
   */
  async searchByIntent(
    intent: string,
    limit: number = 50
  ): Promise<ConversationMessage[]> {
    try {
      const result = await this.db
        .prepare(
          `SELECT 
            id,
            session_id as sessionId,
            user_id as userId,
            message,
            response,
            intent,
            entities,
            sentiment,
            confidence,
            created_at as createdAt
          FROM conversation_history
          WHERE intent = ?
          ORDER BY created_at DESC
          LIMIT ?`
        )
        .bind(intent, limit)
        .all();

      return (result.results || []).map((row: any) => ({
        id: row.id,
        sessionId: row.sessionId,
        userId: row.userId,
        message: row.message,
        response: row.response,
        intent: row.intent,
        entities: row.entities ? JSON.parse(row.entities) : null,
        sentiment: row.sentiment,
        confidence: row.confidence,
        createdAt: row.createdAt,
      }));
    } catch (error) {
      console.error('Error searching conversations by intent:', error);
      return [];
    }
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(sessionId?: string): Promise<ConversationStats> {
    try {
      let query = `
        SELECT 
          COUNT(*) as totalMessages,
          COUNT(DISTINCT session_id) as uniqueSessions,
          COUNT(DISTINCT user_id) as uniqueUsers,
          AVG(confidence) as avgConfidence,
          SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positiveCount,
          SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negativeCount,
          SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutralCount
        FROM conversation_history
      `;

      const bindings: any[] = [];
      if (sessionId) {
        query += ' WHERE session_id = ?';
        bindings.push(sessionId);
      }

      const result = await this.db.prepare(query).bind(...bindings).first();

      if (!result) {
        return {
          totalMessages: 0,
          uniqueSessions: 0,
          uniqueUsers: 0,
          avgConfidence: 0,
          sentimentDistribution: {
            positive: 0,
            negative: 0,
            neutral: 0,
          },
        };
      }

      return {
        totalMessages: result.totalMessages || 0,
        uniqueSessions: result.uniqueSessions || 0,
        uniqueUsers: result.uniqueUsers || 0,
        avgConfidence: result.avgConfidence || 0,
        sentimentDistribution: {
          positive: result.positiveCount || 0,
          negative: result.negativeCount || 0,
          neutral: result.neutralCount || 0,
        },
      };
    } catch (error) {
      console.error('Error getting conversation stats:', error);
      return {
        totalMessages: 0,
        uniqueSessions: 0,
        uniqueUsers: 0,
        avgConfidence: 0,
        sentimentDistribution: {
          positive: 0,
          negative: 0,
          neutral: 0,
        },
      };
    }
  }

  /**
   * Get intent distribution
   */
  async getIntentDistribution(
    limit: number = 10
  ): Promise<Array<{ intent: string; count: number }>> {
    try {
      const result = await this.db
        .prepare(
          `SELECT 
            intent,
            COUNT(*) as count
          FROM conversation_history
          WHERE intent IS NOT NULL
          GROUP BY intent
          ORDER BY count DESC
          LIMIT ?`
        )
        .bind(limit)
        .all();

      return (result.results || []).map((row: any) => ({
        intent: row.intent,
        count: row.count,
      }));
    } catch (error) {
      console.error('Error getting intent distribution:', error);
      return [];
    }
  }

  /**
   * Get conversation context (last N messages)
   */
  async getConversationContext(
    sessionId: string,
    messageCount: number = 5
  ): Promise<string> {
    try {
      const messages = await this.getConversationHistory(
        sessionId,
        messageCount
      );

      if (messages.length === 0) {
        return 'No previous conversation history.';
      }

      // Reverse to get chronological order
      const context = messages
        .reverse()
        .map((msg) => `User: ${msg.message}\nAssistant: ${msg.response}`)
        .join('\n\n');

      return context;
    } catch (error) {
      console.error('Error getting conversation context:', error);
      return 'Error retrieving conversation context.';
    }
  }

  /**
   * Delete old conversations (data retention)
   */
  async deleteOldConversations(daysOld: number = 90): Promise<number> {
    try {
      const result = await this.db
        .prepare(
          `DELETE FROM conversation_history
          WHERE created_at < datetime('now', '-' || ? || ' days')`
        )
        .bind(daysOld)
        .run();

      return result.meta.changes || 0;
    } catch (error) {
      console.error('Error deleting old conversations:', error);
      return 0;
    }
  }

  /**
   * Delete all conversations for a session (GDPR compliance)
   */
  async deleteSessionConversations(sessionId: string): Promise<number> {
    try {
      const result = await this.db
        .prepare('DELETE FROM conversation_history WHERE session_id = ?')
        .bind(sessionId)
        .run();

      return result.meta.changes || 0;
    } catch (error) {
      console.error('Error deleting session conversations:', error);
      return 0;
    }
  }

  /**
   * Get conversation summary for a session
   */
  async getConversationSummary(sessionId: string): Promise<{
    totalMessages: number;
    firstMessage: string | null;
    lastMessage: string | null;
    commonIntents: string[];
    avgConfidence: number;
    sentimentTrend: string;
  }> {
    try {
      // Get basic stats
      const statsResult = await this.db
        .prepare(
          `SELECT 
            COUNT(*) as totalMessages,
            AVG(confidence) as avgConfidence,
            MIN(created_at) as firstMessageTime,
            MAX(created_at) as lastMessageTime
          FROM conversation_history
          WHERE session_id = ?`
        )
        .bind(sessionId)
        .first();

      // Get first and last messages
      const messagesResult = await this.db
        .prepare(
          `SELECT message, created_at
          FROM conversation_history
          WHERE session_id = ?
          ORDER BY created_at ASC
          LIMIT 1`
        )
        .bind(sessionId)
        .first();

      const lastMessageResult = await this.db
        .prepare(
          `SELECT message, created_at
          FROM conversation_history
          WHERE session_id = ?
          ORDER BY created_at DESC
          LIMIT 1`
        )
        .bind(sessionId)
        .first();

      // Get common intents
      const intentsResult = await this.db
        .prepare(
          `SELECT intent, COUNT(*) as count
          FROM conversation_history
          WHERE session_id = ? AND intent IS NOT NULL
          GROUP BY intent
          ORDER BY count DESC
          LIMIT 3`
        )
        .bind(sessionId)
        .all();

      // Get sentiment trend
      const sentimentResult = await this.db
        .prepare(
          `SELECT sentiment, COUNT(*) as count
          FROM conversation_history
          WHERE session_id = ? AND sentiment IS NOT NULL
          GROUP BY sentiment
          ORDER BY count DESC
          LIMIT 1`
        )
        .bind(sessionId)
        .first();

      return {
        totalMessages: statsResult?.totalMessages || 0,
        firstMessage: messagesResult?.message || null,
        lastMessage: lastMessageResult?.message || null,
        commonIntents: (intentsResult.results || []).map(
          (row: any) => row.intent
        ),
        avgConfidence: statsResult?.avgConfidence || 0,
        sentimentTrend: sentimentResult?.sentiment || 'neutral',
      };
    } catch (error) {
      console.error('Error getting conversation summary:', error);
      return {
        totalMessages: 0,
        firstMessage: null,
        lastMessage: null,
        commonIntents: [],
        avgConfidence: 0,
        sentimentTrend: 'neutral',
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.db
        .prepare('SELECT COUNT(*) as count FROM conversation_history LIMIT 1')
        .first();
      return result !== null;
    } catch (error) {
      console.error('Conversation memory health check failed:', error);
      return false;
    }
  }
}

export default ConversationMemory;