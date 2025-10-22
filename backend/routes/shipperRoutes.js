import express from "express";
import { protect, shipperOnly, adminOnly } from "../middleware/authMiddleware.js";
import { 
  getShipperDashboard, 
  getShipperOrders, 
  getShipperOrderDetails,
  updateOrderToShipped,
  updateOrderToCompleted,
  getUnassignedOrders,
  assignOrderToShipper,
  getAllShippers
} from "../controllers/shipperController.js";

const router = express.Router();

// Tất cả routes shipper đều cần xác thực
router.use(protect);

// Routes dành cho shipper
router.get("/dashboard", shipperOnly, getShipperDashboard);
router.get("/orders", shipperOnly, getShipperOrders);
router.get("/orders/:id", shipperOnly, getShipperOrderDetails);
router.put("/orders/:id/ship", shipperOnly, updateOrderToShipped);
router.put("/orders/:id/complete", shipperOnly, updateOrderToCompleted);

// Routes dành cho admin (quản lý shipper và assign đơn hàng)
router.get("/unassigned-orders", adminOnly, getUnassignedOrders);
router.post("/assign-order", adminOnly, assignOrderToShipper);
router.get("/all-shippers", adminOnly, getAllShippers);

export default router;
