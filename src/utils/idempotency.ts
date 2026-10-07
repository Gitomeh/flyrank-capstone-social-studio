export function generateIdempotencyKey(variantId: string, scheduledFor: Date): string {
  return `${variantId}_${scheduledFor.toISOString()}`;
}
