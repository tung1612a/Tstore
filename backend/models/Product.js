import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  imageURL: String,
  stock: { type: Number, default: 0 },
}, { timestamps: true });

// Bây giờ chỉ cần 2 tham số vì collection đã đổi tên thành "products"
export default mongoose.model("Product", productSchema);