import { PrismaClient, BlogPost } from '@prisma/client';

const prisma = new PrismaClient();

export class PostRepository {
  async create(data: { title: string; body: string; url?: string }): Promise<BlogPost> {
    return prisma.blogPost.create({
      data,
    });
  }

  async findById(id: string): Promise<BlogPost | null> {
    return prisma.blogPost.findUnique({
      where: { id },
      include: {
        campaigns: true,
      },
    });
  }

  async findAll(): Promise<BlogPost[]> {
    return prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
