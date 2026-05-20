import { eq, inArray } from "drizzle-orm";
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
  productUuids: string[],
): Promise<ShopCheckoutResult> => {
  if (productUuids.length === 0) {
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

    const uniqueUuids = [...new Set(productUuids)];
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

    const spentPoints = productUuids.reduce((total, productUuid) => {
      const product = productMap.get(productUuid);

      if (!product) {
        throw new Error("Some products were not found");
      }

      return total + product.points;
    }, 0);

    if (currentPoints < spentPoints) {
      throw new Error("Insufficient points balance");
    }

    const createdAt = new Date();
    const insertedOrders = await tx
      .insert(orders)
      .values(
        productUuids.map((productUuid) => {
          const product = productMap.get(productUuid);

          if (!product) {
            throw new Error("Some products were not found");
          }

          return {
            uuid: randomUUID(),
            userId,
            productId: product.id,
            quantity: 1,
            totalPoints: product.points,
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
      description: `Shop order: ${productUuids.join(", ")}`,
    });

    return {
      orders: insertedOrders,
      spentPoints,
      remainingPoints,
    };
  });
};
