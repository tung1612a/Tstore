import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart
} from "../controllers/cartController.js";

const router = express.Router();

// Tất cả routes đều cần đăng nhập
router.use(protect);

// Lấy giỏ hàng
router.get("/", getCart);

// Thêm sản phẩm vào giỏ hàng
router.post("/add", addToCart);

// Cập nhật số lượng sản phẩm
router.put("/update", updateQuantity);

// Xóa sản phẩm khỏi giỏ hàng
router.delete("/remove/:productId", removeFromCart);

// Xóa tất cả sản phẩm
router.delete("/clear", clearCart);

export default router;



