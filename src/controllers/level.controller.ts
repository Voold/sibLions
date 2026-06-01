import type { Request, Response } from "express";
import { LEVELS } from "../constants/levels.js";

export const getLevels = async (_req: Request, res: Response) => {
  res.json(LEVELS);
};
