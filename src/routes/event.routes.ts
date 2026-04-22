import { Router } from "express";
import * as eventController from "../controllers/event.controller.js";
import {
  authenticateToken,
  attachUserIfPresent,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authenticateToken, eventController.createEvent);
router.delete("/:uuid", authenticateToken, eventController.deleteEventByUuid);
router.get("/", attachUserIfPresent, eventController.getEvents);
router.get("/:id", attachUserIfPresent, eventController.getEventDetail);
router.post(
  "/:id/register",
  authenticateToken,
  eventController.registerForEvent,
);
router.delete(
  "/:id/unregister",
  authenticateToken,
  eventController.unregisterFromEvent,
);

export default router;
