import { Request, Response } from 'express';
import pool from '../config/database.js';

/**
 * Get admin dashboard statistics
 */
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [phonesCount, usersCount, brandsCount, categoriesCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM phones'),
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM brands'),
      pool.query('SELECT COUNT(*) FROM categories')
    ]);

    res.json({
      stats: {
        totalPhones: parseInt(phonesCount.rows[0].count),
        totalUsers: parseInt(usersCount.rows[0].count),
        totalBrands: parseInt(brandsCount.rows[0].count),
        totalCategories: parseInt(categoriesCount.rows[0].count)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      `SELECT id, email, first_name as "firstName", last_name as "lastName",
              role, is_active as "isActive", email_verified as "emailVerified",
              created_at as "createdAt", last_login_at as "lastLoginAt"
       FROM users
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    const totalUsers = parseInt(countResult.rows[0].count);

    res.json({
      users: result.rows,
      pagination: {
        page,
        limit,
        total: totalUsers,
        totalPages: Math.ceil(totalUsers / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * Update user status (admin only)
 */
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    await pool.query(
      'UPDATE users SET is_active = $1, updated_at = NOW() WHERE id = $2',
      [isActive, userId]
    );

    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

/**
 * Create a new phone (admin only)
 */
export const createPhone = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      slug,
      brandId,
      categoryId,
      description,
      price,
      amazonUrl,
      asin,
      imageUrl,
      specs
    } = req.body;

    const result = await pool.query(
      `INSERT INTO phones (name, slug, brand_id, category_id, description, price, 
                          amazon_url, asin, image_url, rating, review_count, 
                          in_stock, is_featured)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 0, 0, true, false)
       RETURNING *`,
      [name, slug, brandId, categoryId, description, price, amazonUrl, asin, imageUrl]
    );

    const phoneId = result.rows[0].id;

    // Insert specs if provided
    if (specs) {
      await pool.query(
        `INSERT INTO phone_specs (phone_id, display, processor, ram, storage, camera, battery, os)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [phoneId, specs.display, specs.processor, specs.ram, specs.storage, 
         specs.camera, specs.battery, specs.os]
      );
    }

    res.status(201).json({
      message: 'Phone created successfully',
      phone: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating phone:', error);
    res.status(500).json({ error: 'Failed to create phone' });
  }
};

/**
 * Update a phone (admin only)
 */
export const updatePhone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneId } = req.params;
    const {
      name,
      description,
      price,
      originalPrice,
      amazonUrl,
      asin,
      imageUrl,
      inStock,
      isFeatured
    } = req.body;

    await pool.query(
      `UPDATE phones 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           price = COALESCE($3, price),
           original_price = COALESCE($4, original_price),
           amazon_url = COALESCE($5, amazon_url),
           asin = COALESCE($6, asin),
           image_url = COALESCE($7, image_url),
           in_stock = COALESCE($8, in_stock),
           is_featured = COALESCE($9, is_featured),
           updated_at = NOW()
       WHERE id = $10`,
      [name, description, price, originalPrice, amazonUrl, asin, imageUrl, 
       inStock, isFeatured, phoneId]
    );

    res.json({ message: 'Phone updated successfully' });
  } catch (error) {
    console.error('Error updating phone:', error);
    res.status(500).json({ error: 'Failed to update phone' });
  }
};

/**
 * Delete a phone (admin only)
 */
export const deletePhone = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phoneId } = req.params;

    await pool.query('DELETE FROM phones WHERE id = $1', [phoneId]);

    res.json({ message: 'Phone deleted successfully' });
  } catch (error) {
    console.error('Error deleting phone:', error);
    res.status(500).json({ error: 'Failed to delete phone' });
  }
};
