import { PrismaClient, SocialVariant } from '@prisma/client';
import { VariantStatus, Platform } from '../types';

const prisma = new PrismaClient();

export class VariantRepository {
  async create(
    data: {
      campaignId: string;
      platform: Platform;
      content: string;
    }
  ): Promise<SocialVariant> {
    return prisma.socialVariant.create({
      data: {
        ...data,
        status: 'draft',
      },
    });
  }

  async findById(id: string): Promise<SocialVariant | null> {
    return prisma.socialVariant.findUnique({
      where: { id },
      include: {
        publishAttempts: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findByCampaign(campaignId: string): Promise<SocialVariant[]> {
    return prisma.socialVariant.findMany({
      where: { campaignId },
      orderBy: { platform: 'asc' },
    });
  }

  async updateContent(id: string, content: string): Promise<SocialVariant> {
    return prisma.socialVariant.update({
      where: { id },
      data: { content },
    });
  }

  async updateStatus(id: string, status: VariantStatus): Promise<SocialVariant> {
    return prisma.socialVariant.update({
      where: { id },
      data: { status },
    });
  }

  async schedule(id: string, scheduledFor: Date): Promise<SocialVariant> {
    return prisma.socialVariant.update({
      where: { id },
      data: {
        status: 'scheduled',
        scheduledFor,
      },
    });
  }

  async findPublishedByCampaign(campaignId: string): Promise<SocialVariant[]> {
    return prisma.socialVariant.findMany({
      where: {
        campaignId,
        status: 'published',
      },
    });
  }
}
