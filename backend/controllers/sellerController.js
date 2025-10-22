import Product from "../models/Product.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";

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
    console.log('Dashboard Debug:', {
      sellerId,
      totalProducts,
      totalOrders,
      totalRevenue,
      orderIds: orderIds.length,
      lowStockCount: lowStockProducts.length,
      recentOrdersCount: recentOrders.length
    });

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
