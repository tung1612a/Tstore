import User from "../models/User.js";
import SellerApplication from "../models/SellerApplication.js";
import PendingRegistration from "../models/PendingRegistration.js";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

// Tạo mã OTP 6 số
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Đăng ký
export const register = async (req, res) => {
  try {
    const { fullName, email, password, phone, role, active, avatarURL } = req.body;

    if (!fullName || !email || !password)
      return res.status(400).json({ message: "fullName, email and password are required" });

    // Kiểm tra xem email đã được đăng ký chưa (trong User hoặc PendingRegistration)
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const existingPending = await PendingRegistration.findOne({ email });
    if (existingPending) {
      // Nếu có pending registration, xóa và tạo mới
      await PendingRegistration.deleteOne({ email });
    }

    const allowedRoles = ["customer", "seller", "admin"];
    const finalRole = allowedRoles.includes(role) ? role : "customer";

    // Hash password trước khi lưu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo mã OTP 6 số
    const emailVerificationCode = generateOTP();
    const emailVerificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // Hết hạn sau 10 phút

    console.log('Creating pending registration with email:', email, 'OTP code:', emailVerificationCode);

    // Lưu vào PendingRegistration thay vì User
    const pendingRegistration = await PendingRegistration.create({
      fullName,
      email,
      password: hashedPassword, // Đã hash
      phone,
      role: finalRole,
      avatarURL: avatarURL || "",
      emailVerificationCode,
      emailVerificationCodeExpires,
      expiresAt: new Date(Date.now() + 11 * 60 * 1000), // TTL: 11 phút (10 phút OTP + 1 phút buffer)
    });

    console.log('Pending registration created:', pendingRegistration._id);

    // Gửi email xác nhận với mã OTP
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
          subject: "Mã xác nhận đăng ký - Tstore",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #28a745;">Chào mừng đến với Tstore!</h2>
              <p>Xin chào <strong>${fullName}</strong>,</p>
              <p>Cảm ơn bạn đã đăng ký tài khoản tại Tstore. Để hoàn tất đăng ký, vui lòng nhập mã xác nhận sau:</p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #f8f9fa; border: 2px dashed #28a745; border-radius: 10px; padding: 20px; display: inline-block;">
                  <p style="margin: 0; font-size: 14px; color: #666; margin-bottom: 10px;">Mã xác nhận của bạn:</p>
                  <p style="margin: 0; font-size: 32px; font-weight: bold; color: #28a745; letter-spacing: 5px;">${emailVerificationCode}</p>
                </div>
              </div>
              <p style="color: #999; font-size: 12px;">Mã này sẽ hết hạn sau 10 phút.</p>
              <p>Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">Trân trọng,<br>Đội ngũ Tstore</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Verification email sent to:', email);
      } catch (mailErr) {
        console.error('Error sending verification email:', mailErr);
        // Xóa pending registration nếu không gửi được email
        await PendingRegistration.deleteOne({ email });
        return res.status(500).json({ message: "Không thể gửi email xác nhận. Vui lòng thử lại sau." });
      }
    }

    res.status(201).json({
      message: "Đăng ký thành công! Vui lòng kiểm tra email để lấy mã xác nhận.",
      email: email,
      emailSent: !!(emailUser && emailPass),
    });
  } catch (err) {
    console.error('Register error:', err);
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

    // Kiểm tra trạng thái active của user
    if (user.active === false) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa" });
    }

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
function generateRandomPassword(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Forgot password: Reset về 123456789 & gửi email
export const checkEmail = async (req, res) => {
  try {
    
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại trong hệ thống" });
    const newPassword = generateRandomPassword(); 
;

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

// Become seller for authenticated user - tạo đơn đăng ký
export const becomeSeller = async (req, res) => {
  try {
    const { phone, businessName, businessDescription, cccd } = req.body;
    const userId = req.user._id;
    const user = req.user;

    if (!phone || !businessName || !cccd) {
      return res.status(400).json({ message: "Phone, business name and CCCD are required" });
    }

    // Validation cho CCCD (12 số)
    if (!/^\d{12}$/.test(cccd)) {
      return res.status(400).json({ message: "CCCD must be exactly 12 digits" });
    }

    // Kiểm tra xem user đã là seller chưa
    if (user.role === 'seller') {
      return res.status(400).json({ message: "You are already a seller" });
    }

    // Kiểm tra xem user đã có đơn đăng ký pending chưa
    // Nếu có đơn pending thì không cho tạo mới
    // Nếu có đơn rejected thì cho phép tạo đơn mới (reapply)
    const existingPendingApplication = await SellerApplication.findOne({
      userId: userId,
      status: 'pending'
    });

    if (existingPendingApplication) {
      return res.status(400).json({ message: "You already have a pending seller application" });
    }

    // Tạo đơn đăng ký seller
    const application = await SellerApplication.create({
      userId: userId,
      fullName: user.fullName,
      email: user.email,
      phone: phone,
      businessName: businessName,
      businessDescription: businessDescription || '',
      cccd: cccd,
      status: 'pending'
    });

    res.json({
      message: "Seller application submitted successfully. Please wait for admin approval.",
      application: application
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get seller applications for admin
export const getSellerApplications = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};
    
    if (status) {
      filter.status = status;
    }

    const applications = await SellerApplication.find(filter)
      .populate('userId', 'fullName email role')
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 });

    res.json(applications);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Review seller application (approve/reject)
export const reviewSellerApplication = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { action, rejectionReason, notes } = req.body;
    const adminId = req.user._id;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: "Action must be 'approve' or 'reject'" });
    }

    const application = await SellerApplication.findById(applicationId);
    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    if (application.status !== 'pending') {
      return res.status(400).json({ message: "Application has already been reviewed" });
    }

    // Cập nhật trạng thái đơn đăng ký
    application.status = action === 'approve' ? 'approved' : 'rejected';
    application.reviewedBy = adminId;
    application.reviewedAt = new Date();
    application.rejectionReason = action === 'reject' ? rejectionReason : '';
    application.notes = notes || '';

    await application.save();

    // Nếu approve, cập nhật role của user thành seller
    if (action === 'approve') {
      await User.findByIdAndUpdate(application.userId, {
        role: 'seller',
        phone: application.phone,
        businessName: application.businessName,
        businessDescription: application.businessDescription,
        cccd: application.cccd
      });
    }

    res.json({
      message: `Application ${action}d successfully`,
      application: application
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Get user's seller application status
export const getMySellerApplication = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const application = await SellerApplication.findOne({ userId })
      .populate('reviewedBy', 'fullName email')
      .sort({ createdAt: -1 });

    if (!application) {
      return res.status(404).json({ message: "No seller application found" });
    }

    res.json(application);
  } catch (err) {
    console.error(err);
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

// Update avatar URL for current user
export const updateAvatar = async (req, res) => {
  try {
    const userId = req.user.id;
    // Support both JSON url or multipart file upload
    const { avatarUrl } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.file && req.file.path) {
      // If using multer local storage
      user.avatarUrl = `/uploads/${req.file.filename}`;
    } else if (avatarUrl && typeof avatarUrl === 'string') {
      user.avatarUrl = avatarUrl;
    } else {
      return res.status(400).json({ message: 'No avatar provided' });
    }
    await user.save();
    const sanitized = await User.findById(userId).select('-password');
    res.json({ message: 'Avatar updated', user: sanitized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Update profile information for current user
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Update only provided fields
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;

    await user.save();
    
    const sanitized = await User.findById(userId).select('-password');
    res.json({ message: 'Profile updated successfully', user: sanitized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Xác nhận email
export const verifyEmail = async (req, res) => {
  try {
    let { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token xác nhận không hợp lệ" });
    }

    // Decode URL encoding nếu có
    try {
      token = decodeURIComponent(token);
    } catch (e) {
      // Nếu không decode được thì dùng token gốc
    }

    // Giải mã token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");
    } catch (err) {
      console.error('JWT verification error:', err.message);
      return res.status(400).json({ message: "Token xác nhận đã hết hạn hoặc không hợp lệ" });
    }

    const { email } = decoded;
    console.log('Verifying email for:', email);

    // Tìm user theo email (không cần so sánh token vì JWT đã được verify)
    const user = await User.findOne({ email });

    if (!user) {
      console.log('User not found for email:', email);
      return res.status(404).json({ message: "Không tìm thấy tài khoản với email này" });
    }

    console.log('User found:', user.email, 'emailVerified:', user.emailVerified, 'hasToken:', !!user.emailVerificationToken);

    // Kiểm tra xem email đã được xác nhận chưa
    if (user.emailVerified) {
      return res.status(400).json({ message: "Email đã được xác nhận trước đó" });
    }

    // Kiểm tra xem user có token xác nhận không (để đảm bảo token này được tạo cho user này)
    if (!user.emailVerificationToken) {
      console.log('User has no verification token');
      return res.status(400).json({ message: "Token xác nhận không hợp lệ hoặc đã được sử dụng" });
    }

    // Cập nhật trạng thái xác nhận email
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.active = true; // Kích hoạt tài khoản sau khi xác nhận email
    await user.save();

    console.log('Email verified successfully for:', email);

    const userObj = user.toObject();
    delete userObj.password;
    delete userObj.emailVerificationToken;

    res.json({
      message: "Email đã được xác nhận thành công! Bạn có thể đăng nhập ngay bây giờ.",
      user: userObj,
    });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ message: err.message });
  }
};

// Xác nhận mã OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: "Email và mã xác nhận là bắt buộc" });
    }

    // Tìm trong PendingRegistration
    const pendingRegistration = await PendingRegistration.findOne({ email });

    if (!pendingRegistration) {
      // Kiểm tra xem có phải user đã được tạo chưa
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Tài khoản đã được tạo. Vui lòng đăng nhập." });
      }
      return res.status(404).json({ message: "Không tìm thấy thông tin đăng ký. Vui lòng đăng ký lại." });
    }

    // Kiểm tra mã OTP
    if (!pendingRegistration.emailVerificationCode) {
      return res.status(400).json({ message: "Mã xác nhận không hợp lệ hoặc đã hết hạn" });
    }

    // Kiểm tra mã OTP có khớp không
    if (pendingRegistration.emailVerificationCode !== code) {
      return res.status(400).json({ message: "Mã xác nhận không đúng" });
    }

    // Kiểm tra mã OTP có hết hạn không
    if (new Date() > pendingRegistration.emailVerificationCodeExpires) {
      // Xóa pending registration hết hạn
      await PendingRegistration.deleteOne({ email });
      return res.status(400).json({ message: "Mã xác nhận đã hết hạn. Vui lòng đăng ký lại." });
    }

    // Tạo User từ PendingRegistration
    const user = await User.create({
      fullName: pendingRegistration.fullName,
      email: pendingRegistration.email,
      password: pendingRegistration.password, // Đã được hash rồi
      phone: pendingRegistration.phone,
      role: pendingRegistration.role,
      active: true,
      avatarURL: pendingRegistration.avatarURL,
      emailVerified: true,
    });

    console.log('User created from pending registration:', user._id, 'email:', email);

    // Xóa PendingRegistration sau khi tạo User thành công
    await PendingRegistration.deleteOne({ email });

    const userObj = user.toObject();
    delete userObj.password;

    res.json({
      message: "Email đã được xác nhận thành công! Bạn có thể đăng nhập ngay bây giờ.",
      user: userObj,
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    
    // Nếu lỗi do duplicate email (đã có user), xóa pending registration
    if (err.code === 11000) {
      await PendingRegistration.deleteOne({ email: req.body.email });
      return res.status(400).json({ message: "Tài khoản đã tồn tại. Vui lòng đăng nhập." });
    }
    
    res.status(500).json({ message: err.message });
  }
};

// Gửi lại mã OTP
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email là bắt buộc" });
    }

    // Kiểm tra xem user đã được tạo chưa
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Tài khoản đã được tạo. Vui lòng đăng nhập." });
    }

    // Tìm trong PendingRegistration
    const pendingRegistration = await PendingRegistration.findOne({ email });

    if (!pendingRegistration) {
      return res.status(404).json({ message: "Không tìm thấy thông tin đăng ký. Vui lòng đăng ký lại." });
    }

    // Tạo mã OTP mới
    const emailVerificationCode = generateOTP();
    const emailVerificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // Hết hạn sau 10 phút

    pendingRegistration.emailVerificationCode = emailVerificationCode;
    pendingRegistration.emailVerificationCodeExpires = emailVerificationCodeExpires;
    pendingRegistration.expiresAt = new Date(Date.now() + 11 * 60 * 1000); // Cập nhật TTL
    await pendingRegistration.save();

    // Gửi email
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
          subject: "Mã xác nhận đăng ký - Tstore",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #28a745;">Mã xác nhận mới</h2>
              <p>Xin chào <strong>${pendingRegistration.fullName}</strong>,</p>
              <p>Vui lòng nhập mã xác nhận sau để hoàn tất đăng ký:</p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #f8f9fa; border: 2px dashed #28a745; border-radius: 10px; padding: 20px; display: inline-block;">
                  <p style="margin: 0; font-size: 14px; color: #666; margin-bottom: 10px;">Mã xác nhận của bạn:</p>
                  <p style="margin: 0; font-size: 32px; font-weight: bold; color: #28a745; letter-spacing: 5px;">${emailVerificationCode}</p>
                </div>
              </div>
              <p style="color: #999; font-size: 12px;">Mã này sẽ hết hạn sau 10 phút.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px;">Trân trọng,<br>Đội ngũ Tstore</p>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Verification code resent to:', email);
        return res.json({ message: "Mã xác nhận đã được gửi lại. Vui lòng kiểm tra hộp thư của bạn." });
      } catch (mailErr) {
        console.error('Error sending verification email:', mailErr);
        return res.status(500).json({ message: "Không thể gửi email. Vui lòng thử lại sau." });
      }
    }

    return res.status(500).json({ message: "Hệ thống email chưa được cấu hình" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};