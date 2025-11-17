import pool from '../config/database.js';

export interface PriceHistory {
  id: string;
  phoneId: string;
  price: number;
  source: string;
  recordedAt: Date;
}

export interface PriceAlert {
  id: string;
  userId: string;
  phoneId: string;
  targetPrice: number;
  isActive: boolean;
  createdAt: Date;
}

class PriceTrackingModel {
  /**
   * Record price history
   */
  async recordPrice(phoneId: string, price: number, source: string = 'amazon'): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO price_history (phone_id, price, source, recorded_at)
         VALUES ($1, $2, $3, NOW())`,
        [phoneId, price, source]
      );
    } catch (error) {
      console.error('Error recording price:', error);
    }
  }

  /**
   * Get price history for a phone
   */
  async getPriceHistory(phoneId: string, days: number = 30): Promise<PriceHistory[]> {
    try {
      const result = await pool.query(
        `SELECT id, phone_id as "phoneId", price, source, recorded_at as "recordedAt"
         FROM price_history
         WHERE phone_id = $1 AND recorded_at >= NOW() - INTERVAL '${days} days'
         ORDER BY recorded_at DESC`,
        [phoneId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting price history:', error);
      return [];
    }
  }

  /**
   * Create price alert
   */
  async createAlert(userId: string, phoneId: string, targetPrice: number): Promise<PriceAlert | null> {
    try {
      const result = await pool.query(
        `INSERT INTO price_alerts (user_id, phone_id, target_price, is_active)
         VALUES ($1, $2, $3, true)
         RETURNING id, user_id as "userId", phone_id as "phoneId", 
                   target_price as "targetPrice", is_active as "isActive", 
                   created_at as "createdAt"`,
        [userId, phoneId, targetPrice]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error creating price alert:', error);
      return null;
    }
  }

  /**
   * Get user's price alerts
   */
  async getUserAlerts(userId: string): Promise<PriceAlert[]> {
    try {
      const result = await pool.query(
        `SELECT pa.id, pa.user_id as "userId", pa.phone_id as "phoneId",
                pa.target_price as "targetPrice", pa.is_active as "isActive",
                pa.created_at as "createdAt",
                p.name as "phoneName", p.price as "currentPrice"
         FROM price_alerts pa
         JOIN phones p ON pa.phone_id = p.id
         WHERE pa.user_id = $1
         ORDER BY pa.created_at DESC`,
        [userId]
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error getting user alerts:', error);
      return [];
    }
  }

  /**
   * Check and trigger alerts for price drops
   */
  async checkPriceAlerts(): Promise<Array<{ userId: string; phoneId: string; alertPrice: number; currentPrice: number }>> {
    try {
      const result = await pool.query(
        `SELECT pa.user_id as "userId", pa.phone_id as "phoneId",
                pa.target_price as "alertPrice", p.price as "currentPrice",
                u.email
         FROM price_alerts pa
         JOIN phones p ON pa.phone_id = p.id
         JOIN users u ON pa.user_id = u.id
         WHERE pa.is_active = true AND p.price <= pa.target_price`
      );
      
      return result.rows;
    } catch (error) {
      console.error('Error checking price alerts:', error);
      return [];
    }
  }

  /**
   * Deactivate an alert
   */
  async deactivateAlert(alertId: string): Promise<void> {
    try {
      await pool.query(
        `UPDATE price_alerts SET is_active = false WHERE id = $1`,
        [alertId]
      );
    } catch (error) {
      console.error('Error deactivating alert:', error);
    }
  }

  /**
   * Delete an alert
   */
  async deleteAlert(alertId: string, userId: string): Promise<void> {
    try {
      await pool.query(
        `DELETE FROM price_alerts WHERE id = $1 AND user_id = $2`,
        [alertId, userId]
      );
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  }
}

export default new PriceTrackingModel();
