import Redis from 'ioredis';
import { config } from '@/config';
import { logger } from '@/utils/logger';

class RedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis(config.redis.url, {
      // Required by BullMQ for blocking commands used by Workers
      maxRetriesPerRequest: null,
    });
    
    this.client.on('connect', () => {
      logger.info('Connected to Redis');
    });

    this.client.on('error', (error) => {
      logger.error('Redis error:', error);
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    if (ttl) {
      await this.client.setex(key, ttl, value);
    } else {
      await this.client.set(key, value);
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async incr(key: string, ttl?: number): Promise<number> {
    const result = await this.client.incr(key);
    if (ttl && result === 1) {
      await this.client.expire(key, ttl);
    }
    return result;
  }

  getClient(): Redis {
    return this.client;
  }
}

export const redisService = new RedisService();