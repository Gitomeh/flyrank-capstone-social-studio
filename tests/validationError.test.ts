import { describe, it, expect } from 'vitest';
import { createPostSchema, createCampaignSchema, updateVariantSchema, scheduleVariantSchema } from '../src/validators';

describe('Validation Error Handling', () => {
  describe('Post Validation', () => {
    it('should reject post without title', () => {
      const result = createPostSchema.safeParse({
        body: 'Some content',
      });
      expect(result.success).toBe(false);
    });

    it('should reject post without body', () => {
      const result = createPostSchema.safeParse({
        title: 'Test',
      });
      expect(result.success).toBe(false);
    });

    it('should reject post with invalid URL', () => {
      const result = createPostSchema.safeParse({
        title: 'Test',
        body: 'Content',
        url: 'not-a-url',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid post', () => {
      const result = createPostSchema.safeParse({
        title: 'Test',
        body: 'Content',
        url: 'https://example.com',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Campaign Validation', () => {
    it('should reject campaign without postId', () => {
      const result = createCampaignSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject campaign with invalid UUID', () => {
      const result = createCampaignSchema.safeParse({
        postId: 'not-a-uuid',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid campaign', () => {
      const result = createCampaignSchema.safeParse({
        postId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Variant Validation', () => {
    it('should reject variant update without content', () => {
      const result = updateVariantSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should accept valid variant update', () => {
      const result = updateVariantSchema.safeParse({
        content: 'Updated content',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Schedule Validation', () => {
    it('should reject schedule without scheduledFor', () => {
      const result = scheduleVariantSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should reject schedule with invalid datetime', () => {
      const result = scheduleVariantSchema.safeParse({
        scheduledFor: 'not-a-datetime',
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid schedule', () => {
      const result = scheduleVariantSchema.safeParse({
        scheduledFor: '2024-01-01T12:00:00Z',
      });
      expect(result.success).toBe(true);
    });
  });
});
