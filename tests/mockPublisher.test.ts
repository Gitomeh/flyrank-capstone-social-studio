import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockXPublisher } from '../src/adapters/MockXPublisher';
import { MockLinkedInPublisher } from '../src/adapters/MockLinkedInPublisher';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Mock Publishers', () => {
  beforeEach(async () => {
    // Clean up mock posts before each test
    await prisma.mockPost.deleteMany();
  });

  afterEach(async () => {
    // Clean up after each test
    await prisma.mockPost.deleteMany();
  });

  describe('MockXPublisher', () => {
    it('should record publication in database', async () => {
      const publisher = new MockXPublisher();
      const result = await publisher.publish({
        content: 'Test content for X',
        platform: 'x' as any,
        idempotencyKey: 'test-key-1',
      });

      expect(result.success).toBe(true);
      expect(result.externalPostId).toBeDefined();

      // Verify database record
      const mockPost = await prisma.mockPost.findFirst({
        where: { idempotencyKey: 'test-key-1' },
      });

      expect(mockPost).toBeDefined();
      expect(mockPost?.platform).toBe('x');
      expect(mockPost?.content).toBe('Test content for X');
    });

    it('should be idempotent', async () => {
      const publisher = new MockXPublisher();
      const input = {
        content: 'Test content',
        platform: 'x' as any,
        idempotencyKey: 'test-key-2',
      };

      // First publish
      const result1 = await publisher.publish(input);
      expect(result1.success).toBe(true);

      // Second publish with same key (should fail due to unique constraint)
      const result2 = await publisher.publish(input);
      expect(result2.success).toBe(false);
    });
  });

  describe('MockLinkedInPublisher', () => {
    it('should record publication in database', async () => {
      const publisher = new MockLinkedInPublisher();
      const result = await publisher.publish({
        content: 'Test content for LinkedIn',
        platform: 'linkedin' as any,
        idempotencyKey: 'test-key-3',
      });

      expect(result.success).toBe(true);
      expect(result.externalPostId).toBeDefined();

      // Verify database record
      const mockPost = await prisma.mockPost.findFirst({
        where: { idempotencyKey: 'test-key-3' },
      });

      expect(mockPost).toBeDefined();
      expect(mockPost?.platform).toBe('linkedin');
      expect(mockPost?.content).toBe('Test content for LinkedIn');
    });

    it('should be idempotent', async () => {
      const publisher = new MockLinkedInPublisher();
      const input = {
        content: 'Test content',
        platform: 'linkedin' as any,
        idempotencyKey: 'test-key-4',
      };

      // First publish
      const result1 = await publisher.publish(input);
      expect(result1.success).toBe(true);

      // Second publish with same key (should fail due to unique constraint)
      const result2 = await publisher.publish(input);
      expect(result2.success).toBe(false);
    });
  });
});
