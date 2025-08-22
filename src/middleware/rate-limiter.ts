import { RateLimiterMemory } from 'rate-limiter-flexible';
import { config } from '@/config';
import { RateLimitError } from '@/utils/errors';

const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: config.rateLimit.max,
  duration: config.rateLimit.windowMs / 1000,
});

export const rateLimitMiddleware = async (key: string): Promise<void> => {
  try {
    await rateLimiter.consume(key);
  } catch {
    throw new RateLimitError('Rate limit exceeded. Try again later.');
  }
};