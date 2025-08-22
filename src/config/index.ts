import { z } from 'zod';
import type { AppConfig } from '@/types/global';

const configSchema = z.object({
  PORT: z.string().transform(Number).default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string(),
  SUPABASE_URL: z.string(),
  SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_KEY: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('24h'),
  RATE_LIMIT_MAX: z.string().transform(Number).default('100'),
  RATE_LIMIT_WINDOW: z.string().transform(Number).default('900000'),
  CORS_ORIGINS: z.string().default('http://localhost:3000'),
  LOG_LEVEL: z.string().default('info'),
});

const env = configSchema.parse(process.env);

export const config: AppConfig = {
  port: env.PORT,
  nodeEnv: env.NODE_ENV,
  database: {
    url: env.DATABASE_URL,
    supabaseUrl: env.SUPABASE_URL,
    supabaseAnonKey: env.SUPABASE_ANON_KEY,
    supabaseServiceKey: env.SUPABASE_SERVICE_KEY,
  },
  redis: {
    url: env.REDIS_URL,
  },
  jwt: {
    secret: env.JWT_SECRET,
    expiresIn: env.JWT_EXPIRES_IN,
  },
  rateLimit: {
    max: env.RATE_LIMIT_MAX,
    windowMs: env.RATE_LIMIT_WINDOW,
  },
  security: {
    corsOrigins: env.CORS_ORIGINS.split(','),
    helmetOptions: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    },
  },
  logging: {
    level: env.LOG_LEVEL,
  },
};