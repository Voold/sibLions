import type { Request, Response } from "express";
import * as eventService from "../services/event.service.js";

const parseOptionalDate = (value: unknown): Date | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsedDate = new Date(String(value));
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
};

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const createEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { title, startDate, endDate } = req.body;

    if (typeof title !== "string" || title.trim().length === 0) {
      return res.status(400).json({ message: "title is required" });
    }

    if (!startDate || !endDate) {
      return res
        .status(400)
        .json({ message: "startDate and endDate are required" });
    }

    const parsedStartDate = new Date(String(startDate));
    const parsedEndDate = new Date(String(endDate));

    if (
      Number.isNaN(parsedStartDate.getTime()) ||
      Number.isNaN(parsedEndDate.getTime())
    ) {
      return res.status(400).json({ message: "Invalid date format" });
    }

    if (parsedEndDate < parsedStartDate) {
      return res
        .status(400)
        .json({ message: "endDate must be greater than or equal to startDate" });
    }

    const parsedRegistrationDeadline = parseOptionalDate(
      req.body.registrationDeadline,
    );

    if (
      req.body.registrationDeadline !== undefined &&
      parsedRegistrationDeadline === undefined
    ) {
      return res
        .status(400)
        .json({ message: "Invalid registrationDeadline format" });
    }

    const createdEvent = await eventService.createEvent({
      title: title.trim(),
      description: req.body.description,
      eventType: req.body.eventType,
      status: req.body.status,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      registrationDeadline: parsedRegistrationDeadline,
      participantPoints: req.body.participantPoints,
      fanPoints: req.body.fanPoints,
      maxParticipants: req.body.maxParticipants,
      location: req.body.location,
      organizerId: req.user.userId,
    });

    return res.status(201).json({
      message: "Мероприятие успешно создано",
      uuid: createdEvent.uuid,
    });
  } catch (error: any) {
    console.error("[CREATE EVENT ERROR]:", error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteEventByUuid = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const eventUuid = req.params.uuid as string;

    if (!eventUuid || !UUID_V4_REGEX.test(eventUuid)) {
      return res.status(400).json({ message: "Invalid event uuid" });
    }

    const deletedEvent = await eventService.deleteEventByUuid(eventUuid);

    return res.status(200).json({
      message: "Мероприятие успешно удалено",
      uuid: deletedEvent.uuid,
    });
  } catch (error: any) {
    console.error("[DELETE EVENT ERROR]:", error.message);

    if (error.message === "Event not found") {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

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
        eventUuid: event.uuid,
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
      uuid: event.uuid,
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
