import { describe, it, expect } from 'vitest';
import { validatePlatformConstraints } from '../src/services/validationService';
import { Platform } from '../src/types';

describe('Validation Service', () => {
  describe('X Platform Constraints', () => {
    it('should accept valid X content', () => {
      const result = validatePlatformConstraints(
        'This is a valid tweet #tech',
        'x'
      );
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject X content exceeding character limit', () => {
      const longContent = 'a'.repeat(281);
      const result = validatePlatformConstraints(longContent, 'x');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('maximum length');
    });

    it('should reject X content with too many hashtags', () => {
      const content = 'Test #a #b #c #d';
      const result = validatePlatformConstraints(content, 'x');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('hashtag count');
    });

    it('should reject empty X content', () => {
      const result = validatePlatformConstraints('   ', 'x');
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Content cannot be empty');
    });
  });

  describe('LinkedIn Platform Constraints', () => {
    it('should accept valid LinkedIn content', () => {
      const result = validatePlatformConstraints(
        'This is a valid LinkedIn post #professional #insights',
        'linkedin'
      );
      expect(result.valid).toBe(true);
    });

    it('should reject LinkedIn content exceeding character limit', () => {
      const longContent = 'a'.repeat(3001);
      const result = validatePlatformConstraints(longContent, 'linkedin');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('maximum length');
    });

    it('should reject LinkedIn content with too many hashtags', () => {
      const content = 'Test #a #b #c #d #e #f #g #h #i #j #k';
      const result = validatePlatformConstraints(content, 'linkedin');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('hashtag count');
    });
  });

  describe('Telegram Platform Constraints', () => {
    it('should accept valid Telegram content', () => {
      const result = validatePlatformConstraints(
        'This is a valid Telegram message #updates',
        'telegram'
      );
      expect(result.valid).toBe(true);
    });

    it('should reject Telegram content exceeding character limit', () => {
      const longContent = 'a'.repeat(4097);
      const result = validatePlatformConstraints(longContent, 'telegram');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('maximum length');
    });

    it('should reject Telegram content with too many hashtags', () => {
      const content = 'Test #a #b #c #d #e #f';
      const result = validatePlatformConstraints(content, 'telegram');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('hashtag count');
    });
  });
});
