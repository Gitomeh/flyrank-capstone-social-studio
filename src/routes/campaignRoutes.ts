import { Router } from 'express';
import { CampaignController } from '../controllers/campaignController';

const router = Router();
const campaignController = new CampaignController();

router.post('/', campaignController.create.bind(campaignController));
router.get('/:id', campaignController.getById.bind(campaignController));
router.get('/:id/history', campaignController.getHistory.bind(campaignController));

export default router;
