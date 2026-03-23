import { db } from '../db/index.js';
import { events } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import type { Event } from '../types/event.types.js';

export const getAllEvents = async () => {
  return await db.select().from(events);
};

export const getEventById = async (id: number): Promise<Event | null> => {
  const result = await db.select()
    .from(events)
    .where(eq(events.id, id));
    
  return result[0] || null;
};