import { Router } from "express";
import * as shopController from "../controllers/shop.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", shopController.getProducts);
router.get("/orders", authenticateToken, shopController.getAllOrders);
router.post("/orders", authenticateToken, shopController.checkout);
router.patch(
  "/orders/:uuid/status",
  authenticateToken,
  shopController.updateOrderStatus,
);
router.get("/:uuid", authenticateToken, shopController.getProductByUuid);

export default router;
