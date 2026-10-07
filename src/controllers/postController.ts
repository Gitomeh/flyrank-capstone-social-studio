import { Request, Response } from 'express';
import { PostRepository } from '../repositories';
import { createPostSchema } from '../validators';
import { AppError } from '../middleware/errorHandler';

const postRepository = new PostRepository();

export class PostController {
  async create(req: Request, res: Response): Promise<void> {
    const validationResult = createPostSchema.safeParse(req.body);

    if (!validationResult.success) {
      throw new AppError(400, validationResult.error.errors[0].message);
    }

    const { title, body, url } = validationResult.data;
    const post = await postRepository.create({ title, body, url });

    res.status(201).json(post);
  }

  async getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const post = await postRepository.findById(id);

    if (!post) {
      throw new AppError(404, 'Post not found');
    }

    res.json(post);
  }
}
