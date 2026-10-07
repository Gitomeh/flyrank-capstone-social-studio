import { PrismaClient, Campaign } from '@prisma/client';
import { CampaignStatus } from '../types';

const prisma = new PrismaClient();

export class CampaignRepository {
  async create(postId: string): Promise<Campaign> {
    return prisma.campaign.create({
      data: {
        postId,
        status: 'active',
      },
      include: {
        variants: true,
      },
    });
  }

  async findById(id: string): Promise<Campaign | null> {
    return prisma.campaign.findUnique({
      where: { id },
      include: {
        post: true,
        variants: {
          include: {
            publishAttempts: true,
          },
        },
      },
    });
  }

  async updateStatus(id: string, status: CampaignStatus): Promise<Campaign> {
    return prisma.campaign.update({
      where: { id },
      data: { status },
    });
  }
}
