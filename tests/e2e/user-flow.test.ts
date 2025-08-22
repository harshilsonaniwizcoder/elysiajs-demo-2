import { describe, it, expect } from 'bun:test';
import { app } from '@/index';

describe('User Flow E2E', () => {
  it('should complete full user lifecycle', async () => {
    // Register user
    const registerResponse = await app.handle(
      new Request('http://localhost/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      })
    );

    expect(registerResponse.status).toBe(200);
    
    const registerData = await registerResponse.json();
    const { token } = registerData.data;

    // Get user profile
    const profileResponse = await app.handle(
      new Request('http://localhost/api/v1/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })
    );

    expect(profileResponse.status).toBe(200);
  });
});