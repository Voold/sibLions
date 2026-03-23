import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users } from '../db/schema.js';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type UserProfileWithLevel = {
  id: number;
  username: string;
  points: number | null;
  levelName: string | null;
  levelColor: string | null;
};