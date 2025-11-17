import pool from '../config/database.js';
import { getPhoneBySlug } from '../models/Phone.js';
import { getAllBrands, getBrandBySlug } from '../models/Brand.js';
import { getAllCategories, getCategoryBySlug } from '../models/Category.js';
import UserModel from '../models/User.js';
import PriceTrackingModel from '../models/PriceTracking.js';
import analyticsService from '../services/analytics.js';
import { generateToken } from '../middleware/auth.js';

/**
 * GraphQL Resolvers
 */
export const resolvers = {
  // ===== Queries =====
  
  phone: async ({ id, slug }: { id?: string; slug?: string }) => {
    if (slug) {
      return getPhoneBySlug(slug);
    }
    if (id) {
      const result = await pool.query('SELECT * FROM phones WHERE id = $1', [id]);
      return result.rows[0] || null;
    }
    return null;
  },

  phones: async ({
    page = 1,
    limit = 20,
    brandId,
    categoryId,
    minPrice,
    maxPrice,
    search,
    sort
  }: any) => {
    const offset = (page - 1) * limit;
    let query = 'SELECT * FROM phones WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (brandId) {
      query += ` AND brand_id = $${paramIndex}`;
      params.push(brandId);
      paramIndex++;
    }

    if (categoryId) {
      query += ` AND category_id = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }

    if (minPrice) {
      query += ` AND price >= $${paramIndex}`;
      params.push(minPrice);
      paramIndex++;
    }

    if (maxPrice) {
      query += ` AND price <= $${paramIndex}`;
      params.push(maxPrice);
      paramIndex++;
    }

    if (search) {
      query += ` AND (name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const countQuery = query.replace('SELECT *', 'SELECT COUNT(*)');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    if (sort) {
      const sortMap: Record<string, string> = {
        'price_asc': 'price ASC',
        'price_desc': 'price DESC',
        'rating': 'rating DESC',
        'name': 'name ASC'
      };
      query += ` ORDER BY ${sortMap[sort] || 'created_at DESC'}`;
    } else {
      query += ' ORDER BY created_at DESC';
    }

    query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    return {
      phones: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  },

  comparePhones: async ({ ids }: { ids: string[] }) => {
    const result = await pool.query(
      'SELECT * FROM phones WHERE id = ANY($1)',
      [ids]
    );
    return result.rows;
  },

  brand: async ({ id, slug }: { id?: string; slug?: string }) => {
    if (slug) {
      return getBrandBySlug(slug);
    }
    // Brand findById not exposed, query directly
    if (id) {
      const result = await pool.query('SELECT * FROM brands WHERE id = $1', [id]);
      return result.rows[0] || null;
    }
    return null;
  },

  brands: async () => {
    return getAllBrands();
  },

  category: async ({ id, slug }: { id?: string; slug?: string }) => {
    if (slug) {
      return getCategoryBySlug(slug);
    }
    // Category findById not exposed, query directly
    if (id) {
      const result = await pool.query('SELECT * FROM categories WHERE id = $1', [id]);
      return result.rows[0] || null;
    }
    return null;
  },

  categories: async () => {
    return getAllCategories();
  },

  priceHistory: async ({ phoneId, days = 30 }: { phoneId: string; days?: number }) => {
    return PriceTrackingModel.getPriceHistory(phoneId, days);
  },

  me: async (_args: any, context: any) => {
    if (!context.user) {
      throw new Error('Not authenticated');
    }
    return UserModel.findById(context.user.id);
  },

  // ===== Mutations =====

  register: async ({
    email,
    password,
    firstName,
    lastName
  }: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    const user = await UserModel.create(email, password, firstName, lastName);
    if (!user) {
      throw new Error('Failed to create user');
    }

    const token = generateToken(user.id, user.email, user.role);

    return {
      token,
      user
    };
  },

  login: async ({ email, password }: { email: string; password: string }) => {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await UserModel.verifyPassword(password, user.password || '');
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account is inactive');
    }

    await UserModel.updateLastLogin(user.id);
    const token = generateToken(user.id, user.email, user.role);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt
      }
    };
  },

  createPriceAlert: async (
    { phoneId, targetPrice }: { phoneId: string; targetPrice: number },
    context: any
  ) => {
    if (!context.user) {
      throw new Error('Not authenticated');
    }

    const alert = await PriceTrackingModel.createAlert(
      context.user.id,
      phoneId,
      targetPrice
    );

    if (!alert) {
      throw new Error('Failed to create price alert');
    }

    return alert;
  },

  deletePriceAlert: async ({ alertId }: { alertId: string }, context: any) => {
    if (!context.user) {
      throw new Error('Not authenticated');
    }

    await PriceTrackingModel.deleteAlert(alertId, context.user.id);
    return true;
  },

  trackEvent: async ({
    eventType,
    sessionId,
    data
  }: {
    eventType: string;
    sessionId: string;
    data?: string;
  }) => {
    const eventData = data ? JSON.parse(data) : {};
    await analyticsService.trackEvent(eventType, sessionId, eventData);
    return true;
  }
};
