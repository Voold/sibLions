import { db } from "../db/index.js";
import { events, registrations, users, pointsHistory } from "../db/schema.js";
import { eq, and, count, inArray } from "drizzle-orm";
import type { Event, Registration } from "../types/event.types.js";

export const getAllEvents = async () => {
  return await db.select().from(events);
};

export const getEventSummaries = async (userId?: number) => {
  const eventList = await db
    .select({
      id: events.id,
      title: events.title,
      startDate: events.startDate,
      location: events.location,
      description: events.description,
      participantPoints: events.participantPoints,
      fanPoints: events.fanPoints,
      registrationDeadline: events.registrationDeadline,
      status: events.status,
    })
    .from(events);

  if (!userId || eventList.length === 0) {
    return eventList.map((event) => ({
      ...event,
      isRegistered: false,
    }));
  }

  const eventIds = eventList.map((event) => event.id);

  const userRegistrations = await db
    .select({
      eventId: registrations.eventId,
      role: registrations.role,
    })
    .from(registrations)
    .where(
      and(
        eq(registrations.userId, userId),
        inArray(registrations.eventId, eventIds),
      ),
    );

  const registeredMap = new Map(
    userRegistrations.map((registration) => [
      registration.eventId,
      registration.role,
    ]),
  );

  return eventList.map((event) => ({
    ...event,
    isRegistered: registeredMap.has(event.id),
    registrationType: registeredMap.get(event.id) ?? null,
  }));
};

export const getEventById = async (id: number): Promise<Event | null> => {
  const result = await db.select().from(events).where(eq(events.id, id));

  return result[0] || null;
};

export const getEventDetails = async (eventId: number, userId?: number) => {
  const event = await getEventById(eventId);

  if (!event) {
    return null;
  }

  const participantResult = await db
    .select({ count: count() })
    .from(registrations)
    .where(
      and(
        eq(registrations.eventId, eventId),
        eq(registrations.role, "participant"),
      ),
    );

  const fanResult = await db
    .select({ count: count() })
    .from(registrations)
    .where(
      and(eq(registrations.eventId, eventId), eq(registrations.role, "fan")),
    );

  let userRegistration: Pick<
    Registration,
    "id" | "role" | "status" | "registeredAt"
  > | null = null;

  if (userId) {
    const registrationResult = await db
      .select({
        id: registrations.id,
        role: registrations.role,
        status: registrations.status,
        registeredAt: registrations.registeredAt,
      })
      .from(registrations)
      .where(
        and(
          eq(registrations.userId, userId),
          eq(registrations.eventId, eventId),
        ),
      )
      .limit(1);

    userRegistration = registrationResult[0] ?? null;
  }

  return {
    ...event,
    currentParticipants: participantResult[0]?.count ?? 0,
    currentFans: fanResult[0]?.count ?? 0,
    isRegistered: Boolean(userRegistration),
    userRegistration,
  };
};

export const registerForEvent = async (
  userId: number,
  eventId: number,
  registrationType: "participant" | "fan",
): Promise<Registration> => {
  // Check if already registered
  const existing = await db
    .select()
    .from(registrations)
    .where(
      and(eq(registrations.userId, userId), eq(registrations.eventId, eventId)),
    )
    .limit(1);

  if (existing.length > 0) {
    throw new Error("User already registered for this event");
  }

  // Create registration
  const result = await db
    .insert(registrations)
    .values({
      userId,
      eventId,
      role: registrationType,
      status: "registered",
      registeredAt: new Date(),
    })
    .returning();

  if (!result[0]) {
    throw new Error("Failed to create registration");
  }

  return result[0];
};

export const getEventParticipantCount = async (
  eventId: number,
): Promise<number> => {
  const result = await db
    .select({ count: count() })
    .from(registrations)
    .where(eq(registrations.eventId, eventId));

  return result[0]?.count || 0;
};

export const unregisterFromEvent = async (
  userId: number,
  eventId: number,
): Promise<Registration> => {
  const result = await db
    .delete(registrations)
    .where(
      and(eq(registrations.userId, userId), eq(registrations.eventId, eventId)),
    )
    .returning();

  if (!result[0]) {
    throw new Error("User is not registered for this event");
  }

  return result[0];
};

export const getEventPersons = async (eventId: number) => {
  const event = await getEventById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  const persons = await db
    .select({
      id: users.id,
      username: users.username,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
      totalPoints: users.totalPoints,
      registrationId: registrations.id,
      role: registrations.role,
      attended: registrations.attended,
      registeredAt: registrations.registeredAt,
    })
    .from(registrations)
    .innerJoin(users, eq(registrations.userId, users.id))
    .where(eq(registrations.eventId, eventId));

  return persons;
};

export const addPersonsAndAwardPoints = async (
  eventId: number,
  userIds: number[],
) => {
  const event = await getEventById(eventId);

  if (!event) {
    throw new Error("Event not found");
  }

  if (!event.participantPoints) {
    throw new Error("Event has no points configured");
  }

  if (userIds.length === 0) {
    throw new Error("User IDs array cannot be empty");
  }

  const results = [];
  const now = new Date();

  for (const userId of userIds) {
    const registration = await db
      .select()
      .from(registrations)
      .where(
        and(
          eq(registrations.userId, userId),
          eq(registrations.eventId, eventId),
        ),
      )
      .limit(1);

    if (!registration[0]) {
      continue;
    }

    await db
      .update(registrations)
      .set({
        attended: true,
        attendedAt: now,
      })
      .where(eq(registrations.id, registration[0].id));

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const currentPoints = user[0]?.totalPoints || 0;
    const newPoints = currentPoints + event.participantPoints;

    await db
      .update(users)
      .set({
        totalPoints: newPoints,
      })
      .where(eq(users.id, userId));

    await db.insert(pointsHistory).values({
      userId,
      points: event.participantPoints,
      pointsType: "event_attendance",
      description: `Attendance at ${event.title}`,
      eventId,
      registrationId: registration[0].id,
    });

    results.push({
      userId,
      points: event.participantPoints,
      registered: true,
    });
  }

  return results;
};
