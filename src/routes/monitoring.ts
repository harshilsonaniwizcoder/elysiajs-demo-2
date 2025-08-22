import { Elysia } from 'elysia';
import { monitoringService } from '@/services/monitoring';
import { authMiddleware } from '@/middleware/auth';
import { ResponseBuilder } from '@/utils/response';

export const monitoringRoutes = new Elysia({ prefix: '/monitoring' })
  .get('/health', async ({ headers }) => {
    const auth = await authMiddleware(headers.authorization);
    
    if (auth.user.role !== 'admin') {
      throw new Error('Access denied');
    }
    
    const healthCheck = await monitoringService.checkSystemHealth();
    return ResponseBuilder.success('System health check', healthCheck);
  })
  
  .get('/alerts', async ({ headers }) => {
    await authMiddleware(headers.authorization);
    
    const alerts = monitoringService.getActiveAlerts();
    return ResponseBuilder.success('Active alerts', alerts);
  })
  
  .post('/alerts/:id/resolve', async ({ params, headers }) => {
    await authMiddleware(headers.authorization);
    
    await monitoringService.resolveAlert(params.id);
    return ResponseBuilder.success('Alert resolved');
  });