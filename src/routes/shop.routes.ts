import { Router } from "express";
import * as shopController from "../controllers/shop.controller.js";

const router = Router();

router.get("/", shopController.getProducts);
router.post("/orders", shopController.checkout);
router.get("/:uuid", shopController.getProductByUuid);

export default router;
