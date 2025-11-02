import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createComplaint,
  getSellerComplaints,
  getBuyerComplaints,
  respondToComplaint,
  getComplaintDetails,
  escalateToAdmin,
  getAdminComplaints,
  resolveComplaintByAdmin,
} from '../controllers/complaintController.js';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// multer setup for complaint images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '') || '.png';
    cb(null, `complaint-${unique}${ext}`);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh'));
    }
  }
});

router.use(protect);
router.post('/', upload.array('images', 5), createComplaint); // Max 5 images
router.get('/seller', getSellerComplaints);
router.get('/buyer', getBuyerComplaints);
router.get('/admin', getAdminComplaints); // Admin xem complaints đã nâng cấp
router.get('/:id', getComplaintDetails);
router.put('/:id/respond', respondToComplaint);
router.put('/:id/escalate', escalateToAdmin); // Buyer nâng cấp khiếu nại lên admin
router.put('/:id/admin-resolve', resolveComplaintByAdmin); // Admin giải quyết khiếu nại

export default router;

