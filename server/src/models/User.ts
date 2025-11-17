import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  password?: string; // Not returned in queries
  firstName: string;
  lastName: string;
  role: 'user' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export interface UserPreferences {
  userId: string;
  priceAlerts: boolean;
  emailNotifications: boolean;
  analyticsOptIn: boolean;
}

class UserModel {
  /**
   * Create a new user
   */
  async create(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<User | null> {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    try {
      const result = await pool.query(
        `INSERT INTO users (email, password, first_name, last_name, role, is_active, email_verified)
         VALUES ($1, $2, $3, $4, 'user', true, false)
         RETURNING id, email, first_name as "firstName", last_name as "lastName", 
                   role, is_active as "isActive", email_verified as "emailVerified",
                   created_at as "createdAt", updated_at as "updatedAt"`,
        [email, hashedPassword, firstName, lastName]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await pool.query(
        `SELECT id, email, password, first_name as "firstName", last_name as "lastName",
                role, is_active as "isActive", email_verified as "emailVerified",
                created_at as "createdAt", updated_at as "updatedAt", 
                last_login_at as "lastLoginAt"
         FROM users 
         WHERE email = $1`,
        [email]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return null;
    }
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const result = await pool.query(
        `SELECT id, email, first_name as "firstName", last_name as "lastName",
                role, is_active as "isActive", email_verified as "emailVerified",
                created_at as "createdAt", updated_at as "updatedAt",
                last_login_at as "lastLoginAt"
         FROM users 
         WHERE id = $1`,
        [id]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return null;
    }
  }

  /**
   * Verify password
   */
  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Update last login time
   */
  async updateLastLogin(userId: string): Promise<void> {
    try {
      await pool.query(
        `UPDATE users SET last_login_at = NOW() WHERE id = $1`,
        [userId]
      );
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO user_preferences (user_id, price_alerts, email_notifications, analytics_opt_in)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (user_id)
         DO UPDATE SET 
           price_alerts = COALESCE($2, user_preferences.price_alerts),
           email_notifications = COALESCE($3, user_preferences.email_notifications),
           analytics_opt_in = COALESCE($4, user_preferences.analytics_opt_in)`,
        [
          userId,
          preferences.priceAlerts ?? null,
          preferences.emailNotifications ?? null,
          preferences.analyticsOptIn ?? null
        ]
      );
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const result = await pool.query(
        `SELECT user_id as "userId", price_alerts as "priceAlerts",
                email_notifications as "emailNotifications", 
                analytics_opt_in as "analyticsOptIn"
         FROM user_preferences 
         WHERE user_id = $1`,
        [userId]
      );
      
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }
}

export default new UserModel();
