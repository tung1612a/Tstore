import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createPayment, processPayment, getUserPayments, getPaymentDetails } from '../controllers/paymentController.js';

const router = express.Router();

router.use(protect);
router.post('/', createPayment);
router.post('/:id/process', processPayment);
router.get('/', getUserPayments);
router.get('/:id', getPaymentDetails);

export default router;
