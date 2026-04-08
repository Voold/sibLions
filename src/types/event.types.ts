import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import { events, registrations } from "../db/schema.js";

export type Event = InferSelectModel<typeof events>;
export type NewEvent = InferInsertModel<typeof events>;

export type Registration = InferSelectModel<typeof registrations>;
export type NewRegistration = InferInsertModel<typeof registrations>;

export interface RegisterPayload {
  eventId: number;
  registrationType: "participant" | "fan";
}
