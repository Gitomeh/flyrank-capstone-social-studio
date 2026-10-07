import { z } from 'zod';

export const createCampaignSchema = z.object({
  postId: z.string().uuid('Invalid post ID'),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
