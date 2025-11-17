import { Request, Response } from 'express';
import { getAllCategories, getCategoryBySlug } from '../models/Category.js';
import { cacheGet, cacheSet } from '../config/redis.js';

export const getCategoriesController = async (_req: Request, res: Response) => {
  try {
    const cacheKey = 'categories:all';
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const categories = await getAllCategories();

    await cacheSet(cacheKey, categories, 3600); // Cache for 1 hour

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategoryBySlugController = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const cacheKey = `category:${slug}`;
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const category = await getCategoryBySlug(slug);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await cacheSet(cacheKey, category, 3600); // Cache for 1 hour

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
