import express from "express";
import { protect, shipperOnly, adminOnly, sellerOnly } from "../middleware/authMiddleware.js";
import { 
  getShipperDashboard, 
  getShipperOrders, 
  getShipperOrderDetails,
  updateOrderToShipped,
  updateOrderToCompleted,
  getUnassignedOrders,
  assignOrderToShipper,
  getAllShippers,
  getShippersWithStats,
  getShipperReports
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
router.get("/reports", shipperOnly, getShipperReports);

// Routes dành cho admin (quản lý shipper và assign đơn hàng)
router.get("/unassigned-orders", adminOnly, getUnassignedOrders);
router.post("/assign-order", adminOnly, assignOrderToShipper);
router.get("/all-shippers", adminOnly, getAllShippers);

router.get("/shippers-with-stats", sellerOnly, getShippersWithStats);

export default router;
