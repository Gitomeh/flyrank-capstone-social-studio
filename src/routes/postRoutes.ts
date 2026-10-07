import { Router } from 'express';
import { PostController } from '../controllers/postController';

const router = Router();
const postController = new PostController();

router.post('/', postController.create.bind(postController));
router.get('/:id', postController.getById.bind(postController));

export default router;
