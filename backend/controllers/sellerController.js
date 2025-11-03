import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import User from "../models/User.js";
import Store from "../models/Store.js";
import Inventory from "../models/Inventory.js";
import path from 'path';

// Dashboard stats cho seller
export const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Đếm tổng sản phẩm
    const totalProducts = await Product.countDocuments({ sellerId });

    // Tìm các orderId có items thuộc sản phẩm của seller này (sử dụng aggregation như trong orderController)
    const orderIdDocs = await OrderItem.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $match: {
          'product.sellerId': new OrderItem.db.base.Types.ObjectId(sellerId),
        },
      },
      { $group: { _id: '$orderId' } },
    ]);

    const orderIds = orderIdDocs.map((doc) => doc._id);
    const totalOrders = orderIds.length;

    // Tính tổng doanh thu từ tất cả orders (giống như getSellerOrderStats)
    let totalRevenue = 0;
    if (orderIds.length > 0) {
      const revenueStats = await Order.aggregate([
        {
          $match: { _id: { $in: orderIds } }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalPrice' }
          }
        }
      ]);

      totalRevenue = revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;
    }

    // Sản phẩm gần hết hàng
    const lowStockProducts = await Product.find({
      sellerId,
      stock: { $lte: 10 }
    })
      .select('title price stock images category')
      .limit(5);

    // Đơn hàng gần đây
    let recentOrders = [];
    if (orderIds.length > 0) {
      const orders = await Order.find({ _id: { $in: orderIds } })
        .populate('buyerId', 'fullName email')
        .sort({ createdAt: -1 })
        .limit(5);

      recentOrders = orders.map(order => ({
        _id: order._id,
        totalAmount: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
        userId: order.buyerId ? {
          fullName: order.buyerId.fullName,
          email: order.buyerId.email
        } : {
          fullName: 'Unknown Customer',
          email: 'unknown@example.com'
        }
      }));
    }

    // Debug logging
    // console.log('Dashboard Debug:', {
    //   sellerId,
    //   totalProducts,
    //   totalOrders,
    //   totalRevenue,
    //   orderIds: orderIds.length,
    //   lowStockCount: lowStockProducts.length,
    //   recentOrdersCount: recentOrders.length
    // });

    res.json({
      stats: {
        totalProducts,
        totalOrders,
        totalRevenue,
        lowStockCount: lowStockProducts.length
      },
      lowStockProducts,
      recentOrders
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Test endpoint để debug dữ liệu
export const getSellerDebugData = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Lấy sản phẩm
    const products = await Product.find({ sellerId });

    // Lấy orderItems
    const orderItems = await OrderItem.find({
      productId: { $in: products.map(p => p._id) }
    }).populate('orderId').populate('productId');

    // Lấy orders
    const orderIds = [...new Set(orderItems.map(item => item.orderId?._id).filter(Boolean))];
    const orders = await Order.find({ _id: { $in: orderIds } });

    res.json({
      sellerId,
      productsCount: products.length,
      products: products.map(p => ({ _id: p._id, title: p.title, price: p.price, stock: p.stock })),
      orderItemsCount: orderItems.length,
      orderItems: orderItems.map(item => ({
        _id: item._id,
        productTitle: item.productId?.title,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        orderId: item.orderId?._id,
        orderStatus: item.orderId?.status
      })),
      ordersCount: orders.length,
      orders: orders.map(order => ({
        _id: order._id,
        status: order.status,
        totalPrice: order.totalPrice,
        buyerId: order.buyerId
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy sản phẩm của seller
export const getSellerProducts = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const products = await Product.find({ sellerId });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo sản phẩm mới
export const createProduct = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const productData = { ...req.body, sellerId };

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const product = await Product.findOne({ _id: req.params.id, sellerId });

    if (!product) return res.status(404).json({ message: "Product not found" });

    Object.assign(product, req.body);
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa sản phẩm
export const deleteProduct = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const product = await Product.findOne({ _id: req.params.id, sellerId });

    if (!product) return res.status(404).json({ message: "Product not found" });

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy đơn hàng của seller
export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Lấy các order items của seller này
    const orderItems = await OrderItem.find({ sellerId })
      .populate("productId")
      .populate("orderId");

    // Nhóm theo orderId để tạo danh sách orders
    const ordersMap = new Map();

    orderItems.forEach(item => {
      const orderId = item.orderId._id.toString();
      if (!ordersMap.has(orderId)) {
        ordersMap.set(orderId, {
          ...item.orderId.toObject(),
          items: []
        });
      }
      ordersMap.get(orderId).items.push(item);
    });

    const orders = Array.from(ordersMap.values());
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tồn kho của seller
export const getSellerInventories = async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Lấy tất cả sản phẩm của seller
    const products = await Product.find({ sellerId });
    const productIds = products.map(p => p._id);

    // Lấy inventory records cho các sản phẩm này
    const inventories = await Inventory.find({ productId: { $in: productIds } })
      .populate('productId', 'title price stock');

    res.json(inventories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật tồn kho
export const updateInventory = async (req, res) => {
  try {
    const sellerId = req.user._id;
    const productId = req.params.id;
    const { quantity, operation } = req.body;

    // Kiểm tra sản phẩm có thuộc về seller này không
    const product = await Product.findOne({ _id: productId, sellerId });
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let newStock = product.stock;

    switch (operation) {
      case 'add':
        newStock = product.stock + parseInt(quantity);
        break;
      case 'subtract':
        newStock = Math.max(0, product.stock - parseInt(quantity));
        break;
      case 'set':
        newStock = parseInt(quantity);
        break;
      default:
        return res.status(400).json({ message: "Invalid operation" });
    }

    // Cập nhật stock trong Product
    product.stock = newStock;
    await product.save();

    // Tạo hoặc cập nhật inventory record
    await Inventory.findOneAndUpdate(
      { productId },
      {
        productId,
        quantity: newStock,
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({
      message: "Inventory updated successfully",
      product: product,
      newStock: newStock
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//Seller Reports ----- Báo cáo doanh thu của seller
export const getSellerReports = async (req, res) => {
  try {
    const sellerId = req.user._id;

    const products = await Product.find({ sellerId });
    const productIds = products.map(p => p._id);

    if (productIds.length === 0) {
      return res.json({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        monthlyRevenue: [],
        dailyRevenue: []
      });
    }

    const orderItems = await OrderItem.find({ productId: { $in: productIds } }).populate("orderId");
    const orderIds = [...new Set(orderItems.map(item => item.orderId?._id).filter(Boolean))];
    if (orderIds.length === 0) {
      return res.json({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        monthlyRevenue: [],
        dailyRevenue: []
      });
    }

    const orders = await Order.find({ _id: { $in: orderIds } });

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // 👉 Doanh thu theo tháng
    const monthlyRevenueMap = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const month = date.getMonth() + 1;
      const key = `Tháng ${month}`;
      monthlyRevenueMap[key] = (monthlyRevenueMap[key] || 0) + (order.totalPrice || 0);
    });
    const monthlyRevenue = Object.entries(monthlyRevenueMap).map(([month, revenue]) => ({ month, revenue }));

    // 👉 Doanh thu theo ngày (30 ngày gần nhất)
    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 29);

    const dailyRevenueMap = {};
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      if (date >= last30Days) {
        const key = date.toISOString().split("T")[0]; // yyyy-mm-dd
        dailyRevenueMap[key] = (dailyRevenueMap[key] || 0) + (order.totalPrice || 0);
      }
    });

    const dailyRevenue = Object.entries(dailyRevenueMap)
      .sort(([a], [b]) => new Date(a) - new Date(b))
      .map(([date, revenue]) => ({ date, revenue }));

    res.json({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      monthlyRevenue,
      dailyRevenue
    });
  } catch (error) {
    console.error("getSellerReports error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Update seller profile settings (avatar, banner, description)
export const updateSellerSettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { avatarUrl } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role !== 'seller') return res.status(403).json({ message: "Only seller can update store settings" });

    if (typeof avatarUrl === 'string') user.avatarUrl = avatarUrl;

    await user.save();
    const sanitized = await User.findById(userId).select('-password');
    res.json({ message: 'Settings updated', user: sanitized });
  } catch (error) {
    console.error('updateSellerSettings error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get or create seller store
export const getMyStore = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('fullName businessName role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'seller') return res.status(403).json({ message: 'Only seller can access store settings' });

    let store = await Store.findOne({ sellerId: userId });
    if (!store) {
      store = await Store.create({
        sellerId: userId,
        storeName: user.businessName || user.fullName || 'Store',
        description: '',
        bannerImageURL: '',
        status: 'approved'
      });
    }
    res.json(store);
  } catch (error) {
    console.error('getMyStore error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update seller store fields: description, bannerImageURL
export const updateMyStore = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'seller') return res.status(403).json({ message: 'Only seller can update store' });

    const { description, bannerImageURL, storeName } = req.body;

    let store = await Store.findOne({ sellerId: userId });
    if (!store) {
      store = new Store({ sellerId: userId, storeName: storeName || 'Store' });
    }

    if (typeof description === 'string') store.description = description;
    if (typeof bannerImageURL === 'string') store.bannerImageURL = bannerImageURL;
    if (typeof storeName === 'string' && storeName.trim()) store.storeName = storeName.trim();

    await store.save();
    res.json({ message: 'Store updated', store });
  } catch (error) {
    console.error('updateMyStore error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Upload seller avatar (file upload)
export const uploadSellerAvatar = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'seller') return res.status(403).json({ message: 'Only seller can update avatar' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const fileUrl = `/uploads/${req.file.filename}`;
    user.avatarUrl = fileUrl;
    await user.save();

    const sanitized = await User.findById(userId).select('-password');
    res.json({ message: 'Avatar updated', avatarUrl: fileUrl, user: sanitized });
  } catch (error) {
    console.error('uploadSellerAvatar error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Upload store banner (file upload)
export const uploadStoreBanner = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select('role');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'seller') return res.status(403).json({ message: 'Only seller can update store' });

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    let store = await Store.findOne({ sellerId: userId });
    if (!store) {
      store = new Store({ sellerId: userId, storeName: 'Store' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    store.bannerImageURL = fileUrl;
    await store.save();
    res.json({ message: 'Banner updated', bannerImageURL: fileUrl, store });
  } catch (error) {
    console.error('uploadStoreBanner error:', error);
    res.status(500).json({ message: error.message });
  }
};