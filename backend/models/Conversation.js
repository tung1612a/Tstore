import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  lastMessage: {
    type: String,
    default: "",
  },
  lastMessageAt: {
    type: Date,
    default: Date.now,
  },
  customerUnreadCount: {
    type: Number,
    default: 0,
  },
  sellerUnreadCount: {
    type: Number,
    default: 0,
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null,
  },
}, { timestamps: true });

// Đảm bảo chỉ có 1 conversation duy nhất giữa 1 customer và 1 seller
conversationSchema.index({ customerId: 1, sellerId: 1 }, { unique: true });

export default mongoose.model("Conversation", conversationSchema);


