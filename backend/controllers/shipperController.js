import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import User from "../models/User.js";
import Address from "../models/Address.js";

// Dashboard stats cho shipper
export const getShipperDashboard = async (req, res) => {
  try {
    const shipperId = req.user._id;
    
    // Đếm tổng đơn hàng được giao
    const totalDelivered = await Order.countDocuments({ 
      shipperId, 
      status: "completed" 
    });
    
    // Đếm đơn hàng đang giao
    const totalShipping = await Order.countDocuments({ 
      shipperId, 
      status: "shipped" 
    });
    
    // Đếm đơn hàng chờ giao (đã được assign cho shipper này)
    const totalPending = await Order.countDocuments({ 
      shipperId, 
      status: "paid" 
    });
    
    // Tính tổng doanh thu từ phí giao hàng (ví dụ: 10k per order)
    const deliveryFee = 10000;
    const totalEarnings = totalDelivered * deliveryFee;
    
    // Đơn hàng gần đây
    const recentOrders = await Order.find({ 
      shipperId,
      status: { $in: ["shipped", "completed"] }
    })
    .populate('buyerId', 'fullName email phone')
    .populate('addressId')
    .sort({ updatedAt: -1 })
    .limit(5);
    
    // Đơn hàng chờ giao
    const pendingOrders = await Order.find({ 
      shipperId,
      status: "paid"
    })
    .populate('buyerId', 'fullName email phone')
    .populate('addressId')
    .sort({ createdAt: -1 })
    .limit(10);

    res.json({
      stats: {
        totalDelivered,
        totalShipping,
        totalPending,
        totalEarnings
      },
      recentOrders,
      pendingOrders
    });
  } catch (error) {
    console.error('Shipper Dashboard error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách đơn hàng được assign cho shipper
export const getShipperOrders = async (req, res) => {
  try {
    const shipperId = req.user._id;
    const { status } = req.query;
    
    let query = { shipperId };
    if (status) {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('buyerId', 'fullName email phone')
      .populate('addressId')
      .populate('orderItems')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy chi tiết đơn hàng
export const getShipperOrderDetails = async (req, res) => {
  try {
    const shipperId = req.user._id;
    const orderId = req.params.id;
    
    const order = await Order.findOne({ 
      _id: orderId, 
      shipperId 
    })
    .populate('buyerId', 'fullName email phone')
    .populate('addressId')
    .populate('orderItems');
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Lấy chi tiết sản phẩm trong đơn hàng
    const orderItems = await OrderItem.find({ orderId })
      .populate('productId', 'title price images');
    
    res.json({
      order,
      orderItems
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật trạng thái đơn hàng (shipped)
export const updateOrderToShipped = async (req, res) => {
  try {
    const shipperId = req.user._id;
    const orderId = req.params.id;
    const { trackingNumber } = req.body;
    
    const order = await Order.findOne({ 
      _id: orderId, 
      shipperId,
      status: "paid"
    });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found or not ready for shipping" });
    }
    
    order.status = "shipped";
    order.shippedAt = new Date();
    order.trackingNumber = trackingNumber;
    await order.save();
    
    res.json({ 
      message: "Order marked as shipped successfully",
      order 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật trạng thái đơn hàng (completed)
export const updateOrderToCompleted = async (req, res) => {
  try {
    const shipperId = req.user._id;
    const orderId = req.params.id;
    
    const order = await Order.findOne({ 
      _id: orderId, 
      shipperId,
      status: "shipped"
    });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found or not ready for completion" });
    }
    
    order.status = "completed";
    order.deliveredAt = new Date();
    await order.save();
    
    res.json({ 
      message: "Order marked as completed successfully",
      order 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy đơn hàng chưa được assign (để admin có thể assign cho shipper)
export const getUnassignedOrders = async (req, res) => {
  try {
    const orders = await Order.find({ 
      status: "paid",
      shipperId: { $exists: false }
    })
    .populate('buyerId', 'fullName email phone')
    .populate('addressId')
    .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Assign đơn hàng cho shipper (chỉ admin mới có thể làm)
export const assignOrderToShipper = async (req, res) => {
  try {
    const { orderId, shipperId } = req.body;
    
    const order = await Order.findOne({ 
      _id: orderId,
      status: "paid"
    });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found or not ready for assignment" });
    }
    
    const shipper = await User.findOne({ 
      _id: shipperId,
      role: "shipper"
    });
    
    if (!shipper) {
      return res.status(404).json({ message: "Shipper not found" });
    }
    
    order.shipperId = shipperId;
    await order.save();
    
    res.json({ 
      message: "Order assigned to shipper successfully",
      order 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách shipper (cho admin)
export const getAllShippers = async (req, res) => {
  try {
    const shippers = await User.find({ role: "shipper" })
      .select('fullName email phone active createdAt');
    
    res.json(shippers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
