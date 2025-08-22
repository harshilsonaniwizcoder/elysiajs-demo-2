import { logger } from '@/utils/logger';
import { queueManager } from '@/queue/queue-manager';

// This file is primarily for running the worker processes in a separate context
// if needed, for example, in a separate Docker container or process.

const startWorkers = async () => {
  logger.info('Starting all queue workers...');
  // The workers are already initialized and started by the QueueManager constructor
  // when it initializes queues. This file just ensures the process stays alive
  // to run the workers.

  // Keep the process alive
  process.on('SIGINT', async () => {
    logger.info('SIGINT received, closing workers...');
    await queueManager.closeAll();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received, closing workers...');
    await queueManager.closeAll();
    process.exit(0);
  });
};

startWorkers().catch(error => {
  logger.error('Error starting workers:', error);
  process.exit(1);
});