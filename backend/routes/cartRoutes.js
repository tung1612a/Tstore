import express from "express";

// Minimal cart router to unblock server startup
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Cart API" });
});

export default router;



