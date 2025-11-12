import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';
import Address from '../models/Address.js';
import Payment from '../models/Payment.js';
import User from '../models/User.js';

export const createOrder = async (req, res) => {
  try {
    const { items, addressId, couponId, paymentMethod = 'cod', notes } = req.body;
    const buyerId = req.user.id;

    const address = await Address.findById(addressId);
    if (!address || address.user.toString() !== buyerId) {
      return res.status(404).json({ message: 'Không tìm thấy địa chỉ hoặc không có quyền truy cập' });
    }

    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Không tìm thấy sản phẩm ${item.productId}` });
      }

      // Kiểm tra số lượng tồn kho
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Sản phẩm "${product.title}" không đủ hàng. Chỉ còn ${product.stock} sản phẩm trong kho.` 
        });
      }

      const itemTotal = product.price * item.quantity;
      totalPrice += itemTotal;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      });
    }

    // Xác định status dựa trên payment method
    const orderStatus = paymentMethod === 'cod' ? 'pending' : 'paid';

    const order = new Order({
      buyerId,
      addressId,
      totalPrice,
      couponId,
      paymentMethod,
      notes,
      status: orderStatus,
    });

    const savedOrder = await order.save();

    for (const item of orderItems) {
      const orderItem = new OrderItem({
        orderId: savedOrder._id,
        ...item,
      });
      await orderItem.save();

      // Giảm số lượng sản phẩm trong kho
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: -item.quantity } }
      );
    }

    const populatedOrder = await Order.findById(savedOrder._id)
      .populate('buyerId', 'fullName email')
      .populate('addressId', 'fullName phone street city state country');

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tạo đơn hàng', error: error.message });
  }
};

export const getBuyerOrders = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = { buyerId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('addressId', 'fullName phone street city state country')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy đơn hàng', error: error.message });
  }
};

export const getSellerOrders = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { status, page = 1, limit = 10, fromDate, toDate, paymentStatus } = req.query;

    // Tìm các orderId có items thuộc sản phẩm của seller này
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
    if (orderIds.length === 0) {
      return res.json({ orders: [], totalPages: 0, currentPage: page, total: 0 });
    }

    const query = { _id: { $in: orderIds } };
    if (status) query.status = status;

    if (fromDate || toDate) {
      query.createdAt = {};
      if (fromDate) query.createdAt.$gte = new Date(fromDate);
      if (toDate) query.createdAt.$lte = new Date(toDate);
    }

    const total = await Order.countDocuments(query);
    let orders = await Order.find(query)
      .populate('buyerId', 'fullName email')
      .populate('addressId', 'fullName phone street city state country')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    if (paymentStatus) {
      const payments = await Payment.find({ status: paymentStatus, orderId: { $in: orders.map((o) => o._id) } }).select(
        'orderId'
      );
      const allowedOrderIds = new Set(payments.map((p) => String(p.orderId)));
      orders = orders.filter((o) => allowedOrderIds.has(String(o._id)));
    }

    res.json({
      orders,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy đơn hàng', error: error.message });
  }
};

