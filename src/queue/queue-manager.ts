import { Queue, Worker, Job } from 'bullmq';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import type { ElysiaAdapter } from '@bull-board/elysia';
import { redisService } from '@/services/redis';
import { logger } from '@/utils/logger';
import { QUEUE_NAMES } from '@/utils/constants';
import type { QueueJobData } from '@/types/global';
import { IServerAdapter } from '@bull-board/api/dist/typings/app';

class QueueManager {
  private queues: Map<string, Queue> = new Map();
  private workers: Map<string, Worker> = new Map();
  private bullBoard?: ReturnType<typeof createBullBoard>;
  private elysiaAdapter?: ElysiaAdapter;

  constructor() {
    this.initializeQueues();
  }

  private initializeQueues(): void {
    Object.values(QUEUE_NAMES).forEach(queueName => {
      const queue = new Queue(queueName, {
        connection: redisService.getClient(),
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 50,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        },
      });

      this.queues.set(queueName, queue);
      
      // Setup worker for each queue
      this.setupWorker(queueName);
    });
  }

  private setupWorker(queueName: string): void {
    const worker = new Worker(
      queueName,
      async (job: Job<QueueJobData>) => {
        return this.processJob(queueName, job);
      },
      {
        connection: redisService.getClient(),
        concurrency: 5,
      }
    );

    worker.on('completed', (job) => {
      logger.info(`Job ${job.id} completed in queue ${queueName}`);
    });

    worker.on('failed', (job, error) => {
      logger.error(`Job ${job?.id} failed in queue ${queueName}:`, error);
    });

    this.workers.set(queueName, worker);
  }

  private async processJob(queueName: string, job: Job<QueueJobData>): Promise<void> {
    logger.info(`Processing job ${job.id} in queue ${queueName}`);
    
    switch (queueName) {
      case QUEUE_NAMES.EMAIL:
        await this.processEmailJob(job);
        break;
      case QUEUE_NAMES.NOTIFICATION:
        await this.processNotificationJob(job);
        break;
      case QUEUE_NAMES.DATA_PROCESSING:
        await this.processDataJob(job);
        break;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }
  }

  private async processEmailJob(job: Job<QueueJobData>): Promise<void> {
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    logger.info(`Email sent for job ${job.id}`);
  }

  private async processNotificationJob(job: Job<QueueJobData>): Promise<void> {
    // Simulate notification sending
    await new Promise(resolve => setTimeout(resolve, 500));
    logger.info(`Notification sent for job ${job.id}`);
  }

  private async processDataJob(job: Job<QueueJobData>): Promise<void> {
    // Simulate data processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    logger.info(`Data processed for job ${job.id}`);
  }

  public async addJob(queueName: string, data: QueueJobData): Promise<Job<QueueJobData>> {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }

    // Use the job type as the BullMQ job name; full payload is passed as job data
    const job = await queue.add(data.type, data);
    logger.info(`Added job ${job.id} to queue ${queueName} with type ${data.type}`);
    return job as Job<QueueJobData>;
  }

  public getQueues(): Queue[] {
    return Array.from(this.queues.values());
  }

  async closeAll(): Promise<void> {
    await Promise.all([
      ...Array.from(this.queues.values()).map(queue => queue.close()),
      ...Array.from(this.workers.values()).map(worker => worker.close()),
    ]);
  }
}

export const queueManager = new QueueManager();