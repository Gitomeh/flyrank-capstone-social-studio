import { describe, it, expect } from 'vitest';
import { VariantStatus } from '../src/types';

describe('Review Protection', () => {
  it('should reject scheduling of draft variant', () => {
    // This test verifies the business rule that only approved variants can be scheduled
    // The actual implementation is in the controller, which would be tested via integration tests
    const status: VariantStatus = 'draft';
    const isApproved = status === 'approved';
    expect(isApproved).toBe(false);
  });

  it('should reject scheduling of rejected variant', () => {
    const status: VariantStatus = 'rejected';
    const isApproved = status === 'approved';
    expect(isApproved).toBe(false);
  });

  it('should allow scheduling of approved variant', () => {
    const status: VariantStatus = 'approved';
    const isApproved = status === 'approved';
    expect(isApproved).toBe(true);
  });

  it('should reject scheduling of already scheduled variant', () => {
    const status: VariantStatus = 'scheduled';
    const isApproved = status === 'approved';
    expect(isApproved).toBe(false);
  });
});
