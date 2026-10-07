export type Platform = 'telegram' | 'x' | 'linkedin';
export type CampaignStatus = 'draft' | 'active' | 'completed';
export type VariantStatus = 'draft' | 'approved' | 'rejected' | 'scheduled' | 'publishing' | 'published' | 'failed';
export type PublishAttemptStatus = 'started' | 'success' | 'failed' | 'retrying';

export interface PlatformProfile {
  platform: Platform;
  maxLength: number;
  maxHashtags: number;
  tone: string;
}

export interface PublishInput {
  content: string;
  platform: Platform;
  idempotencyKey: string;
}

export interface PublishResult {
  success: boolean;
  externalPostId?: string;
  error?: string;
}

export interface SocialPublisher {
  publish(input: PublishInput): Promise<PublishResult>;
}
