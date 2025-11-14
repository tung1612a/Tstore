import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function() {
      return this.conversationType === 'customer-seller';
    },
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sellerId2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function() {
      return this.conversationType === 'seller-seller';
    },
  },
  conversationType: {
    type: String,
    enum: ['customer-seller', 'seller-seller'],
    default: 'customer-seller',
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
  seller2UnreadCount: {
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
conversationSchema.index({ customerId: 1, sellerId: 1 }, { unique: true, sparse: true });
// Đảm bảo chỉ có 1 conversation duy nhất giữa 2 sellers
conversationSchema.index({ sellerId: 1, sellerId2: 1, conversationType: 1 }, { unique: true, sparse: true });

export default mongoose.model("Conversation", conversationSchema);


