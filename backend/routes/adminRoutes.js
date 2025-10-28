import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getAllUsers, getUserById, updateUser, deleteUser, getDashboardStats, getAllSellerReports } from "../controllers/adminController.js";

const router = express.Router();

// Tất cả routes admin đều cần xác thực và chỉ admin mới truy cập được
router.use(protect);
router.use(adminOnly);

// Dashboard admin
router.get("/dashboard", getDashboardStats);

// Quản lý users
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Báo cáo doanh thu seller
router.get("/seller-reports", getAllSellerReports);

export default router;
