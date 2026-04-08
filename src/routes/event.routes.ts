import { Router } from "express";
import * as eventController from "../controllers/event.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEventDetail);
router.post(
  "/:id/register",
  authenticateToken,
  eventController.registerForEvent,
);

export default router;
