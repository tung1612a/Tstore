import express from "express";
import { protect, sellerOnly } from "../middleware/authMiddleware.js";
import { getSellerDashboard, getSellerProducts, createProduct, updateProduct, deleteProduct, getSellerOrders, getSellerDebugData, getSellerInventories, updateInventory, getSellerReports, updateSellerSettings, getMyStore, updateMyStore, uploadSellerAvatar, uploadStoreBanner } from "../controllers/sellerController.js";
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Tất cả routes seller đều cần xác thực và chỉ seller mới truy cập được
router.use(protect);
router.use(sellerOnly);

// Dashboard seller
router.get("/dashboard", getSellerDashboard);
router.get("/debug", getSellerDebugData);

// Quản lý sản phẩm
router.get("/products", getSellerProducts);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Quản lý đơn hàng
router.get("/orders", getSellerOrders);

// Quản lý tồn kho
router.get("/inventories", getSellerInventories);
router.put("/inventories/:id", updateInventory);

//Reports
router.get("/reports", getSellerReports);

// Settings
router.put("/settings", updateSellerSettings);
// file uploads for settings
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '') || '.png';
    const base = file.fieldname === 'banner' ? 'store-banner' : 'avatar';
    cb(null, `${base}-${unique}${ext}`);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  }
});
router.put('/settings/avatar', upload.single('avatar'), uploadSellerAvatar);
router.get("/store", getMyStore);
router.put("/store", updateMyStore);
router.put('/store/banner', upload.single('banner'), uploadStoreBanner);

export default router;
