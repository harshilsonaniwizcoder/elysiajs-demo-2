import { redisService } from './redis';
import { logger } from '@/utils/logger';

class CacheService {
  private readonly DEFAULT_TTL = 3600; // 1 hour

  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redisService.get(key);
      if (!cached) return null;
      
      return JSON.parse(cached) as T;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttl: number = this.DEFAULT_TTL): Promise<void> {
    try {
      await redisService.set(key, JSON.stringify(value), ttl);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await redisService.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const client = redisService.getClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch (error) {
      logger.error('Cache pattern invalidation error:', error);
    }
  }
}

export const cacheService = new CacheService();