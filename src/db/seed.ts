import { randomUUID } from "crypto";
import { db } from "./index.js";
import { products } from "./schema.js";

const seedProducts = [
  {
    uuid: randomUUID(),
    name: "Худи",
    description: "Теплая толстовка для холодных вечеров и больших задач.",
    category: "clothing",
    price: 2500,
    points: 100,
    stock: 25,
    status: "active",
    image: null,
  },
  {
    uuid: randomUUID(),
    name: "Кружка",
    description: "Большая кружка для кофе, чая и вечного дедлайна.",
    category: "accessories",
    price: 800,
    points: 30,
    stock: 40,
    status: "active",
    image: null,
  },
  {
    uuid: randomUUID(),
    name: "Ручка",
    description: "Простая ручка для заметок, подписей и быстрых идей.",
    category: "accessories",
    price: 150,
    points: 10,
    stock: 100,
    status: "active",
    image: null,
  },
];

async function main() {
  const existingProducts = await db
    .select({ id: products.id })
    .from(products)
    .limit(1);

  if (existingProducts.length > 0) {
    console.log("Products already exist, skipping seed");
    process.exit(0);
  }

  await db.insert(products).values(seedProducts);
  console.log(`Seeded ${seedProducts.length} products`);
  process.exit(0);
}

main().catch((error) => {
  console.error("Seed failed!", error);
  process.exit(1);
});
