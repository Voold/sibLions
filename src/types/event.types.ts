import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { events } from '../db/schema.js';

export type Event = InferSelectModel<typeof events>;
export type NewEvent = InferInsertModel<typeof events>;