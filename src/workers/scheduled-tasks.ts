import { logger } from '@/utils/logger';
import { queueManager } from '@/queue/queue-manager';
import { QUEUE_NAMES } from '@/utils/constants';

class ScheduledTasksWorker {
  private intervalId: NodeJS.Timeout | null = null;

  start(): void {
    logger.info('Starting scheduled tasks worker...');
    // Schedule a task to run every 5 minutes
    this.intervalId = setInterval(() => {
      this.runDailyReportGeneration();
      this.runCleanupTasks();
    }, 5 * 60 * 1000); // 5 minutes
  }

  stop(): void {
    logger.info('Stopping scheduled tasks worker...');
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async runDailyReportGeneration(): Promise<void> {
    logger.info('Running daily report generation task...');
    try {
      await queueManager.addJob(QUEUE_NAMES.DATA_PROCESSING, {
        type: 'generate-daily-report',
        payload: { date: new Date().toISOString().split('T')[0] },
      });
      logger.info('Daily report generation job added to queue.');
    } catch (error) {
      logger.error('Failed to add daily report job to queue:', error);
    }
  }

  private async runCleanupTasks(): Promise<void> {
    logger.info('Running cleanup tasks...');
    try {
      await queueManager.addJob(QUEUE_NAMES.DATA_PROCESSING, {
        type: 'cleanup-old-data',
        payload: { retentionDays: 90 },
      });
      logger.info('Cleanup old data job added to queue.');
    } catch (error) {
      logger.error('Failed to add cleanup job to queue:', error);
    }
  }
}

export const scheduledTasksWorker = new ScheduledTasksWorker();