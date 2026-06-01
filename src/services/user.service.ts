import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { getLevelByPoints } from "../constants/levels.js";
import type {
  User,
  UserProfileWithLevel,
  NewUser,
} from "../types/user.types.js";

export const getAllUsers = async (): Promise<User[]> => {
  return await db.select().from(users);
};

export const getUserById = async (id: number): Promise<User | null> => {
  const result = await db.select().from(users).where(eq(users.id, id));

  return result[0] || null;
};

//ANCHOR - update custom type (add some new)
export const getUserWithLevel = async (
  id: number,
): Promise<UserProfileWithLevel | null> => {
  const result = await db
    .select({
      id: users.id,
      username: users.username,
      points: users.totalPoints,
      accountPoints: users.accountPoints,
    })
    .from(users)
    .where(eq(users.id, id));

  const user = result[0];

  if (!user) {
    return null;
  }

  const level = getLevelByPoints(user.accountPoints ?? 0);

  return {
    ...user,
    levelName: level.name,
    levelColor: level.color,
    bonusPercent: level.bonus_percent,
  };
};

export const createUser = async (data: NewUser): Promise<User | null> => {
  const result = await db.insert(users).values(data).returning();

  return result[0] || null;
};

//ANCHOR - Update type to UUID
export const getOrCreateUser = async (data: NewUser): Promise<User | null> => {
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.tpuId, data.tpuId!),
  });

  if (existingUser) {
    await db
      .update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, existingUser.id));
    return existingUser;
  }

  return (await createUser(data)) || null;
};
