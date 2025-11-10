import mongoose from "mongoose";

const pendingRegistrationSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Đã được hash
  phone: { type: String },
  role: { type: String, enum: ["customer", "seller", "admin"], default: "customer" },
  avatarURL: { type: String, default: "" },
  // OTP verification
  emailVerificationCode: { type: String, required: true },
  emailVerificationCodeExpires: { type: Date, required: true },
  // TTL field để tự động xóa sau khi hết hạn
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// Tự động xóa các bản ghi hết hạn (sau 10 phút + 1 phút buffer)
pendingRegistrationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("PendingRegistration", pendingRegistrationSchema);

