import { 
  pgTable, 
  serial, 
  varchar, 
  integer, 
  text, 
  timestamp, 
  boolean, 
  date, 
  jsonb, 
  index, 
  unique
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Справочник уровней
export const levels = pgTable('levels', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  minPoints: integer('min_points').notNull().unique(),
  description: text('description'),
  benefits: text('benefits'),
  badgeImage: varchar('badge_image', { length: 255 }),
  color: varchar('color', { length: 20 }),
  requirements: text('requirements'),
});

// 2. Товары/Мерч
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 20 }), // clothing/accessories/souvenirs
  price: integer('price').notNull(),
  stock: integer('stock').default(0),
  status: varchar('status', { length: 20 }).default('active'), // active/inactive/out_of_stock
  image: varchar('image', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 3. Пользователи
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 150 }).unique().notNull(),
  email: varchar('email', { length: 254 }).notNull(),
  firstName: varchar('first_name', { length: 150 }),
  lastName: varchar('last_name', { length: 150 }),
  middleName: varchar('middle_name', { length: 150 }),
  avatar: varchar('avatar', { length: 255 }),
  birthDate: date('birth_date'),
  faculty: varchar('faculty', { length: 100 }),
  course: integer('course'),
  groupName: varchar('group_name', { length: 20 }),
  phone: varchar('phone', { length: 15 }),
  telegram: varchar('telegram', { length: 50 }),
  role: varchar('role', { length: 20 }).default('student'),
  tpuId: varchar('tpu_id', { length: 20 }).unique(),
  totalPoints: integer('total_points').default(0),
  currentLevelId: integer('current_level_id').references(() => levels.id, { onDelete: 'set null' }),
  achievements: jsonb('achievements'),
  dateJoined: timestamp('date_joined').defaultNow(),
  lastLogin: timestamp('last_login'),
  isActive: boolean('is_active').default(true),
}, (table) => ({
  tpuIdIdx: index('idx_users_tpu_id').on(table.tpuId),
}));

export const sessions = pgTable('sessions', {
  sessionId: varchar('session_id', { length: 255 }).primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isRevoked: boolean('is_revoked').default(false),
  issuedAt: timestamp('issued_at').defaultNow(),
});

// 4. Мероприятия
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  eventType: varchar('event_type', { length: 20 }), // sport/fan/training
  status: varchar('status', { length: 20 }).default('draft'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  registrationDeadline: timestamp('registration_deadline'),
  participantPoints: integer('participant_points').default(0),
  fanPoints: integer('fan_points').default(0),
  maxParticipants: integer('max_participants').default(0),
  location: varchar('location', { length: 200 }),
  organizerId: integer('organizer_id').references(() => users.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 5. Регистрации на мероприятия
export const registrations = pgTable('registrations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  eventId: integer('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }), // participant/fan
  status: varchar('status', { length: 20 }).default('registered'),
  attended: boolean('attended').default(false),
  attendedAt: timestamp('attended_at'),
  registeredAt: timestamp('registered_at').defaultNow(),
}, (table) => ({
  unq: unique().on(table.userId, table.eventId),
  eventIdx: index('idx_registrations_event').on(table.eventId),
}));

// 6. История баллов
export const pointsHistory = pgTable('points_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  points: integer('points').notNull(),
  pointsType: varchar('points_type', { length: 50 }),
  description: varchar('description', { length: 255 }),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'set null' }),
  registrationId: integer('registration_id').references(() => registrations.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  userIdIdx: index('idx_points_history_user').on(table.userId),
}));

// 7. Заказы мерча
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').default(1),
  totalPoints: integer('total_points').notNull(),
  status: varchar('status', { length: 20 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 8. Отдельная таблица достижений
export const userAchievements = pgTable('user_achievements', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  achievementType: varchar('achievement_type', { length: 50 }).notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  achievedAt: timestamp('achieved_at').defaultNow(),
  badgeImage: varchar('badge_image', { length: 255 }),
});