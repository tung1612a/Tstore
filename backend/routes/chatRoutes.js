import express from "express";
import {
  getOrCreateConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  getConversation,
} from "../controllers/chatController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tất cả routes đều cần authenticate
router.use(protect);

// Tạo hoặc lấy conversation
router.post("/conversations", getOrCreateConversation);

// Lấy tất cả conversations của user hiện tại
router.get("/conversations", getMyConversations);

// Lấy một conversation cụ thể
router.get("/conversations/:conversationId", getConversation);

// Lấy messages của một conversation
router.get("/conversations/:conversationId/messages", getMessages);

// Gửi message
router.post("/messages", sendMessage);

export default router;

