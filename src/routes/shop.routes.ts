import { Router } from 'express';
import * as shopController from '../controllers/shop.controller.js';

const router = Router();

router.get('/', shopController.getProducts);
router.get('/:id', shopController.getProductById);

export default router;