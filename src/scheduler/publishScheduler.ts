import { Queue } from 'bullmq';
import Redis from 'ioredis';

const connection = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

export const publishQueue = new Queue('publish-queue', { connection });

export interface PublishJobData {
  variantId: string;
  scheduledFor: string;
}

export async function scheduleVariant(variantId: string, scheduledFor: Date): Promise<void> {
  const delay = scheduledFor.getTime() - Date.now();

  if (delay <= 0) {
    throw new Error('Scheduled time must be in the future');
  }

  const jobId = `variant-${variantId}`;

  // Remove existing job if any
  await publishQueue.remove(jobId).catch(() => {
    // Job might not exist, ignore error
  });

  // Add new job with delay
  await publishQueue.add(
    'publish',
    {
      variantId,
      scheduledFor: scheduledFor.toISOString(),
    },
    {
      jobId,
      delay,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    }
  );

  console.log(`[Scheduler] Scheduled variant ${variantId} for ${scheduledFor.toISOString()}`);
}

export async function removeScheduledJob(variantId: string): Promise<void> {
  const jobId = `variant-${variantId}`;
  await publishQueue.remove(jobId).catch(() => {
    // Job might not exist, ignore error
  });
}
