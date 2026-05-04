import { Router } from "express";
import * as eventController from "../controllers/event.controller.js";
import {
  authenticateToken,
  attachUserIfPresent,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", authenticateToken, eventController.createEvent);
router.patch("/:uuid", authenticateToken, eventController.updateEvent);
router.delete("/:uuid", authenticateToken, eventController.deleteEventByUuid);
router.get("/", attachUserIfPresent, eventController.getEvents);
router.get("/:uuid", attachUserIfPresent, eventController.getEventDetail);
router.post(
  "/:uuid/register",
  authenticateToken,
  eventController.registerForEvent,
);
router.delete(
  "/:uuid/unregister",
  authenticateToken,
  eventController.unregisterFromEvent,
);
router.get(
  "/:eventId/persons",
  authenticateToken,
  eventController.getEventPersons,
);
router.post(
  "/:eventId/persons",
  authenticateToken,
  eventController.addEventPersons,
);

export default router;
