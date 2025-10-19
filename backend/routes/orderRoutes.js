import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder
} from "../controllers/orderController.js";

const router = express.Router();

// Tất cả routes đều cần đăng nhập
router.use(protect);

// Tạo đơn hàng mới
router.post("/", createOrder);

// Lấy đơn hàng của buyer
router.get("/buyer", getBuyerOrders);

// Lấy đơn hàng của seller
router.get("/seller", getSellerOrders);

// Lấy chi tiết đơn hàng
router.get("/:id", getOrderDetails);

// Cập nhật trạng thái đơn hàng (seller)
router.put("/:id/status", updateOrderStatus);

// Hủy đơn hàng (buyer)
router.put("/:id/cancel", cancelOrder);

export default router;




