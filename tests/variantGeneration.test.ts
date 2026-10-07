import { describe, it, expect } from 'vitest';
import { generateVariants } from '../src/services/variantGenerationService';

describe('Variant Generation Service', () => {
  it('should generate distinct variants for each platform', () => {
    const blogPost = {
      title: 'Test Post',
      body: 'This is a test blog post with some content. It has multiple sentences.',
    };

    const variants = generateVariants(blogPost);

    expect(variants).toHaveLength(3);
    expect(variants.map((v) => v.platform)).toContain('telegram');
    expect(variants.map((v) => v.platform)).toContain('x');
    expect(variants.map((v) => v.platform)).toContain('linkedin');
  });

  it('should generate meaningfully different content for each platform', () => {
    const blogPost = {
      title: 'Test Post',
      body: 'This is a test blog post with some content.',
    };

    const variants = generateVariants(blogPost);

    const contents = variants.map((v) => v.content);

    // All contents should be different
    expect(new Set(contents).size).toBe(3);

    // X variant should be shorter
    const xVariant = variants.find((v) => v.platform === 'x');
    const linkedinVariant = variants.find((v) => v.platform === 'linkedin');
    expect(xVariant!.content.length).toBeLessThan(linkedinVariant!.content.length);
  });

  it('should handle long blog posts correctly', () => {
    const blogPost = {
      title: 'Long Post',
      body: 'a'.repeat(5000),
    };

    const variants = generateVariants(blogPost);

    // All variants should be generated
    expect(variants).toHaveLength(3);

    // Each variant should respect its platform's constraints
    const xVariant = variants.find((v) => v.platform === 'x');
    expect(xVariant!.content.length).toBeLessThanOrEqual(280);
  });
});
