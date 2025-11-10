import express from "express";
import { register, login, getMe, checkEmail, changePassword, becomeSeller, getSellerApplications, reviewSellerApplication, getMySellerApplication, updateAvatar, updateProfile, verifyOTP, resendVerificationEmail } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from 'multer';
import path from 'path';

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-otp", verifyOTP);
router.post("/resend-verification-email", resendVerificationEmail);
router.get("/me", protect, getMe);
router.post("/forgot-password", async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) throw new Error("An email is required.");

		// delegate to controller which performs the reset + email sending
		return await checkEmail(req, res);
	} catch (error) {
		return res.status(400).json({ message: error.message });
	}
});
router.post("/change-password", protect, changePassword);
// multer setup (local disk)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'uploads'));
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '') || '.png';
    cb(null, `avatar-${unique}${ext}`);
  }
});
const upload = multer({ storage });

router.put("/avatar", protect, upload.single('avatar'), updateAvatar);
router.put("/profile", protect, updateProfile);
router.post("/become-seller", protect, becomeSeller);
router.get("/my-seller-application", protect, getMySellerApplication);

// Admin routes
router.get("/seller-applications", protect, getSellerApplications);
router.post("/seller-applications/:applicationId/review", protect, reviewSellerApplication);

export default router;
