import User from "../models/User.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

// Đăng ký
export const register = async (req, res) => {
  try {
    const { fullName, email, password, phone, role, active, avatarURL } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ message: "fullName, email and password are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const allowedRoles = ["customer", "seller", "admin"];
    const finalRole = allowedRoles.includes(role) ? role : "customer";

    const user = await User.create({
      fullName,
      email,
      password,
      phone,
      role: finalRole,
      active,
      avatarURL,
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json(userObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Đăng nhập
export const login = async (req, res) => {
  try {
    const { email, username, password } = req.body;
    const identifier = email || username;
    if (!identifier || !password)
      return res.status(400).json({ message: "Email/username and password are required" });

    const user = await User.findOne({
      $or: [{ email: identifier }, { fullName: identifier }],
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid password" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "fallback_secret_key",
      { expiresIn: "1d" }
    );

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Lấy user hiện tại
export const getMe = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Forgot password: Reset về 123456789 & gửi email
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
    const newPassword = "123456789";

    // Set plain password and rely on User model pre-save hook to hash it
    user.password = newPassword;
    await user.save();

    // If email credentials are configured, try to send email; otherwise return the new password in response (dev mode)
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (emailUser && emailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user: emailUser, pass: emailPass },
        });

        const mailOptions = {
          from: `"Tstore Support" <${emailUser}>`,
          to: email,
          subject: "Password reset - Tstore",
          text: `Mật khẩu mới của bạn là: ${newPassword}. Vui lòng đăng nhập và đổi lại mật khẩu ngay.`,
        };

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: "Mật khẩu mới đã được gửi đến email của bạn" });
      } catch (mailErr) {
        // If sending email fails, inform the client but password has already been reset in DB
        console.error('Error sending reset email:', mailErr);
        return res.status(500).json({ message: "Đã reset mật khẩu nhưng không thể gửi email (cấu hình SMTP lỗi)" });
      }
    }

    // Email credentials not set — return new password in response for local/dev testing
    return res.status(200).json({ message: "Mật khẩu đã được reset (DEV MODE)", newPassword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }





};

// Change password for authenticated user
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "oldPassword, newPassword and confirmPassword are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) return res.status(401).json({ message: "Old password is incorrect" });

    // Set new password (pre-save hook in model will hash it)
    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
