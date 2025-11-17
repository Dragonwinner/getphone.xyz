import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  from: string;
}

/**
 * Email Service
 * Handles sending various types of emails
 */
class EmailService {
  private transporter: Transporter | null = null;
  private config: EmailConfig;

  constructor() {
    this.config = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || ''
      },
      from: process.env.SMTP_FROM || 'noreply@getphone.xyz'
    };

    if (this.config.auth.user && this.config.auth.pass) {
      this.initializeTransporter();
    }
  }

  /**
   * Initialize email transporter
   */
  private initializeTransporter(): void {
    this.transporter = nodemailer.createTransport({
      host: this.config.host,
      port: this.config.port,
      secure: this.config.secure,
      auth: this.config.auth
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not configured');
      return false;
    }

    try {
      await this.transporter.sendMail({
        from: this.config.from,
        to,
        subject: 'Welcome to GetPhone.xyz!',
        html: `
          <h1>Welcome to GetPhone.xyz, ${firstName}!</h1>
          <p>Thank you for joining our phone comparison platform.</p>
          <p>You can now:</p>
          <ul>
            <li>Compare phones side by side</li>
            <li>Track prices and get alerts</li>
            <li>Save your favorite phones</li>
          </ul>
          <p>Happy phone hunting!</p>
        `
      });
      
      return true;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Send price alert email
   */
  async sendPriceAlert(
    to: string,
    alertData: { phoneId: string; alertPrice: number; currentPrice: number }
  ): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not configured');
      return false;
    }

    try {
      const priceDrop = alertData.alertPrice - alertData.currentPrice;
      const percentDrop = ((priceDrop / alertData.alertPrice) * 100).toFixed(1);

      await this.transporter.sendMail({
        from: this.config.from,
        to,
        subject: '🎉 Price Alert: Your Target Price Reached!',
        html: `
          <h1>Price Alert Triggered!</h1>
          <p>Great news! The price has dropped for a phone you're tracking.</p>
          <div style="background: #f0f0f0; padding: 20px; margin: 20px 0; border-radius: 8px;">
            <p><strong>Target Price:</strong> $${alertData.alertPrice}</p>
            <p><strong>Current Price:</strong> $${alertData.currentPrice}</p>
            <p><strong>You Save:</strong> $${priceDrop.toFixed(2)} (${percentDrop}%)</p>
          </div>
          <p>
            <a href="${process.env.FRONTEND_URL}/phones/${alertData.phoneId}" 
               style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              View Phone Details
            </a>
          </p>
        `
      });
      
      return true;
    } catch (error) {
      console.error('Error sending price alert email:', error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, resetToken: string): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not configured');
      return false;
    }

    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      await this.transporter.sendMail({
        from: this.config.from,
        to,
        subject: 'Password Reset Request',
        html: `
          <h1>Password Reset Request</h1>
          <p>You requested to reset your password. Click the link below to proceed:</p>
          <p>
            <a href="${resetUrl}" 
               style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
      
      return true;
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return false;
    }
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(to: string, verificationToken: string): Promise<boolean> {
    if (!this.transporter) {
      console.warn('Email service not configured');
      return false;
    }

    try {
      const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      await this.transporter.sendMail({
        from: this.config.from,
        to,
        subject: 'Verify Your Email Address',
        html: `
          <h1>Email Verification</h1>
          <p>Please verify your email address by clicking the link below:</p>
          <p>
            <a href="${verifyUrl}" 
               style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Verify Email
            </a>
          </p>
          <p>This link will expire in 24 hours.</p>
        `
      });
      
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      return false;
    }
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Email service connection test failed:', error);
      return false;
    }
  }
}

export default new EmailService();
