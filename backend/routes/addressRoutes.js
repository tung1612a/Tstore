import express from 'express';
const router = express.Router();

// Import các hàm từ controller
import {
    addAddress,
    getUserAddresses, // <-- Import hàm mới
    updateAddress,
    deleteAddress
} from '../controllers/addressController.js';

import { protect } from '../middleware/authMiddleware.js';

// Khi có yêu cầu GET đến '/', nó sẽ được xử lý bởi `getUserAddresses`
router.route('/')
    .get(protect, getUserAddresses) // <-- THÊM/SỬA LẠI DÒNG NÀY
    .post(protect, addAddress);

router.route('/:id')
    .put(protect, updateAddress)
    .delete(protect, deleteAddress);

export default router;