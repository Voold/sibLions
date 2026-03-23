import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';

const router = Router();

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserData);

router.post('/', userController.createUser);

export default router;