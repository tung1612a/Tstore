import mongoose from "mongoose";

const storeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  description: String,
}, { timestamps: true });

export default mongoose.model("Store", storeSchema);
