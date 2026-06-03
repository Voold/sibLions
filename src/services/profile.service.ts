import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { orders, products, pointsHistory } from "../db/schema.js";
import type {
  Order,
  Achievement,
  PointsEntry,
} from "../types/profile.types.js";

const formatOrderDate = (value: Date | null | undefined) => {
  const date = value ?? new Date();

  return date.toLocaleDateString("ru-RU");
};

const formatOrderTime = (value: Date | null | undefined) => {
  const date = value ?? new Date();

  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 1,
    icon: "🔥",
    title: "Первый код",
    description: 'Написал "Hello World"',
    achieved: true,
  },
  {
    id: 2,
    icon: "🚀",
    title: "Деплой",
    description: "Запустил сервер на проде",
    achieved: false,
  },
];

export const getUserOrders = async (userId: number): Promise<Order[]> => {
  const userOrders = await db
    .select({
      id: orders.id,
      image: products.image,
      product: products.name,
      description: products.description,
      price: products.price,
      points: products.points,
      quantity: orders.quantity,
      status: orders.status,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(products, eq(orders.productId, products.id))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

  return userOrders.map((order) => ({
    id: order.id,
    image: order.image,
    product: order.product,
    description: order.description ?? "",
    price: String(order.price),
    status: (order.status ?? "pending") as Order["status"],
    time: formatOrderTime(order.createdAt),
    date: formatOrderDate(order.createdAt),
    points: order.points,
    quantity: order.quantity ?? 1,
  }));
};
export const getUserAchievements = async () => MOCK_ACHIEVEMENTS;

export const getUserPointsHistory = async (
  userId: number,
): Promise<PointsEntry[]> => {
  const rows = await db
    .select({
      id: pointsHistory.id,
      points: pointsHistory.points,
      pointsType: pointsHistory.pointsType,
      description: pointsHistory.description,
      eventId: pointsHistory.eventId,
      registrationId: pointsHistory.registrationId,
      createdAt: pointsHistory.createdAt,
    })
    .from(pointsHistory)
    .where(eq(pointsHistory.userId, userId))
    .orderBy(desc(pointsHistory.createdAt));

  return rows.map((r) => ({
    id: r.id,
    points: r.points,
    pointsType: r.pointsType ?? null,
    description: r.description ?? null,
    eventId: r.eventId ?? null,
    registrationId: r.registrationId ?? null,
    createdAt: r.createdAt
      ? r.createdAt.toISOString()
      : new Date().toISOString(),
  }));
};
