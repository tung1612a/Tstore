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
      status: { $in: ["delivered", "completed"] }
    });
    
    // Đếm đơn hàng đang giao
    const totalShipping = await Order.countDocuments({ 
      shipperId, 
      status: "shipping" 
    });
    
    // Đếm đơn hàng chờ giao (đã được assign cho shipper này)
    const totalPending = await Order.countDocuments({ 
      shipperId, 
      status: "awaiting_delivery" 
    });
    
    // Đơn hàng gần đây
    const recentOrdersData = await Order.find({ 
      shipperId,
      status: { $in: ["shipping", "delivered", "completed"] }
    })
    .populate('buyerId', 'fullName email phone')
    .populate('addressId')
    .sort({ updatedAt: -1 })
    .limit(5);
    
    // Đơn hàng chờ giao
    const pendingOrdersData = await Order.find({ 
      shipperId,
      status: "awaiting_delivery"
    })
    .populate('buyerId', 'fullName email phone')
    .populate('addressId')
    .sort({ createdAt: -1 })
    .limit(10);

    // Get order items for recent orders
    const recentOrders = await Promise.all(
      recentOrdersData.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id })
          .populate('productId', 'title price image imageURL');
        return { ...order.toObject(), items };
      })
    );

    // Get order items for pending orders
    const pendingOrders = await Promise.all(
      pendingOrdersData.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id })
          .populate('productId', 'title price image imageURL');
        return { ...order.toObject(), items };
      })
    );

    res.json({
      stats: {
        totalDelivered,
        totalShipping,
        totalPending
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
    const { status, page = 1, limit = 10 } = req.query;
    
    let query = { shipperId };
    if (status) {
      query.status = status;
    }
    
    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count
    const total = await Order.countDocuments(query);
    
    const orders = await Order.find(query)
      .populate('buyerId', 'fullName email phone')
      .populate('addressId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Get order items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await OrderItem.find({ orderId: order._id })
          .populate('productId', 'title price image imageURL');
        
        const orderObj = order.toObject();
        return {
          ...orderObj,
          items
        };
      })
    );
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      orders: ordersWithItems,
      totalPages,
      total
    });
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
    .populate('addressId');
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Lấy chi tiết sản phẩm trong đơn hàng
    const orderItems = await OrderItem.find({ orderId })
      .populate('productId', 'title price image imageURL');
    
    const orderObj = order.toObject();
    
    res.json({
      order: orderObj,
      orderItems: orderItems
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
    
    const order = await Order.findOne({ 
      _id: orderId, 
      shipperId,
      status: "awaiting_delivery"
    });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found or not ready for shipping" });
    }
    
    order.status = "shipping";
    order.shippedAt = new Date();
    await order.save();
    
    res.json({ 
      message: "Order marked as shipping successfully",
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
    const { success = true, failureReason } = req.body;
    
    const order = await Order.findOne({ 
      _id: orderId, 
      shipperId,
      status: "shipping"
    });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found or not ready for completion" });
    }

    // If delivery failed, set status to 'cancelled' and add failure reason
    if (success === false) {
      order.status = "cancelled";
      order.deliveryFailureReason = failureReason || "Giao hàng thất bại";
      order.cancellationReason = failureReason || "Giao hàng thất bại";
    } else {
      // If delivery success, set status to 'delivered' (waiting for customer confirmation)
      order.status = "delivered";
      order.deliveredAt = new Date();
    }

    await order.save();
    
    res.json({ 
      message: success 
        ? "Order marked as delivered successfully. Waiting for customer confirmation."
        : "Order marked as delivery failed",
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
      status: "awaiting_delivery",
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
      status: "awaiting_delivery"
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

// Lấy danh sách shippers với thống kê (cho seller chọn shipper)
export const getShippersWithStats = async (req, res) => {
  try {
    const { 
      search = '', 
      sortBy = 'successRate', 
      page = 1, 
      limit = 10 
    } = req.query;

    // Build query
    let query = { role: "shipper", active: true };
    
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Get total count
    const total = await User.countDocuments(query);
    
    // Determine sort order
    let sortOrder = {};
    switch (sortBy) {
      case 'name':
        sortOrder.fullName = 1;
        break;
      case 'totalOrders':
      case 'successRate':
      default:
        // These will be sorted after getting stats
        sortOrder = {};
        break;
    }

    // Get shippers with pagination
    const shippers = await User.find(query)
      .select('fullName email phone active createdAt')
      .sort(sortOrder)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));
    
    // Get stats for each shipper and attach
    const shippersWithStats = await Promise.all(
      shippers.map(async (shipper) => {
        const totalOrders = await Order.countDocuments({ shipperId: shipper._id });
        const completedOrders = await Order.countDocuments({ 
          shipperId: shipper._id, 
          status: "completed" 
        });
        const cancelledOrders = await Order.countDocuments({ 
          shipperId: shipper._id, 
          status: "cancelled" 
        });
        const successRate = totalOrders > 0 ? ((completedOrders / totalOrders) * 100).toFixed(1) : 0;
        
        return {
          _id: shipper._id,
          fullName: shipper.fullName,
          email: shipper.email,
          phone: shipper.phone,
          active: shipper.active,
          stats: {
            totalOrders,
            completedOrders,
            cancelledOrders,
            successRate: parseFloat(successRate)
          }
        };
      })
    );

    // Sort by stats if needed
    if (sortBy === 'totalOrders') {
      shippersWithStats.sort((a, b) => b.stats.totalOrders - a.stats.totalOrders);
    } else if (sortBy === 'successRate') {
      shippersWithStats.sort((a, b) => b.stats.successRate - a.stats.successRate);
    }
    
    res.json({
      shippers: shippersWithStats,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      hasMore: Number(page) * Number(limit) < total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Báo cáo doanh thu cho shipper: tổng doanh thu, tổng đơn, giá trị TB đơn, tổng theo tháng
export const getShipperReports = async (req, res) => {
  try {
    const shipperId = req.user._id;
    // Chỉ tính các đơn đã giao thành công
    const deliveredStatuses = ["delivered", "completed"];
    const orders = await Order.find({
      shipperId,
      status: { $in: deliveredStatuses },
    }).select("totalPrice createdAt");

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Tổng theo tháng: doanh thu và số đơn
    const monthlyMap = {};
    orders.forEach((o) => {
      const date = new Date(o.createdAt);
      const month = date.getMonth() + 1; // 1..12
      const key = `Tháng ${month}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = { month: key, revenue: 0, orders: 0 };
      }
      monthlyMap[key].revenue += o.totalPrice || 0;
      monthlyMap[key].orders += 1;
    });

    const monthly = Object.values(monthlyMap).sort((a, b) => {
      const ma = parseInt(a.month.replace("Tháng ", ""), 10);
      const mb = parseInt(b.month.replace("Tháng ", ""), 10);
      return ma - mb;
    });

    // Tổng theo ngày (30 ngày gần nhất): doanh thu và số đơn
    const today = new Date();
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 29);

    const dailyMap = {};
    orders.forEach((o) => {
      const date = new Date(o.createdAt);
      if (date >= last30Days) {
        const key = date.toISOString().split("T")[0]; // yyyy-mm-dd
        if (!dailyMap[key]) {
          dailyMap[key] = { date: key, revenue: 0, orders: 0 };
        }
        dailyMap[key].revenue += o.totalPrice || 0;
        dailyMap[key].orders += 1;
      }
    });

    const daily = Object.values(dailyMap).sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      monthlyRevenue: monthly.map((m) => ({ month: m.month, revenue: m.revenue })),
      monthlyOrders: monthly.map((m) => ({ month: m.month, orders: m.orders })),
      dailyRevenue: daily.map((d) => ({ date: d.date, revenue: d.revenue })),
      dailyOrders: daily.map((d) => ({ date: d.date, orders: d.orders })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};







