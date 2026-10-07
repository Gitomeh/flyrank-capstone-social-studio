import { getPublisher } from '../adapters';
import { VariantRepository, PublishAttemptRepository } from '../repositories';

const variantRepository = new VariantRepository();
const publishAttemptRepository = new PublishAttemptRepository();

export async function processPublishJob(job: any): Promise<void> {
  const { variantId, scheduledFor } = job.data;

  console.log(`[Worker] Processing publish job for variant ${variantId}, scheduled for ${scheduledFor}`);

  // Fetch variant
  const variant = await variantRepository.findById(variantId);
  if (!variant) {
    console.error(`[Worker] Variant ${variantId} not found`);
    return;
  }

  // Check if already published (idempotency check)
  const existingSuccess = await publishAttemptRepository.findSuccessfulByVariantAndKey(
    variantId,
    `${variantId}_${scheduledFor}`
  );

  if (existingSuccess) {
    console.log(`[Worker] Variant ${variantId} already published with idempotency key`);
    return;
  }

  // Generate idempotency key
  const idempotencyKey = `${variantId}_${scheduledFor}`;

  // Update variant status to publishing
  await variantRepository.updateStatus(variantId, 'publishing');

  // Create publish attempt record
  const attempt = await publishAttemptRepository.create({
    variantId,
    platform: variant.platform,
    idempotencyKey,
    attemptNumber: 1,
  });

  console.log(`[Worker] Created publish attempt ${attempt.id}`);

  try {
    // Get appropriate publisher
    const publisher = getPublisher(variant.platform as any);

    // Publish
    const result = await publisher.publish({
      content: variant.content,
      platform: variant.platform as any,
      idempotencyKey,
    });

    if (result.success) {
      // Update attempt as success
      await publishAttemptRepository.updateSuccess(attempt.id, result.externalPostId || 'unknown');

      // Update variant status
      await variantRepository.updateStatus(variantId, 'published');

      console.log(`[Worker] Successfully published variant ${variantId} to ${variant.platform}`);
    } else {
      // Update attempt as failed
      await publishAttemptRepository.updateFailure(attempt.id, result.error || 'Unknown error');

      // Update variant status
      await variantRepository.updateStatus(variantId, 'failed');

      console.error(`[Worker] Failed to publish variant ${variantId}: ${result.error}`);
      // Don't throw - log the error and continue
    }
  } catch (error) {
    // Update attempt as failed
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await publishAttemptRepository.updateFailure(attempt.id, errorMessage);

    // Update variant status
    await variantRepository.updateStatus(variantId, 'failed');

    console.error(`[Worker] Error publishing variant ${variantId}:`, errorMessage);
    // Don't throw - log the error and continue
  }
}

export async function startWorker(): Promise<void> {
  console.log('[Worker] Publish worker started (simple scheduler mode)');

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('[Worker] SIGTERM received, closing worker...');
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('[Worker] SIGINT received, closing worker...');
    process.exit(0);
  });
}

// Start worker if this file is run directly
if (require.main === module) {
  startWorker().catch(console.error);
}
