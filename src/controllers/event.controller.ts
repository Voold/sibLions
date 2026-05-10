import type { Request, Response } from "express";
import * as eventService from "../services/event.service.js";

const parseOptionalDate = (value: unknown): Date | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsedDate = new Date(String(value));
  return Number.isNaN(parsedDate.getTime()) ? undefined : parsedDate;
};

const parseOptionalInteger = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const parsedNumber = Number(value);
  return Number.isInteger(parsedNumber) && parsedNumber >= 0
    ? parsedNumber
    : undefined;
};

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const updateEvent = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const eventUuid = req.params.uuid as string;

    if (!eventUuid || !UUID_V4_REGEX.test(eventUuid)) {
      return res.status(400).json({ message: "Invalid event uuid" });
    }

    const body = req.body as Record<string, unknown>;
    const hasUpdates = [
      "title",
      "description",
      "eventType",
      "status",
      "startDate",
      "endDate",
      "registrationDeadline",
      "participantPoints",
      "fanPoints",
      "maxParticipants",
      "location",
    ].some((field) => body[field] !== undefined);

    if (!hasUpdates) {
      return res
        .status(400)
        .json({ message: "At least one field is required" });
    }

    const updateInput: {
      title?: string;
      description?: string;
      eventType?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
      registrationDeadline?: Date;
      participantPoints?: number;
      fanPoints?: number;
      maxParticipants?: number;
      location?: string;
    } = {};

    if (body.title !== undefined) {
      if (typeof body.title !== "string" || body.title.trim().length === 0) {
        return res
          .status(400)
          .json({ message: "title must be a non-empty string" });
      }

      updateInput.title = body.title.trim();
    }

    if (body.description !== undefined) {
      if (typeof body.description !== "string") {
        return res
          .status(400)
          .json({ message: "description must be a string" });
      }

      updateInput.description = body.description;
    }

    if (body.eventType !== undefined) {
      if (typeof body.eventType !== "string") {
        return res.status(400).json({ message: "eventType must be a string" });
      }

      updateInput.eventType = body.eventType;
    }

    if (body.status !== undefined) {
      if (typeof body.status !== "string") {
        return res.status(400).json({ message: "status must be a string" });
      }

      updateInput.status = body.status;
    }

    if (body.startDate !== undefined) {
      const parsedStartDate = parseOptionalDate(body.startDate);

      if (!parsedStartDate) {
        return res.status(400).json({ message: "Invalid startDate format" });
      }

      updateInput.startDate = parsedStartDate;
    }

    if (body.endDate !== undefined) {
      const parsedEndDate = parseOptionalDate(body.endDate);

      if (!parsedEndDate) {
        return res.status(400).json({ message: "Invalid endDate format" });
      }

      updateInput.endDate = parsedEndDate;
    }

    if (body.registrationDeadline !== undefined) {
      const parsedRegistrationDeadline = parseOptionalDate(
        body.registrationDeadline,
      );

      if (!parsedRegistrationDeadline) {
        return res
          .status(400)
          .json({ message: "Invalid registrationDeadline format" });
      }

      updateInput.registrationDeadline = parsedRegistrationDeadline;
    }

    if (body.participantPoints !== undefined) {
      const parsedParticipantPoints = parseOptionalInteger(
        body.participantPoints,
      );

      if (parsedParticipantPoints === undefined) {
        return res.status(400).json({
          message: "participantPoints must be a non-negative integer",
        });
      }

      updateInput.participantPoints = parsedParticipantPoints;
    }

    if (body.fanPoints !== undefined) {
      const parsedFanPoints = parseOptionalInteger(body.fanPoints);

      if (parsedFanPoints === undefined) {
        return res
          .status(400)
          .json({ message: "fanPoints must be a non-negative integer" });
      }

      updateInput.fanPoints = parsedFanPoints;
    }

    if (body.maxParticipants !== undefined) {
      const parsedMaxParticipants = parseOptionalInteger(body.maxParticipants);

      if (parsedMaxParticipants === undefined) {
        return res
          .status(400)
          .json({ message: "maxParticipants must be a non-negative integer" });
      }

      updateInput.maxParticipants = parsedMaxParticipants;
    }

    if (body.location !== undefined) {
      if (typeof body.location !== "string") {
        return res.status(400).json({ message: "location must be a string" });
      }

      updateInput.location = body.location;
    }

    const updatedEvent = await eventService.updateEventByUuid(
      eventUuid,
      updateInput,
    );

    const { id: _id, ...publicEvent } = updatedEvent;

    return res.status(200).json({
      message: "Мероприятие успешно обновлено",
      event: publicEvent,
    });
  } catch (error: any) {
    console.error("[UPDATE EVENT ERROR]:", error.message);

    if (error.message === "Event not found") {
      return res.status(404).json({ message: error.message });
    }

    if (
      error.message === "endDate must be greater than or equal to startDate"
    ) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Server error" });
  }
};

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
      return res.status(400).json({
        message: "endDate must be greater than or equal to startDate",
      });
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
  const eventUuid = req.params.uuid as string;

  if (!eventUuid || !UUID_V4_REGEX.test(eventUuid)) {
    return res.status(400).json({ message: "Invalid event uuid" });
  }

  const eventByUuid = await eventService.getEventByUuid(eventUuid);

  if (!eventByUuid) {
    return res.status(404).json({ message: "Event not found" });
  }

  const event = await eventService.getEventDetails(
    eventByUuid.id,
    req.user?.userId,
  );

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

    const eventUuid = req.params.uuid as string;

    if (!eventUuid || !UUID_V4_REGEX.test(eventUuid)) {
      return res.status(400).json({ message: "Invalid event uuid" });
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

    const event = await eventService.getEventByUuid(eventUuid);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const registration = await eventService.registerForEvent(
      req.user.userId,
      event.id,
      registrationType,
    );
    const currentParticipants = await eventService.getEventParticipantCount(
      event.id,
    );

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

    const eventUuid = req.params.uuid as string;

    if (!eventUuid || !UUID_V4_REGEX.test(eventUuid)) {
      return res.status(400).json({ message: "Invalid event uuid" });
    }

    const event = await eventService.getEventByUuid(eventUuid);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    await eventService.unregisterFromEvent(req.user.userId, event.id);
    const currentParticipants = await eventService.getEventParticipantCount(
      event.id,
    );

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

export const getEventPersons = async (req: Request, res: Response) => {
  try {
    const eventUuid = req.params.uuid as string;

    if (!eventUuid || !UUID_V4_REGEX.test(eventUuid)) {
      return res.status(400).json({ message: "Invalid event uuid" });
    }

    const event = await eventService.getEventByUuid(eventUuid);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const persons = await eventService.getEventPersons(event.id);
    res.json({
      success: true,
      count: persons.length,
      persons,
    });
  } catch (error: any) {
    console.error("[GET EVENT PERSONS ERROR]:", error.message);

    if (error.message === "Event not found") {
      return res.status(404).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};

export const addEventPersons = async (req: Request, res: Response) => {
  try {
    const eventUuid = req.params.uuid as string;

    if (!eventUuid || !UUID_V4_REGEX.test(eventUuid)) {
      return res.status(400).json({ message: "Invalid event uuid" });
    }

    const event = await eventService.getEventByUuid(eventUuid);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const { userIds } = req.body;

    if (!Array.isArray(userIds)) {
      return res
        .status(400)
        .json({ message: "userIds must be an array of numbers" });
    }

    if (userIds.length === 0) {
      return res.status(400).json({ message: "userIds cannot be empty" });
    }

    const results = await eventService.addPersonsAndAwardPoints(
      event.id,
      userIds,
    );

    res.status(200).json({
      success: true,
      message: "Points awarded successfully",
      results,
    });
  } catch (error: any) {
    console.error("[ADD EVENT PERSONS ERROR]:", error.message);

    if (
      error.message === "Event not found" ||
      error.message === "Event has no points configured"
    ) {
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: "Server error" });
  }
};
