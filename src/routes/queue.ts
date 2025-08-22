import { Elysia } from 'elysia';
import { queueManager } from '@/queue/queue-manager';
import { authMiddleware } from '@/middleware/auth';
import { ResponseBuilder } from '@/utils/response';
import { QUEUE_NAMES } from '@/utils/constants';
import { z } from 'zod';

const addJobSchema = z.object({
  queueName: z.enum([QUEUE_NAMES.EMAIL, QUEUE_NAMES.NOTIFICATION, QUEUE_NAMES.DATA_PROCESSING]),
  type: z.string(),
  payload: z.record(z.unknown()),
});

export const queueRoutes = new Elysia({ prefix: '/queue' })
  .post('/job', async ({ body, headers }) => {
    await authMiddleware(headers.authorization);
    
    const { queueName, type, payload } = addJobSchema.parse(body);
    
    const job = await queueManager.addJob(queueName, {
      type,
      payload,
    });
    
    return ResponseBuilder.success('Job added to queue', {
      jobId: job.id,
      queueName,
      type,
    });
  });