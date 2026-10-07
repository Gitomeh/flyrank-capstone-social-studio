import { BaseSocialPublisher } from './SocialPublisher';
import { PublishInput, PublishResult } from '../types';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class MockXPublisher extends BaseSocialPublisher {
  async publish(input: PublishInput): Promise<PublishResult> {
    this.logPublish(input);

    try {
      // Simulate publication by recording in database
      const mockPost = await prisma.mockPost.create({
        data: {
          platform: input.platform,
          content: input.content,
          idempotencyKey: input.idempotencyKey,
          externalPostId: `mock_${input.platform}_${Date.now()}`,
        },
      });

      return {
        success: true,
        externalPostId: mockPost.externalPostId,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
