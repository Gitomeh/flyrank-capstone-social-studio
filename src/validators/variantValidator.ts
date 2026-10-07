import { z } from 'zod';

export const updateVariantSchema = z.object({
  content: z.string().min(1, 'Content is required'),
});

export type UpdateVariantInput = z.infer<typeof updateVariantSchema>;

export const scheduleVariantSchema = z.object({
  scheduledFor: z.string().datetime('Invalid datetime'),
});

export type ScheduleVariantInput = z.infer<typeof scheduleVariantSchema>;
