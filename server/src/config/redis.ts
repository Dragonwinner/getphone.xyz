import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
});

redis.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redis.on('connect', () => {
  console.log('Redis client connected');
});

export const cacheGet = async (key: string): Promise<any> => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null;
  }
};

export const cacheSet = async (
  key: string,
  value: any,
  ttl: number = parseInt(process.env.CACHE_TTL || '3600')
): Promise<void> => {
  try {
    await redis.setex(key, ttl, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error);
  }
};

export const cacheDel = async (key: string): Promise<void> => {
  try {
    await redis.del(key);
  } catch (error) {
    console.error('Cache delete error:', error);
  }
};

export const cacheDelPattern = async (pattern: string): Promise<void> => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error('Cache delete pattern error:', error);
  }
};

export default redis;
