import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Product", 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  lastUpdated: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

export default mongoose.model("Inventory", inventorySchema);
