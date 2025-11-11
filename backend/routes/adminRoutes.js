import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import { getAllUsers, getUserById, updateUser, deleteUser, getDashboardStats, getAllSellerReports, getAllStores, getStoreDetail, updateStoreStatus, debugInfo, toggleStoreActive } from "../controllers/adminController.js";

const router = express.Router();

// Tất cả routes admin đều cần xác thực và chỉ admin mới truy cập được
router.use(protect);
router.use(adminOnly);

// Debug endpoint
router.get("/debug", debugInfo);

// Dashboard admin
router.get("/dashboard", getDashboardStats);

// Quản lý users
router.get("/users", getAllUsers);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

// Báo cáo doanh thu seller
router.get("/seller-reports", getAllSellerReports);

// Quản lý stores
router.get("/stores", getAllStores);
router.get("/stores/:storeId", getStoreDetail);
router.put("/stores/:storeId/status", updateStoreStatus);
router.put("/stores/:storeId/active", toggleStoreActive);

export default router;
