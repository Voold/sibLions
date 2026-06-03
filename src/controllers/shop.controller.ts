import type { Request, Response } from "express";
import * as shopService from "../services/shop.service.js";
import https from "https";

export const getProducts = async (req: Request, res: Response) => {
  const products = await shopService.getAllProducts();
  res.json(products);
};

export const getProductByUuid = async (req: Request, res: Response) => {
  const uuid = req.params.uuid as string;
  const product = await shopService.getProductByUuid(uuid);

  product
    ? res.json(product)
    : res.status(404).json({ message: "Product not found" });
};

export const checkout = async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const items = req.body?.items;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "items must be a non-empty array" });
  }

  if (
    items.some(
      (it: any) =>
        !it ||
        typeof it.item !== "string" ||
        !it.item.trim() ||
        typeof it.count !== "number" ||
        !Number.isInteger(it.count) ||
        it.count <= 0,
    )
  ) {
    return res.status(400).json({
      message:
        "items must contain objects with { item: uuid-string, count: positive integer }",
    });
  }

  try {
    const result = await shopService.checkoutProducts(userId, items);

    // Костыльные тесты, йоу
    const data = JSON.stringify({
      vkUserId: "268563605",
      text: "ВНИМАНИЕ! ВНИМАНИЕ! На платформе появился новый заказ! Скорее зайдите и посмотрите что там такое... ",
    });

    const options = {
      hostname: "spiritedly-unlimited-bullfrog.cloudpub.ru",
      path: "/api/notify",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": data.length,
      },
    };

    const req = https.request(options, (res) => {
      console.log(`statusCode: ${res.statusCode}`);

      res.on("data", (d) => {
        process.stdout.write(d);
      });
    });

    req.on("error", (error) => {
      console.error(error);
    });

    req.write(data);
    req.end();

    return res.status(201).json({
      message: "Order created successfully",
      ...result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";

    if (message === "User not found") {
      return res.status(404).json({ message });
    }

    if (message === "Some products were not found") {
      return res.status(404).json({ message });
    }

    if (message === "Insufficient points balance") {
      return res.status(400).json({ message });
    }

    if (message === "No products provided") {
      return res.status(400).json({ message });
    }

    return res.status(500).json({ message });
  }
};

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const ordersList = await shopService.getAllOrders();
    return res.json(ordersList);
  } catch (error) {
    console.error("Ошибка при получении всех заказов:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  const uuid = req.params.uuid as string;
  const { status } = req.body;

  const allowedStatuses = ["pending", "processing", "completed", "cancelled"];
  if (!status || !allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Allowed statuses: ${allowedStatuses.join(", ")}`,
    });
  }

  try {
    const updatedOrder = await shopService.updateOrderStatus(uuid, status);

    return res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Server error";

    if (message === "Order not found") {
      return res.status(404).json({ message });
    }

    console.error("Ошибка обновления статуса заказа:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
