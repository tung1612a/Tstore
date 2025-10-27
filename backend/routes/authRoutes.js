import express from "express";
import { register, login, getMe, checkEmail, changePassword, becomeSeller, getSellerApplications, reviewSellerApplication, getMySellerApplication } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
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
router.post("/become-seller", protect, becomeSeller);
router.get("/my-seller-application", protect, getMySellerApplication);

// Admin routes
router.get("/seller-applications", protect, getSellerApplications);
router.post("/seller-applications/:applicationId/review", protect, reviewSellerApplication);

export default router;
