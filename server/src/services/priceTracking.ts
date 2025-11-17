import cron from 'node-cron';
import pool from '../config/database.js';
import PriceTrackingModel from '../models/PriceTracking.js';
import amazonProductAPI from './amazonProductAPI.js';
import emailService from './emailService.js';

/**
 * Price Tracking Service
 * Handles scheduled price checks and alert notifications
 */
class PriceTrackingService {
  private isRunning = false;

  /**
   * Start the price tracking cron job
   * Runs every 6 hours by default
   */
  startPriceTracking(): void {
    // Run every 6 hours at minute 0
    cron.schedule('0 */6 * * *', async () => {
      if (this.isRunning) {
        console.log('Price tracking already running, skipping...');
        return;
      }

      this.isRunning = true;
      console.log('Starting price tracking job...');

      try {
        await this.updatePrices();
        await this.checkAndNotifyAlerts();
      } catch (error) {
        console.error('Error in price tracking job:', error);
      } finally {
        this.isRunning = false;
      }
    });

    console.log('Price tracking cron job started');
  }

  /**
   * Update prices from Amazon API
   */
  private async updatePrices(): Promise<void> {
    try {
      // Get all phones with ASINs
      const result = await pool.query(
        `SELECT id, asin, price FROM phones WHERE asin IS NOT NULL AND asin != ''`
      );

      const phones = result.rows;
      console.log(`Updating prices for ${phones.length} phones...`);

      for (const phone of phones) {
        try {
          // Fetch latest price from Amazon
          const productDetails = await amazonProductAPI.getProductDetails(phone.asin);
          
          if (productDetails && productDetails.price) {
            const newPrice = productDetails.price;
            const oldPrice = parseFloat(phone.price);

            // Only update if price changed
            if (newPrice !== oldPrice) {
              await pool.query(
                `UPDATE phones SET price = $1, updated_at = NOW() WHERE id = $2`,
                [newPrice, phone.id]
              );

              // Record price history
              await PriceTrackingModel.recordPrice(phone.id, newPrice, 'amazon');

              console.log(`Updated price for phone ${phone.id}: ${oldPrice} -> ${newPrice}`);
            }
          }

          // Add delay to respect API rate limits
          await this.delay(1000);
        } catch (error) {
          console.error(`Error updating price for phone ${phone.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in updatePrices:', error);
    }
  }

  /**
   * Check price alerts and send notifications
   */
  private async checkAndNotifyAlerts(): Promise<void> {
    try {
      const triggeredAlerts = await PriceTrackingModel.checkPriceAlerts();
      
      console.log(`Found ${triggeredAlerts.length} triggered price alerts`);

      for (const alert of triggeredAlerts) {
        try {
          // Send email notification
          await emailService.sendPriceAlert(
            (alert as any).email,
            {
              phoneId: alert.phoneId,
              alertPrice: alert.alertPrice,
              currentPrice: alert.currentPrice
            }
          );

          console.log(`Sent price alert notification to user ${alert.userId}`);
        } catch (error) {
          console.error(`Error sending alert for user ${alert.userId}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in checkAndNotifyAlerts:', error);
    }
  }

  /**
   * Manually trigger price update for a single phone
   */
  async updatePhonePrice(phoneId: string): Promise<boolean> {
    try {
      const result = await pool.query(
        `SELECT id, asin, price FROM phones WHERE id = $1`,
        [phoneId]
      );

      const phone = result.rows[0];
      if (!phone || !phone.asin) {
        return false;
      }

      const productDetails = await amazonProductAPI.getProductDetails(phone.asin);
      
      if (productDetails && productDetails.price) {
        await pool.query(
          `UPDATE phones SET price = $1, updated_at = NOW() WHERE id = $2`,
          [productDetails.price, phoneId]
        );

        await PriceTrackingModel.recordPrice(phoneId, productDetails.price, 'amazon');
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error updating phone price ${phoneId}:`, error);
      return false;
    }
  }

  /**
   * Helper to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new PriceTrackingService();
