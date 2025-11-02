import mongoose from "mongoose";

const complaintSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  complaintType: { 
    type: String, 
    enum: ["quality", "wrong_item", "damaged", "missing", "late_delivery", "other"], 
    required: true 
  },
  description: { type: String, required: true },
  images: [{ type: String }], // Array of image URLs
  status: { 
    type: String, 
    enum: ["pending", "in_progress", "resolved", "rejected"], 
    default: "pending" 
  },
  response: { type: String },
  resolvedAt: { type: Date },
  escalatedToAdmin: { type: Boolean, default: false },
  escalatedAt: { type: Date },
}, { timestamps: true });

export default mongoose.model("Complaint", complaintSchema);

