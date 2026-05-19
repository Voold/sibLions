import { desc, eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { orders, products } from "../db/schema.js";
import type { Order, Achievement } from "../types/profile.types.js";

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
  }));
};
export const getUserAchievements = async () => MOCK_ACHIEVEMENTS;
