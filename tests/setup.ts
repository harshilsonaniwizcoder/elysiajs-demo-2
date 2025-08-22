import { beforeAll, afterAll } from 'bun:test';
import { redisService } from '@/services/redis';
import { queueManager } from '@/queue/queue-manager';

beforeAll(async () => {
  // Setup test database and services
  console.log('Setting up tests...');
});

afterAll(async () => {
  // Cleanup
  await queueManager.closeAll();
  console.log('Cleaning up tests...');
});