import User from "../models/User.js";
import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import Review from "../models/Review.js";

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

    // Build filter
    const filter = {};
    // Only filter by status if provided and not empty
    if (status && status.trim() !== "" && status !== "all") {
      filter.status = status;
      console.log('Filtering by status:', status);
    }
    // Only filter by search if provided and not empty
    if (search && search.trim() !== "") {
      filter.storeName = { $regex: search, $options: "i" };
      console.log('Filtering by search:', search);
    }

    // Get total count
    const total = await Store.countDocuments(filter);
    console.log('Total stores found with filter:', filter, 'Count:', total);

    // Get all stores with seller info (no pagination)
    const stores = await Store.find(filter)
      .populate("sellerId", "fullName email avatarUrl")
      .sort({ createdAt: -1 });

    console.log('Fetched stores count:', stores.length);
    if (stores.length > 0) {
      console.log('First store:', stores[0]);
    } else {
      console.log('No stores found');
    }

    // Enrich stores with product count and review count
    const storesWithStats = await Promise.all(
      stores.map(async (store) => {
        // Check if sellerId exists and is populated
        if (!store.sellerId || !store.sellerId._id) {
          const storeObj = store.toObject();
          return {
            ...storeObj,
            productCount: 0,
            reviewCount: 0,
            seller: storeObj.sellerId || null
          };
        }

        const sellerId = store.sellerId._id;
        
        // Get all products of this seller
        const products = await Product.find({ sellerId }).select('_id');
        const productIds = products.map(p => p._id);
        
        // Count products and reviews
        let reviewCount = 0;
        if (productIds.length > 0) {
          try {
            reviewCount = await Review.countDocuments({ 
              productId: { $in: productIds } 
            });
          } catch (reviewError) {
            console.error(`Error counting reviews for store ${store._id}:`, reviewError);
            reviewCount = 0;
          }
        }
        
        const productCount = products.length;
        
        const storeObj = store.toObject();
        return {
          ...storeObj,
          productCount,
          reviewCount,
          seller: storeObj.sellerId
        };
      })
    ).then(results => results.filter(r => r !== null));

    console.log(`Returning ${storesWithStats.length} stores`);
    res.json({
      stores: storesWithStats,
      total: storesWithStats.length
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

    const store = await Store.findById(storeId).populate("sellerId", "fullName email avatarUrl");

    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Check if sellerId exists
    if (!store.sellerId || !store.sellerId._id) {
      const storeObj = store.toObject();
      return res.json({
        ...storeObj,
        productCount: 0,
        recentProducts: [],
        recentReviews: [],
        seller: storeObj.sellerId || null
      });
    }

    const sellerId = store.sellerId._id;
    
    // Get all products of this seller
    const products = await Product.find({ sellerId }).limit(10);
    const productIds = products.map(p => p._id);
    
    // Get store stats
    const [productCount, recentReviews] = await Promise.all([
      Product.countDocuments({ sellerId }),
      productIds.length > 0 
        ? Review.find({ productId: { $in: productIds } })
            .populate('productId', 'title')
            .limit(10)
        : []
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

    // Import Store model
    const Store = (await import("../models/Store.js")).default;

    // Validate status - cho phép 3 trạng thái: approved, pending, rejected
    if (!["approved", "pending", "rejected"].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be 'approved', 'pending', or 'rejected'" 
      });
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

// DEBUG ENDPOINT - Check database status
export const debugInfo = async (req, res) => {
  try {
    // Import Store model
    const Store = (await import("../models/Store.js")).default;

    const sellers = await User.find({ role: 'seller' }).select('_id fullName email');
    const stores = await Store.find().populate('sellerId', 'fullName email');
    
    res.json({
      debug: {
        sellers_count: sellers.length,
        stores_count: stores.length,
        sellers: sellers,
        stores: stores
      }
    });
  } catch (error) {
    console.error('debugInfo error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Bật/tắt hoạt động của store (khóa/mở khóa cửa hàng và tài khoản seller)
export const toggleStoreActive = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { active } = req.body;

    // Import Store model
    const Store = (await import("../models/Store.js")).default;

    // Validate active value
    if (typeof active !== 'boolean') {
      return res.status(400).json({ message: "Invalid active value. Must be boolean" });
    }

    // Tìm store và populate sellerId
    const store = await Store.findById(storeId).populate("sellerId");
    
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }

    // Cập nhật active status của store
    store.active = active;
    await store.save();

    // Cập nhật active status của seller (user)
    if (store.sellerId) {
      store.sellerId.active = active;
      await store.sellerId.save();
    }

    // Populate lại để trả về đầy đủ thông tin
    const updatedStore = await Store.findById(storeId)
      .populate("sellerId", "fullName email avatarUrl active");

    res.json({
      message: active 
        ? "Cửa hàng đã được kích hoạt thành công" 
        : "Cửa hàng đã bị khóa thành công",
      store: updatedStore
    });
  } catch (error) {
    console.error("toggleStoreActive error:", error);
    res.status(500).json({ message: error.message });
  }
};
