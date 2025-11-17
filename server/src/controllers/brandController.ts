import { Request, Response } from 'express';
import { getAllBrands, getBrandBySlug } from '../models/Brand.js';
import { cacheGet, cacheSet } from '../config/redis.js';

export const getBrandsController = async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'brands:all';
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const brands = await getAllBrands();

    await cacheSet(cacheKey, brands, 3600); // Cache for 1 hour

    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBrandBySlugController = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const cacheKey = `brand:${slug}`;
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const brand = await getBrandBySlug(slug);

    if (!brand) {
      return res.status(404).json({ error: 'Brand not found' });
    }

    await cacheSet(cacheKey, brand, 3600); // Cache for 1 hour

    res.json(brand);
  } catch (error) {
    console.error('Error fetching brand:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
