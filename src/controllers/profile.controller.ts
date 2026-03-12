import type { Request, Response } from 'express';
import * as profileService from '../services/profile.service.js';

export const getOrders = async (req: Request, res: Response) => {
  const orders = await profileService.getUserOrders();
  res.json(orders);
};

export const getAchievements = async (req: Request, res: Response) => {
  const achievements = await profileService.getUserAchievements();
  res.json(achievements);
};