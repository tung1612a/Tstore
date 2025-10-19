import express from "express";
import { register, login, getMe, checkEmail } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/check-email", checkEmail); // ✅ API mới

export default router;
