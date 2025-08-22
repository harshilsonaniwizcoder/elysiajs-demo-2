import { Elysia } from 'elysia';
import { metricsCollector } from '@/middleware/metrics';
import { ResponseBuilder } from '@/utils/response';

export const metricsRoutes = new Elysia({ prefix: '/metrics' })
  .get('/', () => {
    const metrics = metricsCollector.getMetrics();
    return ResponseBuilder.success('Application metrics', metrics);
  });