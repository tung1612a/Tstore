import express from "express";

// Minimal order router to unblock server startup
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Orders API" });
});

export default router;




