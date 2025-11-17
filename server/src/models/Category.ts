import { query } from '../config/database.js';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export const getAllCategories = async (): Promise<Category[]> => {
  const result = await query(`
    SELECT id, name, slug, description
    FROM categories
    ORDER BY name
  `);
  
  return result.rows;
};

export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  const result = await query(
    `SELECT id, name, slug, description
     FROM categories
     WHERE slug = $1`,
    [slug]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
};
