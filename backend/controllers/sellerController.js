import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";

// Dashboard stats cho seller
export const getSellerDashboard = async (req, res) => {
  try {
    const sellerId = req.user._id;
    
    const totalProducts = await Product.countDocuments({ sellerId });
    const totalOrders = await Order.countDocuments({ sellerId });
    
    // Tính tổng doanh thu
    const orders = await Order.find({ sellerId, status: "completed" });
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    // Sản phẩm gần hết hàng
    const lowStockProducts = await Product.find({ 
      sellerId, 
      stock: { $lte: 10 } 
    }).limit(5);

    // Đơn hàng gần đây
    const recentOrders = await Order.find({ sellerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("userId", "fullName email");

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
