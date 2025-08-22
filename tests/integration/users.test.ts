import { describe, it, expect, beforeAll, afterAll } from 'bun:test';
import { app } from '@/index';
import jwt from 'jsonwebtoken';
import { config } from '@/config';

describe('Users API', () => {
  let authToken: string;
  
  beforeAll(async () => {
    // Create test user and get auth token
    authToken = jwt.sign({ userId: 'test-user' }, config.jwt.secret);
  });

  it('should get users list', async () => {
    const response = await app
      .handle(new Request('http://localhost/api/v1/users', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      }));

    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.success).toBe(true);
  });

  it('should require authentication', async () => {
    const response = await app
      .handle(new Request('http://localhost/api/v1/users'));

    expect(response.status).toBe(401);
  });
});