import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  // Prefer field name 'image' as per existing DB
  image: String,
  // Keep backward compatibility if some docs still use imageURL
  imageURL: String,
  stock: { type: Number, default: 0 },
  // Follow existing DB: sellerId ref User
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  // Optional: categoryId from DB
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  isAuction: { type: Boolean, default: false },
  auctionEndTime: { type: Date, default: null },
}, { timestamps: true });

export default mongoose.model("Product", productSchema);