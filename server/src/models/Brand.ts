import { query } from '../config/database.js';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
}

export const getAllBrands = async (): Promise<Brand[]> => {
  const result = await query(`
    SELECT id, name, slug, logo_url as "logoUrl"
    FROM brands
    ORDER BY name
  `);
  
  return result.rows;
};

export const getBrandBySlug = async (slug: string): Promise<Brand | null> => {
  const result = await query(
    `SELECT id, name, slug, logo_url as "logoUrl"
     FROM brands
     WHERE slug = $1`,
    [slug]
  );
  
  return result.rows.length > 0 ? result.rows[0] : null;
};
