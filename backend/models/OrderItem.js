import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  quantity: Number,
  unitPrice: Number,
  status: { type: String, default: "active" },
}, { timestamps: true });

export default mongoose.model("OrderItem", orderItemSchema);
