import { Elysia } from 'elysia';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { config } from '@/config/index';
import { dbService } from '@/services/database';
import { ResponseBuilder } from '@/utils/response';
import { AuthenticationError } from '@/utils/errors';
import { rateLimitMiddleware } from '@/middleware/rate-limiter';

const loginSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(255),
});

const registerSchema = z.object({
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(6, 'Password must be at least 6 characters').max(255),
  name: z.string().min(1, 'Name is required').max(255),
});

const createToken = (userId: string): string =>
  jwt.sign({ userId }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });

const registerUser = async (
  { email, password, name }: { email: string; password: string; name: string }
) => {
  const hashedPassword = await bcrypt.hash(password, 12);
  return dbService.createUser({
    email,
    name,
    password: hashedPassword,
    role: 'user',
  });
};

export const authRoutes = new Elysia({ prefix: '/auth' })
  .post('/login', async ({ body, request }) => {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimitMiddleware(`login:${clientIp}`);
    
    const { email, password } = loginSchema.parse(body);
    
    const user = await dbService.getUserByEmail(email);
    
    if (!user || !await bcrypt.compare(password, user.password || '')) {
      throw new AuthenticationError('Invalid credentials');
    }
    
    const token = createToken(user.id);
    
    return ResponseBuilder.success('Login successful', {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  })
  
  .post('/register', async ({ body, request }) => {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimitMiddleware(`register:${clientIp}`);
    
    const { email, password, name } = registerSchema.parse(body);
    const user = await registerUser({ email, password, name });
    const token = createToken(user.id);
    
    return ResponseBuilder.success('Registration successful', {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  });