import type { Request, Response } from "express";
import * as profileService from "../services/profile.service.js";

export const getOrders = async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const orders = await profileService.getUserOrders(Number(userId));
    return res.json(orders);
  } catch (error) {
    console.error("Ошибка при получении заказов:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
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
