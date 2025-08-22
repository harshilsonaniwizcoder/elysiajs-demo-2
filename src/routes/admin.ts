import { Elysia } from 'elysia';
import { backupService } from '@/services/backup';
import { authMiddleware } from '@/middleware/auth';
import { ResponseBuilder } from '@/utils/response';
import { cacheService } from '@/services/cache';

export const adminRoutes = new Elysia({ prefix: '/admin' })
  .post('/backup', async ({ headers }) => {
    const auth = await authMiddleware(headers.authorization);
    
    if (auth.user.role !== 'admin') {
      throw new Error('Access denied');
    }
    
    const backupId = await backupService.createBackup();
    return ResponseBuilder.success('Backup created', { backupId });
  })
  
  .get('/backups', async ({ headers }) => {
    const auth = await authMiddleware(headers.authorization);
    
    if (auth.user.role !== 'admin') {
      throw new Error('Access denied');
    }
    
    const backups = await backupService.listBackups();
    return ResponseBuilder.success('Backups listed', backups);
  })
  
  .post('/cache/clear', async ({ headers, body }) => {
    const auth = await authMiddleware(headers.authorization);
    
    if (auth.user.role !== 'admin') {
      throw new Error('Access denied');
    }
    
    const { pattern } = body as { pattern?: string };
    
    if (pattern) {
      await cacheService.invalidatePattern(pattern);
    } else {
      await cacheService.invalidatePattern('*');
    }
    
    return ResponseBuilder.success('Cache cleared');
  });