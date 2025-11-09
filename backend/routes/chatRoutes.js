import express from "express";
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  getConversation,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Tất cả routes đều cần authenticate
router.use(protect);

// Multer setup for chat images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '') || '.png';
    cb(null, `chat-${unique}${ext}`);
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

// Tạo hoặc lấy conversation
router.post("/conversations", getOrCreateConversation);

// Lấy tất cả conversations của user hiện tại
router.get("/conversations", getMyConversations);

// Lấy một conversation cụ thể
router.get("/conversations/:conversationId", getConversation);

// Lấy messages của một conversation
router.get("/conversations/:conversationId/messages", getMessages);

// Gửi message (có thể kèm ảnh)
router.post("/messages", upload.single('image'), sendMessage);

export default router;


