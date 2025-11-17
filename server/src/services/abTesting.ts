import pool from '../config/database.js';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  variants: string[];
  isActive: boolean;
  startDate: Date;
  endDate?: Date;
}

export interface VariantAssignment {
  experimentId: string;
  sessionId: string;
  variant: string;
  assignedAt: Date;
}

/**
 * A/B Testing Service
 * Manages experiments and variant assignments
 */
class ABTestingService {
  /**
   * Create a new experiment
   */
  async createExperiment(
    name: string,
    description: string,
    variants: string[]
  ): Promise<Experiment | null> {
    try {
      const result = await pool.query(
        `INSERT INTO experiments (name, description, variants, is_active, start_date)
         VALUES ($1, $2, $3, true, NOW())
         RETURNING id, name, description, variants, is_active as "isActive",
                   start_date as "startDate", end_date as "endDate"`,
        [name, description, JSON.stringify(variants)]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error creating experiment:', error);
      return null;
    }
  }

  /**
   * Get active experiments
   */
  async getActiveExperiments(): Promise<Experiment[]> {
    try {
      const result = await pool.query(
        `SELECT id, name, description, variants, is_active as "isActive",
                start_date as "startDate", end_date as "endDate"
         FROM experiments
         WHERE is_active = true
         ORDER BY start_date DESC`
      );
      
      return result.rows.map(row => ({
        ...row,
        variants: JSON.parse(row.variants)
      }));
    } catch (error) {
      console.error('Error getting active experiments:', error);
      return [];
    }
  }

  /**
   * Assign variant to session
   * Uses consistent hashing for stable assignments
   */
  async assignVariant(
    experimentId: string,
    sessionId: string
  ): Promise<string | null> {
    try {
      // Check if already assigned
      const existing = await pool.query(
        `SELECT variant FROM variant_assignments
         WHERE experiment_id = $1 AND session_id = $2`,
        [experimentId, sessionId]
      );

      if (existing.rows.length > 0) {
        return existing.rows[0].variant;
      }

      // Get experiment variants
      const expResult = await pool.query(
        `SELECT variants FROM experiments WHERE id = $1 AND is_active = true`,
        [experimentId]
      );

      if (expResult.rows.length === 0) {
        return null;
      }

      const variants = JSON.parse(expResult.rows[0].variants);
      
      // Use consistent hashing to assign variant
      const hash = this.hashString(sessionId + experimentId);
      const variantIndex = hash % variants.length;
      const variant = variants[variantIndex];

      // Store assignment
      await pool.query(
        `INSERT INTO variant_assignments (experiment_id, session_id, variant, assigned_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (experiment_id, session_id) DO NOTHING`,
        [experimentId, sessionId, variant]
      );

      return variant;
    } catch (error) {
      console.error('Error assigning variant:', error);
      return null;
    }
  }

  /**
   * Get variant for session
   */
  async getVariant(experimentId: string, sessionId: string): Promise<string | null> {
    try {
      const result = await pool.query(
        `SELECT variant FROM variant_assignments
         WHERE experiment_id = $1 AND session_id = $2`,
        [experimentId, sessionId]
      );

      if (result.rows.length > 0) {
        return result.rows[0].variant;
      }

      // Auto-assign if not assigned
      return this.assignVariant(experimentId, sessionId);
    } catch (error) {
      console.error('Error getting variant:', error);
      return null;
    }
  }

  /**
   * Track conversion for variant
   */
  async trackConversion(
    experimentId: string,
    sessionId: string,
    conversionType: string = 'default'
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO experiment_conversions (experiment_id, session_id, conversion_type, converted_at)
         VALUES ($1, $2, $3, NOW())`,
        [experimentId, sessionId, conversionType]
      );
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  }

  /**
   * Get experiment results
   */
  async getExperimentResults(experimentId: string): Promise<any> {
    try {
      const result = await pool.query(
        `SELECT 
           va.variant,
           COUNT(DISTINCT va.session_id) as participants,
           COUNT(DISTINCT ec.session_id) as conversions,
           ROUND(
             CAST(COUNT(DISTINCT ec.session_id) AS DECIMAL) / 
             NULLIF(COUNT(DISTINCT va.session_id), 0) * 100,
             2
           ) as conversion_rate
         FROM variant_assignments va
         LEFT JOIN experiment_conversions ec 
           ON va.experiment_id = ec.experiment_id 
           AND va.session_id = ec.session_id
         WHERE va.experiment_id = $1
         GROUP BY va.variant
         ORDER BY va.variant`,
        [experimentId]
      );

      return result.rows;
    } catch (error) {
      console.error('Error getting experiment results:', error);
      return [];
    }
  }

  /**
   * End experiment
   */
  async endExperiment(experimentId: string): Promise<void> {
    try {
      await pool.query(
        `UPDATE experiments 
         SET is_active = false, end_date = NOW()
         WHERE id = $1`,
        [experimentId]
      );
    } catch (error) {
      console.error('Error ending experiment:', error);
    }
  }

  /**
   * Simple string hash function for consistent variant assignment
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
}

export default new ABTestingService();
