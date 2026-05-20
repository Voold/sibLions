import type { Request, Response } from "express";
import * as profileService from "../services/profile.service.js";

export const getOrders = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const orders = await profileService.getUserOrders(userId);
  res.json(orders);
};

export const getAchievements = async (req: Request, res: Response) => {
  const achievements = await profileService.getUserAchievements();
  res.json(achievements);
};

export const getPointsHistory = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const history = await profileService.getUserPointsHistory(userId);
  res.json(history);
};
