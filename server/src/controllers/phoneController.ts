import { Request, Response } from 'express';
import { getAllPhones, getPhoneBySlug, getPhonesByIds } from '../models/Phone.js';
import { cacheGet, cacheSet } from '../config/redis.js';

export const getPhonesController = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = (page - 1) * limit;

    const filters = {
      brandId: req.query.brandId as string,
      categoryId: req.query.categoryId as string,
      minPrice: req.query.minPrice ? parseInt(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice as string) : undefined,
      search: req.query.search as string,
      inStock: req.query.inStock === 'true' ? true : req.query.inStock === 'false' ? false : undefined,
      isFeatured: req.query.isFeatured === 'true' ? true : undefined,
    };

    const sortBy = req.query.sortBy as string;
    const sortOrder = (req.query.sortOrder as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const cacheKey = `phones:${JSON.stringify({ page, limit, filters, sortBy, sortOrder })}`;
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const { phones, total } = await getAllPhones(limit, offset, filters, sortBy, sortOrder);

    const response = {
      phones,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };

    await cacheSet(cacheKey, response, 300); // Cache for 5 minutes

    res.json(response);
  } catch (error) {
    console.error('Error fetching phones:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPhoneBySlugController = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;

    const cacheKey = `phone:${slug}`;
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const phone = await getPhoneBySlug(slug);

    if (!phone) {
      return res.status(404).json({ error: 'Phone not found' });
    }

    await cacheSet(cacheKey, phone, 600); // Cache for 10 minutes

    res.json(phone);
  } catch (error) {
    console.error('Error fetching phone:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const comparePhones = async (req: Request, res: Response) => {
  try {
    const ids = req.query.ids as string;

    if (!ids) {
      return res.status(400).json({ error: 'Phone IDs are required' });
    }

    const phoneIds = ids.split(',').filter(id => id.trim());

    if (phoneIds.length < 2 || phoneIds.length > 4) {
      return res.status(400).json({ error: 'Please provide 2-4 phone IDs for comparison' });
    }

    const cacheKey = `compare:${ids}`;
    const cached = await cacheGet(cacheKey);

    if (cached) {
      return res.json(cached);
    }

    const phones = await getPhonesByIds(phoneIds);

    await cacheSet(cacheKey, phones, 600); // Cache for 10 minutes

    res.json(phones);
  } catch (error) {
    console.error('Error comparing phones:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
