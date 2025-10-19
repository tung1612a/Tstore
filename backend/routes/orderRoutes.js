import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createOrder,
  getBuyerOrders,
  getSellerOrders,
  getOrderDetails,
  updateOrderStatus,
  cancelOrder,
} from '../controllers/orderController.js';

const router = express.Router();

router.use(protect);
router.post('/', createOrder);
router.get('/buyer', getBuyerOrders);
router.get('/seller', getSellerOrders);
router.get('/:id', getOrderDetails);
router.put('/:id/status', updateOrderStatus);
router.put('/:id/cancel', cancelOrder);

export default router;
