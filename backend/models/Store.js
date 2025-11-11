import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
  // Owner of the store
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Display name of the store
  storeName: { type: String, required: true },

  description: { type: String, default: "" },

  // Optional banner image URL
  bannerImageURL: { type: String, default: "" },

  // Workflow status for moderation/approval
  status: { type: String, enum: ["approved", "pending", "rejected"], default: "pending" },
  
  // Active status - khi false thì cửa hàng bị khóa
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model("Store", storeSchema);
