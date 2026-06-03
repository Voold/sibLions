import { eq, inArray, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../db/index.js";
import { orders, pointsHistory, products, users } from "../db/schema.js";
import type { Product, ShopCheckoutResult } from "../types/shop.types.js";

const selectProductFields = {
  uuid: products.uuid,
  name: products.name,
  description: products.description,
  price: products.price,
  image: products.image,
  points: products.points,
};

const mapProduct = (product: {
  uuid: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  points: number;
}): Product => ({
  uuid: product.uuid,
  name: product.name,
  description: product.description ?? "",
  price: product.price,
  image: product.image,
  points: product.points,
});

export const getAllProducts = async (): Promise<Product[]> => {
  const result = await db.select(selectProductFields).from(products);

  return result.map(mapProduct);
};

export const getProductByUuid = async (
  uuid: string,
): Promise<Product | null> => {
  const result = await db
    .select(selectProductFields)
    .from(products)
    .where(eq(products.uuid, uuid))
    .limit(1);

  return result[0] ? mapProduct(result[0]) : null;
};

export const checkoutProducts = async (
  userId: number,
  items: Array<{ item: string; count: number }>,
): Promise<ShopCheckoutResult> => {
  if (items.length === 0) {
    throw new Error("No products provided");
  }

  return await db.transaction(async (tx) => {
    const [user] = await tx
      .select({ id: users.id, totalPoints: users.totalPoints })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      throw new Error("User not found");
    }

    const currentPoints = user.totalPoints ?? 0;

    const uniqueUuids = [...new Set(items.map((i) => i.item))];
    const productRows = await tx
      .select({
        id: products.id,
        uuid: products.uuid,
        name: products.name,
        points: products.points,
      })
      .from(products)
      .where(inArray(products.uuid, uniqueUuids));

    if (productRows.length !== uniqueUuids.length) {
      throw new Error("Some products were not found");
    }

    const productMap = new Map(
      productRows.map((product) => [product.uuid, product]),
    );

    const spentPoints = items.reduce((total, it) => {
      const product = productMap.get(it.item);

      if (!product) {
        throw new Error("Some products were not found");
      }

      return total + product.points * it.count;
    }, 0);

    if (currentPoints < spentPoints) {
      throw new Error("Insufficient points balance");
    }

    const createdAt = new Date();
    const insertedOrders = await tx
      .insert(orders)
      .values(
        items.map((it) => {
          const product = productMap.get(it.item);

          if (!product) {
            throw new Error("Some products were not found");
          }

          return {
            uuid: randomUUID(),
            userId,
            productId: product.id,
            quantity: it.count,
            totalPoints: product.points * it.count,
            status: "pending",
            createdAt,
            updatedAt: createdAt,
          };
        }),
      )
      .returning();

    const remainingPoints = currentPoints - spentPoints;

    await tx
      .update(users)
      .set({ totalPoints: remainingPoints })
      .where(eq(users.id, userId));

    await tx.insert(pointsHistory).values({
      userId,
      points: -spentPoints,
      pointsType: "shop_order",
      description: `Shop order: ${items.map((i) => `${i.item}x${i.count}`).join(", ")}`,
    });

    return {
      orders: insertedOrders,
      spentPoints,
      remainingPoints,
    };
  });
};

export const getAllOrders = async () => {
  const allOrders = await db
    .select({
      id: orders.id,
      uuid: orders.uuid,
      status: orders.status,
      quantity: orders.quantity,
      totalPoints: orders.totalPoints,
      createdAt: orders.createdAt,
      updatedAt: orders.updatedAt,
      // Информация о пользователе
      user: {
        id: users.id,
        username: users.username,
        firstName: users.firstName,
        lastName: users.lastName,
      },
      // Информация о товаре
      product: {
        uuid: products.uuid,
        name: products.name,
        image: products.image,
        price: products.price,
        points: products.points,
      },
    })
    .from(orders)
    .innerJoin(products, eq(orders.productId, products.id))
    .innerJoin(users, eq(orders.userId, users.id))
    .orderBy(desc(orders.createdAt)); // Сортируем от новых к старым

  return allOrders;
};

export const updateOrderStatus = async (uuid: string, newStatus: string) => {
  return await db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orders)
      .where(eq(orders.uuid, uuid))
      .limit(1);

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === newStatus) {
      return order;
    }

    if (newStatus === "cancelled" && order.status !== "cancelled") {
      const [user] = await tx
        .select({ id: users.id, totalPoints: users.totalPoints })
        .from(users)
        .where(eq(users.id, order.userId))
        .limit(1);

      if (user) {
        const refundedPoints = (user.totalPoints ?? 0) + order.totalPoints;

        await tx
          .update(users)
          .set({ totalPoints: refundedPoints })
          .where(eq(users.id, user.id));

        await tx.insert(pointsHistory).values({
          userId: user.id,
          points: order.totalPoints,
          pointsType: "refund",
          description: `Возврат баллов за отмененный заказ мерча: ${uuid}`,
        });
      }
    }

    const [updatedOrder] = await tx
      .update(orders)
      .set({ 
        status: newStatus, 
        updatedAt: new Date() 
      })
      .where(eq(orders.uuid, uuid))
      .returning();

    return updatedOrder;
  });
};