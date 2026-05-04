import { Router } from "express";
import * as levelController from "../controllers/level.controller.js";

const router = Router();

router.get("/", levelController.getLevels);

export default router;
