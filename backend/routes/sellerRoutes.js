import express from "express";
import { protect, sellerOnly } from "../middleware/authMiddleware.js";
import { getSellerDashboard, getSellerProducts, createProduct, updateProduct, deleteProduct, getSellerOrders, getSellerDebugData, getSellerInventories, updateInventory } from "../controllers/sellerController.js";

const router = express.Router();

// Tất cả routes seller đều cần xác thực và chỉ seller mới truy cập được
router.use(protect);
router.use(sellerOnly);

// Dashboard seller
router.get("/dashboard", getSellerDashboard);
router.get("/debug", getSellerDebugData);

// Quản lý sản phẩm
router.get("/products", getSellerProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Quản lý đơn hàng
router.get("/orders", getSellerOrders);

// Quản lý tồn kho
router.get("/inventories", getSellerInventories);
router.put("/inventories/:id", updateInventory);

export default router;
