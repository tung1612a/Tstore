import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ["customer", "seller", "admin", "devadmin", "shipper"], default: "customer" },
  active: { type: Boolean, default: true },
  businessName: { type: String },
  businessDescription: { type: String },
  taxCode: { type: String },
  cccd: { type: String },
  // Seller store profile
  avatarUrl: { type: String },
  // Email verification
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, default: null },
  emailVerificationCode: { type: String, default: null },
  emailVerificationCodeExpires: { type: Date, default: null },

}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", userSchema);
