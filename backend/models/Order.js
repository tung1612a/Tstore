import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  addressId: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  totalPrice: Number,
  status: { type: String, enum: ["pending", "confirmed", "awaiting_delivery", "shipping", "delivered", "completed", "cancelled"], default: "pending" },
  couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
  paymentMethod: { type: String, enum: ["cod", "bank_transfer", "momo", "zalopay"], default: "cod" },
  notes: { type: String },
  cancellationReason: { type: String },
  deliveryFailureReason: { type: String },
  confirmedAt: { type: Date },
  confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  shipperId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  shippedAt: { type: Date },
  deliveredAt: { type: Date },
  trackingNumber: { type: String },
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
