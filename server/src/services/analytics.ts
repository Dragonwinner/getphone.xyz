import pool from '../config/database.js';

export interface AnalyticsEvent {
  id: string;
  eventType: string;
  userId?: string;
  sessionId: string;
  data: Record<string, any>;
  timestamp: Date;
}

/**
 * Analytics Service
 * Tracks user events and generates insights
 */
class AnalyticsService {
  /**
   * Track an event
   */
  async trackEvent(
    eventType: string,
    sessionId: string,
    data: Record<string, any> = {},
    userId?: string
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO analytics_events (event_type, user_id, session_id, data, timestamp)
         VALUES ($1, $2, $3, $4, NOW())`,
        [eventType, userId || null, sessionId, JSON.stringify(data)]
      );
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  /**
   * Track page view
   */
  async trackPageView(
    sessionId: string,
    page: string,
    userId?: string
  ): Promise<void> {
    await this.trackEvent('page_view', sessionId, { page }, userId);
  }

  /**
   * Track phone view
   */
  async trackPhoneView(
    sessionId: string,
    phoneId: string,
    userId?: string
  ): Promise<void> {
    await this.trackEvent('phone_view', sessionId, { phoneId }, userId);
  }

  /**
   * Track comparison
   */
  async trackComparison(
    sessionId: string,
    phoneIds: string[],
    userId?: string
  ): Promise<void> {
    await this.trackEvent('comparison', sessionId, { phoneIds }, userId);
  }

  /**
   * Track affiliate click
   */
  async trackAffiliateClick(
    sessionId: string,
    phoneId: string,
    userId?: string
  ): Promise<void> {
    await this.trackEvent('affiliate_click', sessionId, { phoneId }, userId);
  }

  /**
   * Track search
   */
  async trackSearch(
    sessionId: string,
    query: string,
    resultsCount: number,
    userId?: string
  ): Promise<void> {
    await this.trackEvent('search', sessionId, { query, resultsCount }, userId);
  }

  /**
   * Get analytics summary
   */
  async getSummary(startDate: Date, endDate: Date): Promise<any> {
    try {
      const [pageViews, phoneViews, comparisons, affiliateClicks, searches] = await Promise.all([
        pool.query(
          `SELECT COUNT(*) FROM analytics_events 
           WHERE event_type = 'page_view' AND timestamp >= $1 AND timestamp <= $2`,
          [startDate, endDate]
        ),
        pool.query(
          `SELECT COUNT(*) FROM analytics_events 
           WHERE event_type = 'phone_view' AND timestamp >= $1 AND timestamp <= $2`,
          [startDate, endDate]
        ),
        pool.query(
          `SELECT COUNT(*) FROM analytics_events 
           WHERE event_type = 'comparison' AND timestamp >= $1 AND timestamp <= $2`,
          [startDate, endDate]
        ),
        pool.query(
          `SELECT COUNT(*) FROM analytics_events 
           WHERE event_type = 'affiliate_click' AND timestamp >= $1 AND timestamp <= $2`,
          [startDate, endDate]
        ),
        pool.query(
          `SELECT COUNT(*) FROM analytics_events 
           WHERE event_type = 'search' AND timestamp >= $1 AND timestamp <= $2`,
          [startDate, endDate]
        )
      ]);

      return {
        pageViews: parseInt(pageViews.rows[0].count),
        phoneViews: parseInt(phoneViews.rows[0].count),
        comparisons: parseInt(comparisons.rows[0].count),
        affiliateClicks: parseInt(affiliateClicks.rows[0].count),
        searches: parseInt(searches.rows[0].count)
      };
    } catch (error) {
      console.error('Error getting analytics summary:', error);
      return null;
    }
  }

  /**
   * Get top viewed phones
   */
  async getTopViewedPhones(limit: number = 10): Promise<any[]> {
    try {
      const result = await pool.query(
        `SELECT 
           (data->>'phoneId') as phone_id,
           COUNT(*) as view_count
         FROM analytics_events
         WHERE event_type = 'phone_view' 
           AND timestamp >= NOW() - INTERVAL '30 days'
         GROUP BY (data->>'phoneId')
         ORDER BY view_count DESC
         LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting top viewed phones:', error);
      return [];
    }
  }

  /**
   * Get conversion rate (affiliate clicks / phone views)
   */
  async getConversionRate(phoneId?: string): Promise<number> {
    try {
      let phoneViewsQuery = `SELECT COUNT(*) FROM analytics_events WHERE event_type = 'phone_view'`;
      let affiliateClicksQuery = `SELECT COUNT(*) FROM analytics_events WHERE event_type = 'affiliate_click'`;
      const params: any[] = [];

      if (phoneId) {
        phoneViewsQuery += ` AND data->>'phoneId' = $1`;
        affiliateClicksQuery += ` AND data->>'phoneId' = $1`;
        params.push(phoneId);
      }

      const [views, clicks] = await Promise.all([
        pool.query(phoneViewsQuery, params),
        pool.query(affiliateClicksQuery, params)
      ]);

      const viewCount = parseInt(views.rows[0].count);
      const clickCount = parseInt(clicks.rows[0].count);

      return viewCount > 0 ? (clickCount / viewCount) * 100 : 0;
    } catch (error) {
      console.error('Error calculating conversion rate:', error);
      return 0;
    }
  }
}

export default new AnalyticsService();
