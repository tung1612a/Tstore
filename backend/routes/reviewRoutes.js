import express from 'express';
import {
    createReview,
    getProductReviews,
    getUserProductReview,
    updateReview,
    deleteReview,
    markHelpful,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/product/:productId', getProductReviews);

// Protected routes
router.post('/', protect, createReview);
router.get('/product/:productId/user', protect, getUserProductReview);
router.put('/:id', protect, updateReview);
router.delete('/:id', protect, deleteReview);
router.post('/:id/helpful', protect, markHelpful);

export default router;