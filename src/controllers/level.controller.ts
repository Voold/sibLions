import type { Request, Response } from "express";
import type { Level } from "../types/level.types.js";

const TEST_LEVEL: Level = {
  id: 1,
  name: "Лев Тестировщик",
  min_points: 0,
  description: "Базовый уровень для тестирования и первого доступа к системе.",
  color: "#F2C94C",
};

export const getLevels = async (_req: Request, res: Response) => {
  res.json([TEST_LEVEL]);
};
