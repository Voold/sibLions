import { Router } from 'express';
import * as profileController from '../controllers/profile.controller.js';

const router = Router();

router.get('/orders', profileController.getOrders);
router.get('/achievements', profileController.getAchievements);

export default router;