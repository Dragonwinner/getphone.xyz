import { query } from '../config/database.js';

export interface Phone {
  id: string;
  name: string;
  slug: string;
  brandId: string;
  categoryId: string;
  description: string;
  price: number;
  originalPrice?: number;
  amazonUrl: string;
  asin?: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  releaseDate?: string;
  inStock: boolean;
  isFeatured: boolean;
  specs?: {
    display?: string;
    processor?: string;
    ram?: string;
    storage?: string;
    camera?: string;
    battery?: string;
    os?: string;
  };
  features?: string[];
  brandName?: string;
  categoryName?: string;
}

export const getAllPhones = async (
  limit: number = 50,
  offset: number = 0,
  filters?: {
    brandId?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    inStock?: boolean;
    isFeatured?: boolean;
  },
  sortBy?: string,
  sortOrder: 'ASC' | 'DESC' = 'DESC'
): Promise<{ phones: Phone[]; total: number }> => {
  let whereConditions: string[] = [];
  let params: any[] = [];
  let paramIndex = 1;

  if (filters?.brandId) {
    whereConditions.push(`p.brand_id = $${paramIndex++}`);
    params.push(filters.brandId);
  }

  if (filters?.categoryId) {
    whereConditions.push(`p.category_id = $${paramIndex++}`);
    params.push(filters.categoryId);
  }

  if (filters?.minPrice !== undefined) {
    whereConditions.push(`p.price >= $${paramIndex++}`);
    params.push(filters.minPrice);
  }

  if (filters?.maxPrice !== undefined) {
    whereConditions.push(`p.price <= $${paramIndex++}`);
    params.push(filters.maxPrice);
  }

  if (filters?.search) {
    whereConditions.push(
      `(p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`
    );
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  if (filters?.inStock !== undefined) {
    whereConditions.push(`p.in_stock = $${paramIndex++}`);
    params.push(filters.inStock);
  }

  if (filters?.isFeatured !== undefined) {
    whereConditions.push(`p.is_featured = $${paramIndex++}`);
    params.push(filters.isFeatured);
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const validSortColumns = ['price', 'rating', 'review_count', 'release_date', 'created_at'];
  const orderByColumn = sortBy && validSortColumns.includes(sortBy) ? sortBy : 'created_at';
  const orderByClause = `ORDER BY p.${orderByColumn} ${sortOrder}`;

  const countQuery = `
    SELECT COUNT(*) as total
    FROM phones p
    ${whereClause}
  `;

  const dataQuery = `
    SELECT 
      p.id, p.name, p.slug, p.brand_id as "brandId", p.category_id as "categoryId",
      p.description, p.price, p.original_price as "originalPrice", p.amazon_url as "amazonUrl",
      p.asin, p.image_url as "imageUrl", p.rating, p.review_count as "reviewCount",
      p.release_date as "releaseDate", p.in_stock as "inStock", p.is_featured as "isFeatured",
      b.name as "brandName", c.name as "categoryName",
      s.display, s.processor, s.ram, s.storage, s.camera, s.battery, s.os,
      ARRAY_AGG(f.feature) FILTER (WHERE f.feature IS NOT NULL) as features
    FROM phones p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN phone_specs s ON p.id = s.phone_id
    LEFT JOIN phone_features f ON p.id = f.phone_id
    ${whereClause}
    GROUP BY p.id, b.name, c.name, s.display, s.processor, s.ram, s.storage, s.camera, s.battery, s.os
    ${orderByClause}
    LIMIT $${paramIndex++} OFFSET $${paramIndex++}
  `;

  const countResult = await query(countQuery, params);
  const dataResult = await query(dataQuery, [...params, limit, offset]);

  const phones = dataResult.rows.map((row) => ({
    ...row,
    specs: {
      display: row.display,
      processor: row.processor,
      ram: row.ram,
      storage: row.storage,
      camera: row.camera,
      battery: row.battery,
      os: row.os,
    },
  }));

  return {
    phones,
    total: parseInt(countResult.rows[0].total),
  };
};

export const getPhoneBySlug = async (slug: string): Promise<Phone | null> => {
  const result = await query(
    `
    SELECT 
      p.id, p.name, p.slug, p.brand_id as "brandId", p.category_id as "categoryId",
      p.description, p.price, p.original_price as "originalPrice", p.amazon_url as "amazonUrl",
      p.asin, p.image_url as "imageUrl", p.rating, p.review_count as "reviewCount",
      p.release_date as "releaseDate", p.in_stock as "inStock", p.is_featured as "isFeatured",
      b.name as "brandName", c.name as "categoryName",
      s.display, s.processor, s.ram, s.storage, s.camera, s.battery, s.os,
      ARRAY_AGG(f.feature) FILTER (WHERE f.feature IS NOT NULL) as features
    FROM phones p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN phone_specs s ON p.id = s.phone_id
    LEFT JOIN phone_features f ON p.id = f.phone_id
    WHERE p.slug = $1
    GROUP BY p.id, b.name, c.name, s.display, s.processor, s.ram, s.storage, s.camera, s.battery, s.os
    `,
    [slug]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    ...row,
    specs: {
      display: row.display,
      processor: row.processor,
      ram: row.ram,
      storage: row.storage,
      camera: row.camera,
      battery: row.battery,
      os: row.os,
    },
  };
};

export const getPhonesByIds = async (ids: string[]): Promise<Phone[]> => {
  if (ids.length === 0) return [];

  const result = await query(
    `
    SELECT 
      p.id, p.name, p.slug, p.brand_id as "brandId", p.category_id as "categoryId",
      p.description, p.price, p.original_price as "originalPrice", p.amazon_url as "amazonUrl",
      p.asin, p.image_url as "imageUrl", p.rating, p.review_count as "reviewCount",
      p.release_date as "releaseDate", p.in_stock as "inStock", p.is_featured as "isFeatured",
      b.name as "brandName", c.name as "categoryName",
      s.display, s.processor, s.ram, s.storage, s.camera, s.battery, s.os,
      ARRAY_AGG(f.feature) FILTER (WHERE f.feature IS NOT NULL) as features
    FROM phones p
    LEFT JOIN brands b ON p.brand_id = b.id
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN phone_specs s ON p.id = s.phone_id
    LEFT JOIN phone_features f ON p.id = f.phone_id
    WHERE p.id = ANY($1)
    GROUP BY p.id, b.name, c.name, s.display, s.processor, s.ram, s.storage, s.camera, s.battery, s.os
    `,
    [ids]
  );

  return result.rows.map((row) => ({
    ...row,
    specs: {
      display: row.display,
      processor: row.processor,
      ram: row.ram,
      storage: row.storage,
      camera: row.camera,
      battery: row.battery,
      os: row.os,
    },
  }));
};
