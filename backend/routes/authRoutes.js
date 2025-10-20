import express from "express";
import { register, login, getMe, checkEmail, changePassword } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgot-password", checkEmail);
router.post("/change-password", protect, changePassword);

export default router;
