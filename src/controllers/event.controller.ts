import type { Request, Response } from "express";
import * as eventService from "../services/event.service.js";

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await eventService.getEventSummaries(req.user?.userId);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getEventDetail = async (req: Request, res: Response) => {
  const id = parseInt(req.params.id as string);

  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid event id" });
  }

  const event = await eventService.getEventDetails(id, req.user?.userId);

  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }
  res.json(event);
};

export const registerForEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const eventId = parseInt(req.params.id as string);

    if (Number.isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const { registrationType } = req.body;

    if (!registrationType) {
      return res.status(400).json({ message: "registrationType is required" });
    }

    if (!["participant", "fan"].includes(registrationType)) {
      return res
        .status(400)
        .json({ message: 'registrationType must be "participant" or "fan"' });
    }

    const event = await eventService.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registration = await eventService.registerForEvent(
      req.user.userId,
      eventId,
      registrationType,
    );
    const currentParticipants =
      await eventService.getEventParticipantCount(eventId);

    res.status(201).json({
      success: true,
      message: "Регистрация прошла успешно",
      registration: {
        id: registration.id,
        eventId: registration.eventId,
        userId: registration.userId,
        registrationType: registration.role,
        registeredAt: registration.registeredAt?.toISOString(),
      },
      event: {
        currentParticipants,
      },
    });
  } catch (error: any) {
    console.error("[REGISTER EVENT ERROR]:", error.message);

    if (error.message === "User already registered for this event") {
      return res.status(409).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};

export const unregisterFromEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const eventId = parseInt(req.params.id as string);

    if (Number.isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event id" });
    }

    const event = await eventService.getEventById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await eventService.unregisterFromEvent(req.user.userId, eventId);
    const currentParticipants =
      await eventService.getEventParticipantCount(eventId);

    return res.status(200).json({
      success: true,
      message: "Отписка от мероприятия выполнена успешно",
      event: {
        currentParticipants,
      },
    });
  } catch (error: any) {
    console.error("[UNREGISTER EVENT ERROR]:", error.message);

    if (error.message === "User is not registered for this event") {
      return res.status(404).json({ message: error.message });
    }

    return res.status(500).json({ message: "Server error" });
  }
};
