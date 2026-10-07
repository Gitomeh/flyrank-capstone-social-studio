import { Request, Response } from 'express';
import { VariantRepository, PublishAttemptRepository } from '../repositories';
import { updateVariantSchema, scheduleVariantSchema } from '../validators';
import { validatePlatformConstraints } from '../services/validationService';
import { AppError } from '../middleware/errorHandler';
import { scheduleVariant } from '../scheduler/publishScheduler';

const variantRepository = new VariantRepository();

export class VariantController {
  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const variant = await variantRepository.findById(id);

    if (!variant) {
      throw new AppError(404, 'Variant not found');
    }

    res.json(variant);
  }

  async update(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const validationResult = updateVariantSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new AppError(400, validationResult.error.errors[0].message);
    }

    const variant = await variantRepository.findById(id);
    if (!variant) {
      throw new AppError(404, 'Variant not found');
    }

    // Only draft variants can be edited
    if (variant.status !== 'draft') {
      throw new AppError(400, 'Only draft variants can be edited');
    }

    const { content } = validationResult.data;

    // Validate constraints
    const validation = validatePlatformConstraints(content, variant.platform as any);
    if (!validation.valid) {
      throw new AppError(400, validation.errors.join(', '));
    }

    const updated = await variantRepository.updateContent(id, content);
    res.json(updated);
  }

  async approve(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const variant = await variantRepository.findById(id);

    if (!variant) {
      throw new AppError(404, 'Variant not found');
    }

    // Only draft variants can be approved
    if (variant.status !== 'draft') {
      throw new AppError(400, 'Only draft variants can be approved');
    }

    const updated = await variantRepository.updateStatus(id, 'approved');
    res.json(updated);
  }

  async reject(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const variant = await variantRepository.findById(id);

    if (!variant) {
      throw new AppError(404, 'Variant not found');
    }

    // Only draft or approved variants can be rejected
    if (variant.status !== 'draft' && variant.status !== 'approved') {
      throw new AppError(400, 'Only draft or approved variants can be rejected');
    }

    const updated = await variantRepository.updateStatus(id, 'rejected');
    res.json(updated);
  }

  async schedule(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const validationResult = scheduleVariantSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new AppError(400, validationResult.error.errors[0].message);
    }

    const variant = await variantRepository.findById(id);
    if (!variant) {
      throw new AppError(404, 'Variant not found');
    }

    // CRITICAL: Only approved variants can be scheduled
    if (variant.status !== 'approved') {
      throw new AppError(400, 'Only approved variants can be scheduled');
    }

    const { scheduledFor } = validationResult.data;
    const scheduledDate = new Date(scheduledFor);

    // Schedule time must be in the future
    if (scheduledDate <= new Date()) {
      throw new AppError(400, 'Scheduled time must be in the future');
    }

    // Update variant status
    const updated = await variantRepository.schedule(id, scheduledDate);

    // Schedule the job
    await scheduleVariant(id, scheduledDate);

    res.json(updated);
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const variant = await variantRepository.findById(id);

    if (!variant) {
      throw new AppError(404, 'Variant not found');
    }

    const publishAttemptRepo = new PublishAttemptRepository();
    const history = await publishAttemptRepo.findByVariant(id);

    res.json(history);
  }
}
