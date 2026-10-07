import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500, 'Title too long'),
  body: z.string().min(1, 'Body is required'),
  url: z.string().url('Invalid URL').optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
