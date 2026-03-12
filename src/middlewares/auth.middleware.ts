import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, user: any) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    
    (req as any).user = user; // Сохраняем данные юзера в запрос
    next();
  });
};

// В роутах
//
// routes/profile.routes.ts
//import { authenticateToken } from '../middlewares/auth.middleware.js';
//
//router.get('/orders', authenticateToken, profileController.getOrders);