import type { Request, Response } from "express";
import * as shopService from "../services/shop.service.js";

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
  const productUuids = req.body?.productUuids;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!Array.isArray(productUuids) || productUuids.length === 0) {
    return res
      .status(400)
      .json({ message: "productUuids must be a non-empty array" });
  }

  if (
    productUuids.some(
      (productUuid: unknown) =>
        typeof productUuid !== "string" || !productUuid.trim(),
    )
  ) {
    return res
      .status(400)
      .json({ message: "productUuids must contain only uuid strings" });
  }

  try {
    const result = await shopService.checkoutProducts(userId, productUuids);

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
