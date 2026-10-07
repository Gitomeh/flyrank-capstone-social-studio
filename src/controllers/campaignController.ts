import { Request, Response } from 'express';
import { CampaignRepository, PostRepository, VariantRepository, PublishAttemptRepository } from '../repositories';
import { createCampaignSchema } from '../validators';
import { generateVariants } from '../services/variantGenerationService';
import { validatePlatformConstraints } from '../services/validationService';
import { AppError } from '../middleware/errorHandler';

const campaignRepository = new CampaignRepository();
const postRepository = new PostRepository();
const variantRepository = new VariantRepository();
const publishAttemptRepository = new PublishAttemptRepository();

export class CampaignController {
  async create(req: Request, res: Response): Promise<void> {
    const validationResult = createCampaignSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new AppError(400, validationResult.error.errors[0].message);
    }

    const { postId } = validationResult.data;

    // Check if post exists
    const post = await postRepository.findById(postId);
    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    // Create campaign
    const campaign = await campaignRepository.create(postId);

    // Generate variants
    const generatedVariants = generateVariants({ title: post.title, body: post.body });

    // Validate and create variants
    const createdVariants = [];
    for (const variant of generatedVariants) {
      const validation = validatePlatformConstraints(variant.content, variant.platform);

      if (!validation.valid) {
        throw new AppError(400, `Generated ${variant.platform} variant violates constraints: ${validation.errors.join(', ')}`);
      }

      const created = await variantRepository.create({
        campaignId: campaign.id,
        platform: variant.platform,
        content: variant.content,
      });
      createdVariants.push(created);
    }

    res.status(201).json({
      ...campaign,
      variants: createdVariants,
    });
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const campaign = await campaignRepository.findById(id);

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    res.json(campaign);
  }

  async getHistory(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const campaign = await campaignRepository.findById(id);

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    const history = await publishAttemptRepository.findByCampaign(id);

    res.json(history);
  }
}
