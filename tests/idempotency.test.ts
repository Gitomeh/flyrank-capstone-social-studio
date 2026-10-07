import { describe, it, expect } from 'vitest';
import { generateIdempotencyKey } from '../src/utils/idempotency';

describe('Idempotency', () => {
  it('should generate consistent idempotency keys for same inputs', () => {
    const variantId = 'variant-123';
    const scheduledFor = new Date('2024-01-01T12:00:00Z');

    const key1 = generateIdempotencyKey(variantId, scheduledFor);
    const key2 = generateIdempotencyKey(variantId, scheduledFor);

    expect(key1).toBe(key2);
  });

  it('should generate different keys for different scheduled times', () => {
    const variantId = 'variant-123';
    const scheduledFor1 = new Date('2024-01-01T12:00:00Z');
    const scheduledFor2 = new Date('2024-01-01T13:00:00Z');

    const key1 = generateIdempotencyKey(variantId, scheduledFor1);
    const key2 = generateIdempotencyKey(variantId, scheduledFor2);

    expect(key1).not.toBe(key2);
  });

  it('should generate different keys for different variants', () => {
    const variantId1 = 'variant-123';
    const variantId2 = 'variant-456';
    const scheduledFor = new Date('2024-01-01T12:00:00Z');

    const key1 = generateIdempotencyKey(variantId1, scheduledFor);
    const key2 = generateIdempotencyKey(variantId2, scheduledFor);

    expect(key1).not.toBe(key2);
  });

  it('should use ISO format for scheduled time', () => {
    const variantId = 'variant-123';
    const scheduledFor = new Date('2024-01-01T12:00:00Z');

    const key = generateIdempotencyKey(variantId, scheduledFor);

    expect(key).toContain('2024-01-01T12:00:00.000Z');
  });
});
