import { Elysia } from 'elysia';
import { userController } from '@/controllers/user.controller';
import { authMiddleware } from '@/middleware/auth';
import { rateLimitMiddleware } from '@/middleware/rate-limiter';
import { createUserSchema, updateUserSchema, getUsersSchema } from '@/schemas/user.schema';
import { changeLanguage } from '@/localization';
import { jsonResponse } from '@/utils/response';
import { HTTP_STATUS } from '@/utils/constants';
import { randomUUID } from 'crypto';

export const userRoutes = new Elysia({ prefix: '/users' })
  .get('/', async ({ query, request }) => {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimitMiddleware(clientIp);
    const authorization = request.headers.get('authorization');
    await authMiddleware(authorization ?? undefined);
    {
      const lng = request.headers.get('lng');
      if (lng) await changeLanguage(lng);
    }

    const requestId = request.headers.get('x-request-id') ?? randomUUID();
    const validatedQuery = getUsersSchema.parse(query);
    const payload = await userController.getUsers(validatedQuery, requestId);
    return jsonResponse(payload, HTTP_STATUS.OK);
  })

  .get('/:id', async ({ params, headers, request }) => {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimitMiddleware(clientIp);
    await authMiddleware(headers.authorization);
    {
      const lng = request.headers.get('lng');
      if (lng) await changeLanguage(lng);
    }

    const requestId = request.headers.get('x-request-id') ?? randomUUID();
    const payload = await userController.getUserById(params.id, requestId);
    return jsonResponse(payload, HTTP_STATUS.OK);
  })

  .post('/', async ({ body, headers, request }) => {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimitMiddleware(clientIp);
    await authMiddleware(headers.authorization);
    {
      const lng = request.headers.get('lng');
      if (lng) await changeLanguage(lng);
    }

    const requestId = request.headers.get('x-request-id') ?? randomUUID();
    const validatedData = createUserSchema.parse(body);
    const payload = await userController.createUser(validatedData, requestId);
    return jsonResponse(payload, HTTP_STATUS.CREATED);
  })

  .put('/:id', async ({ params, body, headers, request }) => {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimitMiddleware(clientIp);
    await authMiddleware(headers.authorization);
    {
      const lng = request.headers.get('lng');
      if (lng) await changeLanguage(lng);
    }

    const requestId = request.headers.get('x-request-id') ?? randomUUID();
    const validatedData = updateUserSchema.parse(body);
    const payload = await userController.updateUser(params.id, validatedData, requestId);
    return jsonResponse(payload, HTTP_STATUS.OK);
  })

  .delete('/:id', async ({ params, headers, request }) => {
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    await rateLimitMiddleware(clientIp);
    await authMiddleware(headers.authorization);
    {
      const lng = request.headers.get('lng');
      if (lng) await changeLanguage(lng);
    }

    const requestId = request.headers.get('x-request-id') ?? randomUUID();
    const payload = await userController.deleteUser(params.id, requestId);
    return jsonResponse(payload, HTTP_STATUS.OK);
  });