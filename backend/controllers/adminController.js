import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";

// Dashboard stats cho admin
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: "seller" });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("-password");

    res.json({
      stats: {
        totalUsers,
        totalSellers,
        totalProducts,
        totalOrders
      },
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy tất cả users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy user theo ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật user
export const updateUser = async (req, res) => {
  try {
    const { fullName, email, phone, role, active } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ message: "User not found" });

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;
    user.active = active !== undefined ? active : user.active;

    await user.save();
    
    const userObj = user.toObject();
    delete userObj.password;
    res.json(userObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa user
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 📊 Lấy báo cáo doanh thu của tất cả seller
export const getAllSellerReports = async (req, res) => {
  try {
    // Chỉ cho admin hoặc devadmin
    if (!["admin", "devadmin"].includes(req.user.role)) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập." });
    }

    // Lấy danh sách tất cả seller
    const sellers = await User.find({ role: "seller" }).select("_id fullName email businessName");

    const reports = [];

    for (const seller of sellers) {
      const products = await Product.find({ sellerId: seller._id });
      const productIds = products.map((p) => p._id);

      const orderItems = await OrderItem.find({ productId: { $in: productIds } }).populate("orderId");

      const orderIds = [...new Set(orderItems.map((i) => i.orderId?._id).filter(Boolean))];
      const orders = await Order.find({ _id: { $in: orderIds } });

      const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
      const totalOrders = orders.length;
      const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

      reports.push({
        sellerId: seller._id,
        sellerName: seller.businessName || seller.fullName,
        email: seller.email,
        totalRevenue,
        totalOrders,
        avgOrderValue,
      });
    }

    res.json(reports);
  } catch (error) {
    console.error("getAllSellerReports error:", error);
    res.status(500).json({ message: error.message });
  }
};
