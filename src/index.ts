import { Elysia } from 'elysia';
import { cors } from '@elysiajs/cors';
import { helmet } from 'elysia-helmet';
import { ElysiaAdapter } from '@bull-board/elysia';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { config } from '@/config';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/error-handler';
import { requestIdMiddleware } from '@/middleware/request-id';
import { metricsMiddleware } from '@/middleware/metrics';
import { queueManager } from '@/queue/queue-manager';
import { scheduledTasksWorker } from '@/workers/scheduled-tasks';
import { monitoringService } from '@/services/monitoring';
import { userRoutes } from '@/routes/users';
import { authRoutes } from '@/routes/auth';
import { queueRoutes } from '@/routes/queue';
import { metricsRoutes } from '@/routes/metrics';
import { monitoringRoutes } from '@/routes/monitoring';
import { adminRoutes } from '@/routes/admin';
import { ResponseBuilder } from '@/utils/response';

// Setup Bull Board (queue dashboard) using Elysia adapter
const serverAdapter = new ElysiaAdapter({
  basePath: '/admin/queues',
});

createBullBoard({
  queues: queueManager.getQueues().map(q => new BullMQAdapter(q)),
  serverAdapter,
});

const bullBoardPlugin = serverAdapter.registerPlugin();

const app = new Elysia()
  // Security middleware
  .use(helmet(config.security.helmetOptions))
  .use(cors({
    origin: config.security.corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  }))
  
  // Request ID and metrics middleware
  .derive(({ request }) => ({
    requestId: requestIdMiddleware(request),
  }))
  .use(metricsMiddleware())
  
  // Health checks
  .get('/health', async () => {
    const health = await monitoringService.checkSystemHealth();
    return ResponseBuilder.success('API is healthy', {
      status: health.status,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  })
  
  .get('/health/detailed', async () => {
    // Require authentication for detailed health
    const health = await monitoringService.checkSystemHealth();
    return ResponseBuilder.success('Detailed health check', {
      ...health,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.version,
    });
  })
  
  // API routes
  .group('/api/v1', (app) =>
    app
      .use(authRoutes)
      .use(userRoutes)
      .use(queueRoutes)
      .use(metricsRoutes)
      .use(monitoringRoutes)
      .use(adminRoutes)
  )
  
  // Bull Board for queue management
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // .use(bullBoardPlugin as any)
  
  // Global error handler
  // .onError(({ error }) => errorHandler(error))
  
  // Start server
  .listen({
    port: config.port,
    hostname: '0.0.0.0',
  });

// Start scheduled tasks
scheduledTasksWorker.start();

// Start monitoring checks
setInterval(async () => {
  const health = await monitoringService.checkSystemHealth();
  if (health.status !== 'healthy') {
    for (const issue of health.issues) {
      await monitoringService.sendAlert(issue);
    }
  }
}, 60000); // Check every minute

logger.info(`🚀 Server running at http://localhost:${config.port}`);
logger.info(`📊 Queue dashboard available at http://localhost:${config.port}/admin/queues`);
logger.info(`💾 Metrics endpoint: http://localhost:${config.port}/api/v1/metrics`);
logger.info(`🏥 Health check: http://localhost:${config.port}/health`);

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  try {
    // Stop accepting new connections
    app.stop?.();
    
    // Stop scheduled tasks
    scheduledTasksWorker.stop();
    
    // Close queue connections
    await queueManager.closeAll();
    
    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export { app };