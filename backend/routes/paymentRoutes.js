import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createPayment,
  processPayment,
  getUserPayments,
  getPaymentDetails
} from "../controllers/paymentController.js";

const router = express.Router();

// Tất cả routes đều cần đăng nhập
router.use(protect);

// Tạo thanh toán mới
router.post("/", createPayment);

// Xử lý thanh toán
router.post("/:id/process", processPayment);

// Lấy lịch sử thanh toán của user
router.get("/", getUserPayments);

// Lấy chi tiết thanh toán
router.get("/:id", getPaymentDetails);

export default router;
