import { Elysia } from 'elysia';
import { userController } from '@/controllers/user.controller';
import { authMiddleware } from '@/middleware/auth';
import { rateLimitMiddleware } from '@/middleware/rate-limiter';
import { createUserSchema, updateUserSchema, getUsersSchema } from '@/schemas/user.schema';

export const userRoutes = new Elysia({ prefix: '/users' })
  .get('/', async ({ query, headers, request }) => {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimitMiddleware(clientIp);
    await authMiddleware(headers.authorization);
    
    const validatedQuery = getUsersSchema.parse(query);
    return await userController.getUsers(validatedQuery);
  })
  
  .get('/:id', async ({ params, headers, request }) => {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimitMiddleware(clientIp);
    await authMiddleware(headers.authorization);
    
    return await userController.getUserById(params.id);
  })
  
  .post('/', async ({ body, headers, request }) => {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimitMiddleware(clientIp);
    await authMiddleware(headers.authorization);
    
    const validatedData = createUserSchema.parse(body);
    return await userController.createUser(validatedData);
  })
  
  .put('/:id', async ({ params, body, headers, request }) => {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimitMiddleware(clientIp);
    await authMiddleware(headers.authorization);
    
    const validatedData = updateUserSchema.parse(body);
    return await userController.updateUser(params.id, validatedData);
  })
  
  .delete('/:id', async ({ params, headers, request }) => {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimitMiddleware(clientIp);
    await authMiddleware(headers.authorization);
    
    return await userController.deleteUser(params.id);
  });