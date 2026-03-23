import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { levels } from '../db/schema.js';
import type { User, UserProfileWithLevel, NewUser } from '../types/user.types.js';

export const getAllUsers = async (): Promise<User[]> => {
  return await db.select().from(users);
};

export const getUserById = async (id: number): Promise<User | null> => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, id));
    
  return result[0] || null;
};

//ANCHOR - update custom type (add some new)
export const getUserWithLevel = async (id: number): Promise<UserProfileWithLevel | null> => {
  const result = await db
    .select({
      id: users.id,
      username: users.username,
      points: users.totalPoints,
      levelName: levels.name,
      levelColor: levels.color
    })
    .from(users)
    .leftJoin(levels, eq(users.currentLevelId, levels.id))
    .where(eq(users.id, id));

  return result[0] || null;
};

export const createUser = async (data: NewUser): Promise<User | null> => {
  const result = await db
    .insert(users)
    .values(data)
    .returning();
    
  return result[0] || null;
};

//ANCHOR - Update type to UUID
export const getOrCreateUser = async (data: NewUser): Promise<User | null> => {
  const existingUser = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.tpuId, data.tpuId!),
  });

  if (existingUser) {

    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, existingUser.id));
    return existingUser;
  }

  return await createUser(data) || null;
};