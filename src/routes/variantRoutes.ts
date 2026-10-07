import { Router } from 'express';
import { VariantController } from '../controllers/variantController';

const router = Router();
const variantController = new VariantController();

router.get('/:id', variantController.getById.bind(variantController));
router.patch('/:id', variantController.update.bind(variantController));
router.post('/:id/approve', variantController.approve.bind(variantController));
router.post('/:id/reject', variantController.reject.bind(variantController));
router.post('/:id/schedule', variantController.schedule.bind(variantController));
router.get('/:id/history', variantController.getHistory.bind(variantController));

export default router;
