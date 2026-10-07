import { PrismaClient, PublishAttempt } from '@prisma/client';

const prisma = new PrismaClient();

export class PublishAttemptRepository {
  async create(
    data: {
      variantId: string;
      platform: string;
      idempotencyKey: string;
      attemptNumber: number;
    }
  ): Promise<PublishAttempt> {
    return prisma.publishAttempt.create({
      data: {
        ...data,
        status: 'started' as any,
      },
    });
  }

  async findById(id: string): Promise<PublishAttempt | null> {
    return prisma.publishAttempt.findUnique({
      where: { id },
    });
  }

  async findByVariant(variantId: string): Promise<PublishAttempt[]> {
    return prisma.publishAttempt.findMany({
      where: { variantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByCampaign(campaignId: string): Promise<PublishAttempt[]> {
    return prisma.publishAttempt.findMany({
      where: {
        variant: {
          campaignId,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateSuccess(
    id: string,
    externalPostId: string
  ): Promise<PublishAttempt> {
    return prisma.publishAttempt.update({
      where: { id },
      data: {
        status: 'success' as any,
        externalPostId,
        completedAt: new Date(),
      },
    });
  }

  async updateFailure(
    id: string,
    errorMessage: string
  ): Promise<PublishAttempt> {
    return prisma.publishAttempt.update({
      where: { id },
      data: {
        status: 'failed' as any,
        errorMessage,
        completedAt: new Date(),
      },
    });
  }

  async updateRetrying(id: string): Promise<PublishAttempt> {
    return prisma.publishAttempt.update({
      where: { id },
      data: {
        status: 'retrying' as any,
      },
    });
  }

  async findSuccessfulByVariantAndKey(
    variantId: string,
    idempotencyKey: string
  ): Promise<PublishAttempt | null> {
    return prisma.publishAttempt.findFirst({
      where: {
        variantId,
        idempotencyKey,
        status: 'success',
      },
    });
  }
}
