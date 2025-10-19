import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import addressRoutes from "./routes/addressRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.get("/", (req, res) => res.send("API is running..."));

app.use("/api/home", homeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seller", sellerRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
