import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  totalPrice: Number,
  status: { type: String, enum: ["pending", "paid", "shipped", "completed", "cancelled"], default: "pending" },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
