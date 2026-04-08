import { db } from "../db/index.js";
import { events, registrations } from "../db/schema.js";
import { eq, and, count } from "drizzle-orm";
import type { Event, Registration } from "../types/event.types.js";

export const getAllEvents = async () => {
  return await db.select().from(events);
};

export const getEventById = async (id: number): Promise<Event | null> => {
  const result = await db.select().from(events).where(eq(events.id, id));

  return result[0] || null;
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
