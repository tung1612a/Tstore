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
      // Lấy tất cả sản phẩm của seller
      const products = await Product.find({ sellerId: seller._id }).select("_id");
      const productIds = products.map((p) => p._id);

      // Nếu không có sản phẩm nào, bỏ qua
      if (productIds.length === 0) {
        reports.push({
          sellerId: seller._id,
          sellerName: seller.businessName || seller.fullName,
          email: seller.email,
          totalRevenue: 0,
          totalOrders: 0,
          avgOrderValue: 0,
          totalProducts: 0,
        });
        continue;
      }

      // Lấy tất cả OrderItem của seller (qua productId)
      const orderItems = await OrderItem.find({ productId: { $in: productIds } });

      // Tính tổng doanh thu từ các OrderItem
      const totalRevenue = orderItems.reduce((sum, item) => {
        return sum + (item.unitPrice * item.quantity);
      }, 0);

      // Lấy danh sách orderId unique
      const orderIds = [...new Set(orderItems.map(item => item.orderId?.toString()).filter(Boolean))];
      
      // Lấy các order liên quan
      const orders = await Order.find({ _id: { $in: orderIds } });

      const totalOrders = orders.length;
      const avgOrderValue = totalOrders ? totalRevenue / totalOrders : 0;

      reports.push({
        sellerId: seller._id,
        sellerName: seller.businessName || seller.fullName,
        email: seller.email,
        totalRevenue,
        totalOrders,
        avgOrderValue,
        totalProducts: productIds.length,
      });
    }

    // Sắp xếp theo doanh thu giảm dần
    reports.sort((a, b) => b.totalRevenue - a.totalRevenue);

    res.json(reports);
  } catch (error) {
    console.error("getAllSellerReports error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả các store trong hệ thống
export const getAllStores = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, search = "" } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Import Store model
    const Store = (await import("../models/Store.js")).default;
    const Review = (await import("../models/Review.js")).default;

    // Build filter
    const filter = {};
    if (status && status !== "all") {
      filter.status = status;
    }
    if (search) {
      filter.storeName = { $regex: search, $options: "i" };
    }

    // Get total count
    const total = await Store.countDocuments(filter);

    // Get stores with seller info
    const stores = await Store.find(filter)
      .populate("sellerId", "fullName email avatarUrl")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Enrich stores with product count and review count
    const storesWithStats = await Promise.all(
      stores.map(async (store) => {
        const [productCount, reviewCount] = await Promise.all([
          Product.countDocuments({ sellerId: store.sellerId._id }),
          Review.countDocuments({ sellerId: store.sellerId._id })
        ]);
        
        const storeObj = store.toObject();
        return {
          ...storeObj,
          productCount,
          reviewCount,
          seller: storeObj.sellerId
        };
      })
    );

    res.json({
      stores: storesWithStats,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error("getAllStores error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết một store
export const getStoreDetail = async (req, res) => {
  try {
    const { storeId } = req.params;
    const Store = (await import("../models/Store.js")).default;
    const Review = (await import("../models/Review.js")).default;

    const store = await Store.findById(storeId).populate("sellerId", "fullName email avatarUrl");

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Get store stats
    const [productCount, products, recentReviews] = await Promise.all([
      Product.countDocuments({ sellerId: store.sellerId._id }),
      Product.find({ sellerId: store.sellerId._id }).limit(10),
      Review.find({ sellerId: store.sellerId._id }).limit(10)
    ]);

    const storeObj = store.toObject();
    res.json({
      ...storeObj,
      productCount,
      recentProducts: products,
      recentReviews,
      seller: storeObj.sellerId
    });
  } catch (error) {
    console.error("getStoreDetail error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật trạng thái store
export const updateStoreStatus = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { status } = req.body;

    const Store = (await import("../models/Store.js")).default;

    if (!["approved", "pending", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const store = await Store.findByIdAndUpdate(
      storeId,
      { status },
      { new: true }
    ).populate("sellerId", "fullName email");

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    res.json({
      message: "Store status updated successfully",
      store
    });
  } catch (error) {
    console.error("updateStoreStatus error:", error);
    res.status(500).json({ message: error.message });
  }
};
