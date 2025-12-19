/**
 * User Profiling Module
 * Manages user profiles, behavior tracking, and lead scoring
 */

import type {
  UserProfile,
  UserBehavior,
  LeadScore,
  D1Database,
} from '../types';

export class UserProfiling {
  private db: D1Database;

  constructor(db: D1Database) {
    this.db = db;
  }

  /**
   * Create or update user profile
   */
  async upsertProfile(profile: Partial<UserProfile>): Promise<number> {
    try {
      // Check if profile exists
      const existing = await this.db
        .prepare('SELECT id FROM user_profiles WHERE session_id = ?')
        .bind(profile.sessionId)
        .first();

      if (existing) {
        // Update existing profile
        const result = await this.db
          .prepare(
            `UPDATE user_profiles SET
              user_id = COALESCE(?, user_id),
              name = COALESCE(?, name),
              email = COALESCE(?, email),
              phone = COALESCE(?, phone),
              preferred_genres = COALESCE(?, preferred_genres),
              preferred_services = COALESCE(?, preferred_services),
              budget_range = COALESCE(?, budget_range),
              timeline = COALESCE(?, timeline),
              location = COALESCE(?, location),
              total_messages = COALESCE(?, total_messages),
              total_sessions = COALESCE(?, total_sessions),
              avg_session_duration = COALESCE(?, avg_session_duration),
              last_intent = COALESCE(?, last_intent),
              common_intents = COALESCE(?, common_intents),
              engagement_score = COALESCE(?, engagement_score),
              conversion_stage = COALESCE(?, conversion_stage),
              is_qualified_lead = COALESCE(?, is_qualified_lead),
              lead_score = COALESCE(?, lead_score),
              contact_preference = COALESCE(?, contact_preference),
              best_contact_time = COALESCE(?, best_contact_time),
              timezone = COALESCE(?, timezone),
              last_seen = CURRENT_TIMESTAMP,
              ip_address = COALESCE(?, ip_address),
              user_agent = COALESCE(?, user_agent),
              referer = COALESCE(?, referer),
              is_active = COALESCE(?, is_active),
              notes = COALESCE(?, notes)
            WHERE session_id = ?`
          )
          .bind(
            profile.userId || null,
            profile.name || null,
            profile.email || null,
            profile.phone || null,
            profile.preferredGenres
              ? JSON.stringify(profile.preferredGenres)
              : null,
            profile.preferredServices
              ? JSON.stringify(profile.preferredServices)
              : null,
            profile.budgetRange || null,
            profile.timeline || null,
            profile.location || null,
            profile.totalMessages || null,
            profile.totalSessions || null,
            profile.avgSessionDuration || null,
            profile.lastIntent || null,
            profile.commonIntents
              ? JSON.stringify(profile.commonIntents)
              : null,
            profile.engagementScore || null,
            profile.conversionStage || null,
            profile.isQualifiedLead !== undefined ? profile.isQualifiedLead : null,
            profile.leadScore || null,
            profile.contactPreference || null,
            profile.bestContactTime || null,
            profile.timezone || null,
            profile.ipAddress || null,
            profile.userAgent || null,
            profile.referer || null,
            profile.isActive !== undefined ? profile.isActive : null,
            profile.notes || null,
            profile.sessionId
          )
          .run();

        return existing.id;
      } else {
        // Insert new profile
        const result = await this.db
          .prepare(
            `INSERT INTO user_profiles 
            (session_id, user_id, name, email, phone, preferred_genres, preferred_services, 
             budget_range, timeline, location, total_messages, total_sessions, 
             avg_session_duration, last_intent, common_intents, engagement_score, 
             conversion_stage, is_qualified_lead, lead_score, contact_preference, 
             best_contact_time, timezone, ip_address, user_agent, referer, is_active, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          )
          .bind(
            profile.sessionId,
            profile.userId || null,
            profile.name || null,
            profile.email || null,
            profile.phone || null,
            profile.preferredGenres
              ? JSON.stringify(profile.preferredGenres)
              : null,
            profile.preferredServices
              ? JSON.stringify(profile.preferredServices)
              : null,
            profile.budgetRange || null,
            profile.timeline || null,
            profile.location || null,
            profile.totalMessages || 0,
            profile.totalSessions || 1,
            profile.avgSessionDuration || 0,
            profile.lastIntent || null,
            profile.commonIntents
              ? JSON.stringify(profile.commonIntents)
              : null,
            profile.engagementScore || 0,
            profile.conversionStage || 'awareness',
            profile.isQualifiedLead || false,
            profile.leadScore || 0,
            profile.contactPreference || null,
            profile.bestContactTime || null,
            profile.timezone || null,
            profile.ipAddress || null,
            profile.userAgent || null,
            profile.referer || null,
            profile.isActive !== undefined ? profile.isActive : true,
            profile.notes || null
          )
          .run();

        return result.meta.last_row_id || 0;
      }
    } catch (error) {
      console.error('Error upserting user profile:', error);
      throw new Error('Failed to upsert user profile');
    }
  }

  /**
   * Get user profile by session ID
   */
  async getProfile(sessionId: string): Promise<UserProfile | null> {
    try {
      const result = await this.db
        .prepare(
          `SELECT 
            id,
            session_id as sessionId,
            user_id as userId,
            name,
            email,
            phone,
            preferred_genres as preferredGenres,
            preferred_services as preferredServices,
            budget_range as budgetRange,
            timeline,
            location,
            total_messages as totalMessages,
            total_sessions as totalSessions,
            avg_session_duration as avgSessionDuration,
            last_intent as lastIntent,
            common_intents as commonIntents,
            engagement_score as engagementScore,
            conversion_stage as conversionStage,
            is_qualified_lead as isQualifiedLead,
            lead_score as leadScore,
            contact_preference as contactPreference,
            best_contact_time as bestContactTime,
            timezone,
            first_seen as firstSeen,
            last_seen as lastSeen,
            ip_address as ipAddress,
            user_agent as userAgent,
            referer,
            is_active as isActive,
            is_blocked as isBlocked,
            notes
          FROM user_profiles
          WHERE session_id = ?`
        )
        .bind(sessionId)
        .first();

      if (!result) return null;

      return {
        id: result.id,
        sessionId: result.sessionId,
        userId: result.userId,
        name: result.name,
        email: result.email,
        phone: result.phone,
        preferredGenres: result.preferredGenres
          ? JSON.parse(result.preferredGenres)
          : [],
        preferredServices: result.preferredServices
          ? JSON.parse(result.preferredServices)
          : [],
        budgetRange: result.budgetRange,
        timeline: result.timeline,
        location: result.location,
        totalMessages: result.totalMessages,
        totalSessions: result.totalSessions,
        avgSessionDuration: result.avgSessionDuration,
        lastIntent: result.lastIntent,
        commonIntents: result.commonIntents
          ? JSON.parse(result.commonIntents)
          : [],
        engagementScore: result.engagementScore,
        conversionStage: result.conversionStage,
        isQualifiedLead: result.isQualifiedLead === 1,
        leadScore: result.leadScore,
        contactPreference: result.contactPreference,
        bestContactTime: result.bestContactTime,
        timezone: result.timezone,
        firstSeen: result.firstSeen,
        lastSeen: result.lastSeen,
        ipAddress: result.ipAddress,
        userAgent: result.userAgent,
        referer: result.referer,
        isActive: result.isActive === 1,
        isBlocked: result.isBlocked === 1,
        notes: result.notes,
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  /**
   * Update user behavior metrics
   */
  async updateBehaviorMetrics(
    sessionId: string,
    behavior: UserBehavior
  ): Promise<void> {
    try {
      const profile = await this.getProfile(sessionId);
      if (!profile) {
        // Create new profile with behavior data
        await this.upsertProfile({
          sessionId,
          totalMessages: behavior.messageCount || 1,
          totalSessions: 1,
          avgSessionDuration: behavior.sessionDuration || 0,
          lastIntent: behavior.lastIntent,
          engagementScore: this.calculateEngagementScore(behavior),
        });
        return;
      }

      // Update existing profile
      const newTotalMessages = profile.totalMessages + (behavior.messageCount || 1);
      const newAvgDuration = Math.round(
        (profile.avgSessionDuration * profile.totalSessions +
          (behavior.sessionDuration || 0)) /
          (profile.totalSessions + 1)
      );

      await this.upsertProfile({
        sessionId,
        totalMessages: newTotalMessages,
        totalSessions: profile.totalSessions + 1,
        avgSessionDuration: newAvgDuration,
        lastIntent: behavior.lastIntent || profile.lastIntent,
        engagementScore: this.calculateEngagementScore({
          ...behavior,
          messageCount: newTotalMessages,
          sessionDuration: newAvgDuration,
        }),
      });
    } catch (error) {
      console.error('Error updating behavior metrics:', error);
    }
  }

  /**
   * Calculate engagement score (0-100)
   */
  private calculateEngagementScore(behavior: UserBehavior): number {
    let score = 0;

    // Message count (0-30 points)
    const messageCount = behavior.messageCount || 0;
    score += Math.min(messageCount * 3, 30);

    // Session duration (0-25 points)
    const durationMinutes = (behavior.sessionDuration || 0) / 60;
    score += Math.min(durationMinutes * 5, 25);

    // Intent diversity (0-20 points)
    const intentCount = behavior.intentCount || 0;
    score += Math.min(intentCount * 4, 20);

    // Positive sentiment (0-15 points)
    if (behavior.sentimentScore) {
      score += behavior.sentimentScore * 15;
    }

    // Return rate (0-10 points)
    const returnRate = behavior.returnRate || 0;
    score += returnRate * 10;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calculate lead score (0-100)
   */
  async calculateLeadScore(sessionId: string): Promise<LeadScore> {
    try {
      const profile = await this.getProfile(sessionId);
      if (!profile) {
        return {
          score: 0,
          factors: {},
          isQualified: false,
          confidence: 0,
        };
      }

      const factors: Record<string, number> = {};
      let totalScore = 0;

      // Contact information provided (0-25 points)
      if (profile.email) factors.hasEmail = 15;
      if (profile.phone) factors.hasPhone = 10;
      totalScore += (factors.hasEmail || 0) + (factors.hasPhone || 0);

      // Budget specified (0-20 points)
      if (profile.budgetRange) {
        factors.hasBudget = 20;
        totalScore += 20;
      }

      // Timeline specified (0-15 points)
      if (profile.timeline) {
        factors.hasTimeline = 15;
        totalScore += 15;
      }

      // Service interest (0-15 points)
      if (profile.preferredServices && profile.preferredServices.length > 0) {
        factors.hasServiceInterest = 15;
        totalScore += 15;
      }

      // Engagement level (0-15 points)
      factors.engagement = Math.round(profile.engagementScore * 0.15);
      totalScore += factors.engagement;

      // Conversion stage (0-10 points)
      const stageScores: Record<string, number> = {
        awareness: 2,
        consideration: 5,
        decision: 8,
        action: 10,
      };
      factors.conversionStage = stageScores[profile.conversionStage] || 0;
      totalScore += factors.conversionStage;

      // Calculate confidence based on data completeness
      const dataPoints = [
        profile.email,
        profile.phone,
        profile.budgetRange,
        profile.timeline,
        profile.preferredServices?.length,
        profile.location,
      ].filter(Boolean).length;
      const confidence = Math.min(dataPoints / 6, 1);

      // Determine if qualified (score >= 60 and has contact info)
      const isQualified =
        totalScore >= 60 && (!!profile.email || !!profile.phone);

      // Update profile with new lead score
      await this.upsertProfile({
        sessionId,
        leadScore: totalScore,
        isQualifiedLead: isQualified,
      });

      return {
        score: Math.min(totalScore, 100),
        factors,
        isQualified,
        confidence,
      };
    } catch (error) {
      console.error('Error calculating lead score:', error);
      return {
        score: 0,
        factors: {},
        isQualified: false,
        confidence: 0,
      };
    }
  }

  /**
   * Get qualified leads
   */
  async getQualifiedLeads(limit: number = 50): Promise<UserProfile[]> {
    try {
      const result = await this.db
        .prepare(
          `SELECT 
            id,
            session_id as sessionId,
            user_id as userId,
            name,
            email,
            phone,
            preferred_genres as preferredGenres,
            preferred_services as preferredServices,
            budget_range as budgetRange,
            timeline,
            location,
            engagement_score as engagementScore,
            conversion_stage as conversionStage,
            lead_score as leadScore,
            last_seen as lastSeen
          FROM user_profiles
          WHERE is_qualified_lead = 1
            AND is_active = 1
            AND (email IS NOT NULL OR phone IS NOT NULL)
          ORDER BY lead_score DESC, last_seen DESC
          LIMIT ?`
        )
        .bind(limit)
        .all();

      return (result.results || []).map((row: any) => ({
        id: row.id,
        sessionId: row.sessionId,
        userId: row.userId,
        name: row.name,
        email: row.email,
        phone: row.phone,
        preferredGenres: row.preferredGenres
          ? JSON.parse(row.preferredGenres)
          : [],
        preferredServices: row.preferredServices
          ? JSON.parse(row.preferredServices)
          : [],
        budgetRange: row.budgetRange,
        timeline: row.timeline,
        location: row.location,
        engagementScore: row.engagementScore,
        conversionStage: row.conversionStage,
        leadScore: row.leadScore,
        lastSeen: row.lastSeen,
      }));
    } catch (error) {
      console.error('Error getting qualified leads:', error);
      return [];
    }
  }

  /**
   * Update conversion stage
   */
  async updateConversionStage(
    sessionId: string,
    stage: 'awareness' | 'consideration' | 'decision' | 'action'
  ): Promise<void> {
    try {
      await this.upsertProfile({
        sessionId,
        conversionStage: stage,
      });

      // Recalculate lead score after stage update
      await this.calculateLeadScore(sessionId);
    } catch (error) {
      console.error('Error updating conversion stage:', error);
    }
  }

  /**
   * Track user preferences from conversation
   */
  async trackPreferences(
    sessionId: string,
    preferences: {
      genres?: string[];
      services?: string[];
      budget?: string;
      timeline?: string;
      location?: string;
    }
  ): Promise<void> {
    try {
      const profile = await this.getProfile(sessionId);

      // Merge new preferences with existing ones
      const updatedGenres = preferences.genres
        ? [
            ...new Set([
              ...(profile?.preferredGenres || []),
              ...preferences.genres,
            ]),
          ]
        : profile?.preferredGenres;

      const updatedServices = preferences.services
        ? [
            ...new Set([
              ...(profile?.preferredServices || []),
              ...preferences.services,
            ]),
          ]
        : profile?.preferredServices;

      await this.upsertProfile({
        sessionId,
        preferredGenres: updatedGenres,
        preferredServices: updatedServices,
        budgetRange: preferences.budget || profile?.budgetRange,
        timeline: preferences.timeline || profile?.timeline,
        location: preferences.location || profile?.location,
      });

      // Recalculate lead score after preference update
      await this.calculateLeadScore(sessionId);
    } catch (error) {
      console.error('Error tracking preferences:', error);
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    qualifiedLeads: number;
    avgEngagementScore: number;
    conversionStageDistribution: Record<string, number>;
  }> {
    try {
      const statsResult = await this.db
        .prepare(
          `SELECT 
            COUNT(*) as totalUsers,
            SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as activeUsers,
            SUM(CASE WHEN is_qualified_lead = 1 THEN 1 ELSE 0 END) as qualifiedLeads,
            AVG(engagement_score) as avgEngagementScore
          FROM user_profiles`
        )
        .first();

      const stageResult = await this.db
        .prepare(
          `SELECT 
            conversion_stage,
            COUNT(*) as count
          FROM user_profiles
          GROUP BY conversion_stage`
        )
        .all();

      const conversionStageDistribution: Record<string, number> = {};
      (stageResult.results || []).forEach((row: any) => {
        conversionStageDistribution[row.conversion_stage] = row.count;
      });

      return {
        totalUsers: statsResult?.totalUsers || 0,
        activeUsers: statsResult?.activeUsers || 0,
        qualifiedLeads: statsResult?.qualifiedLeads || 0,
        avgEngagementScore: statsResult?.avgEngagementScore || 0,
        conversionStageDistribution,
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        qualifiedLeads: 0,
        avgEngagementScore: 0,
        conversionStageDistribution: {},
      };
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.db
        .prepare('SELECT COUNT(*) as count FROM user_profiles LIMIT 1')
        .first();
      return result !== null;
    } catch (error) {
      console.error('User profiling health check failed:', error);
      return false;
    }
  }
}

export default UserProfiling;