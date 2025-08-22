import jwt from 'jsonwebtoken';
import { config } from '@/config';
import { dbService } from '@/services/database';
import { AuthenticationError } from '@/utils/errors';
import type { AuthContext } from '@/types/global';

export const authMiddleware = async (
  authorization?: string
): Promise<AuthContext> => {
  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new AuthenticationError('Authorization token required');
  }

  const token = authorization.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
    const user = await dbService.getUserById(decoded.userId);
    
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    return { user, token };
  } catch {
    throw new AuthenticationError('Invalid token');
  }
};