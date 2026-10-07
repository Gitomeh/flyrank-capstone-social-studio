// Simple in-memory scheduler for local testing without Redis
// In production, this would use BullMQ + Redis

interface ScheduledJob {
  variantId: string;
  scheduledFor: Date;
  timeoutId: NodeJS.Timeout;
}

const scheduledJobs = new Map<string, ScheduledJob>();

export interface PublishJobData {
  variantId: string;
  scheduledFor: string;
}

export async function scheduleVariant(variantId: string, scheduledFor: Date): Promise<void> {
  const delay = scheduledFor.getTime() - Date.now();

  if (delay <= 0) {
    throw new Error('Scheduled time must be in the future');
  }

  // Clear existing job if any
  const existingJob = scheduledJobs.get(variantId);
  if (existingJob) {
    clearTimeout(existingJob.timeoutId);
  }

  // Schedule the job
  const timeoutId = setTimeout(async () => {
    console.log(`[Scheduler] Executing scheduled job for variant ${variantId}`);
    // Import here to avoid circular dependency
    const { processPublishJob } = await import('../workers/publishWorker');
    await processPublishJob({
      id: `job-${variantId}`,
      data: {
        variantId,
        scheduledFor: scheduledFor.toISOString(),
      },
    } as any);
    scheduledJobs.delete(variantId);
  }, delay);

  scheduledJobs.set(variantId, {
    variantId,
    scheduledFor,
    timeoutId,
  });

  console.log(`[Scheduler] Scheduled variant ${variantId} for ${scheduledFor.toISOString()}`);
}

export async function removeScheduledJob(variantId: string): Promise<void> {
  const job = scheduledJobs.get(variantId);
  if (job) {
    clearTimeout(job.timeoutId);
    scheduledJobs.delete(variantId);
  }
}

export function getScheduledJobs(): ScheduledJob[] {
  return Array.from(scheduledJobs.values());
}