export const getSellerOrderStats = async (req, res) => {
  try {
    const sellerId = req.user.id;

    // Tìm các orderId có items thuộc sản phẩm của seller này
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
    
    if (orderIds.length === 0) {
      return res.json({
        pending: 0,
        confirmed: 0,
        shipped: 0,
        totalRevenue: 0
      });
    }

    // Aggregate stats
    const stats = await Order.aggregate([
      {
        $match: { _id: { $in: orderIds } }
      },
      {
        $group: {
          _id: null,
          pending: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          confirmed: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          },
          shipped: {
            $sum: { $cond: [{ $eq: ['$status', 'shipped'] }, 1, 0] }
          },
          totalRevenue: { $sum: '$totalPrice' }
        }
      }
    ]);

    const result = stats.length > 0 ? stats[0] : {
      pending: 0,
      confirmed: 0,
      shipped: 0,
      totalRevenue: 0
    };

    // Remove _id field
    delete result._id;

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy thống kê', error: error.message });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { role } = req.user;

    const order = await Order.findById(id)
      .populate('buyerId', 'fullName email phone')
      .populate('addressId', 'fullName phone street city state country');

    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    let orderItems;
    let isBuyer = false;

    // Kiểm tra xem user có phải là buyer không
    if (order.buyerId) {
      const buyerIdStr = order.buyerId._id ? order.buyerId._id.toString() : order.buyerId.toString();
      isBuyer = buyerIdStr === userId;
    }

    // Ưu tiên kiểm tra buyer trước (seller có thể mua hàng từ seller khác)
    if (isBuyer) {
      // Nếu là buyer và là chủ đơn hàng, lấy tất cả items (bất kể role là gì)
      orderItems = await OrderItem.find({ orderId: id }).populate({
        path: 'productId',
        select: '_id title price image imageURL description',
        populate: {
          path: 'sellerId',
          select: 'fullName email phone'
        }
      });
    } else if (role === 'seller') {
      // Nếu là seller và KHÔNG phải buyer, chỉ lấy các items có product thuộc về seller
      orderItems = await OrderItem.aggregate([
        {
          $match: { orderId: new OrderItem.db.base.Types.ObjectId(id) },
        },
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
            'product.sellerId': new OrderItem.db.base.Types.ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'product.sellerId',
            foreignField: '_id',
            as: 'seller',
          },
        },
        {
          $unwind: {
            path: '$seller',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            quantity: 1,
            unitPrice: 1,
            'productId._id': '$product._id',
            'productId.title': '$product.title',
            'productId.price': '$product.price',
            'productId.image': '$product.image',
            'productId.imageURL': '$product.imageURL',
            'productId.description': '$product.description',
            'productId.sellerId': {
              _id: '$seller._id',
              fullName: '$seller.fullName',
              email: '$seller.email',
              phone: '$seller.phone',
            },
          },
        },
      ]);

      // Nếu không có items nào thuộc về seller này
      if (orderItems.length === 0) {
        return res.status(401).json({ message: 'Không có sản phẩm nào của bạn trong đơn hàng này' });
      }
    } else {
      return res.status(401).json({ message: 'Không được phép truy cập đơn hàng này' });
    }

    // Lấy payment status
    const payment = await Payment.findOne({ orderId: id });
    const paymentStatus = payment?.status || (order.paymentMethod === 'cod' ? 'pending' : null);
    
    // Thêm paymentStatus vào order object
    const orderWithPaymentStatus = order.toObject();
    orderWithPaymentStatus.paymentStatus = paymentStatus;

    res.json({
      order: orderWithPaymentStatus,
      items: orderItems,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết đơn hàng', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (!['pending', 'paid', 'shipped', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    order.status = status;

    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi cập nhật trạng thái đơn hàng', error: error.message });
  }
};

export const confirmOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { shipperId } = req.body; // Lấy shipperId từ request body
    const sellerId = req.user.id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    // Kiểm tra xem order có sản phẩm của seller này không
    const orderItems = await OrderItem.find({ orderId: id }).populate('productId', 'sellerId');
    const hasSellerProducts = orderItems.some(item => 
      item.productId.sellerId.toString() === sellerId
    );

    if (!hasSellerProducts) {
      return res.status(401).json({ message: 'Không có sản phẩm nào của bạn trong đơn hàng này' });
    }

    if (order.status !== 'pending') {
      return res.status(400).json({ message: 'Chỉ có thể xác nhận đơn hàng ở trạng thái pending' });
    }

    // Nếu có shipperId, kiểm tra shipper có tồn tại và active không
    if (shipperId) {
      const shipper = await User.findById(shipperId);
      if (!shipper || shipper.role !== 'shipper' || !shipper.active) {
        return res.status(400).json({ message: 'Shipper không hợp lệ' });
      }
      order.shipperId = shipperId;
    }

    // Change status to awaiting_delivery instead of confirmed
    order.status = 'awaiting_delivery';
    order.confirmedAt = new Date();
    order.confirmedBy = sellerId;

    await order.save();

    const populatedOrder = await Order.findById(id)
      .populate('buyerId', 'fullName email')
      .populate('addressId', 'fullName phone street city state country')
      .populate('confirmedBy', 'fullName email');

    res.json(populatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi xác nhận đơn hàng', error: error.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (order.buyerId.toString() !== userId) {
      return res.status(401).json({ message: 'Chỉ buyer mới được hủy đơn hàng' });
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({ message: 'Không thể hủy đơn hàng ở trạng thái này' });
    }

    order.status = 'cancelled';
    if (reason) order.cancellationReason = reason;

    await order.save();

    // Hoàn lại số lượng sản phẩm vào kho
    const orderItems = await OrderItem.find({ orderId: id });
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stock: item.quantity } }
      );
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi hủy đơn hàng', error: error.message });
  }
};

// Customer xác nhận đã nhận được hàng
export const confirmReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (order.buyerId.toString() !== userId) {
      return res.status(401).json({ message: 'Chỉ khách hàng mới được xác nhận nhận hàng' });
    }

    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Chỉ có thể xác nhận đơn hàng ở trạng thái delivered' });
    }

    order.status = 'completed';
    await order.save();

    res.json({ message: 'Xác nhận nhận hàng thành công', order });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi xác nhận nhận hàng', error: error.message });
  }
};







