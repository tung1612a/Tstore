import Order from '../models/Order.js';
import Payment from '../models/Payment.js';

export const createPayment = async (req, res) => {
  try {
    const { orderId, method } = req.body;
    const userId = req.user.id;

    // Tìm đơn hàng
    const order = await Order.findById(orderId).populate('buyerId', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });
    }

    if (order.buyerId._id.toString() !== userId) {
      return res.status(401).json({ message: 'Không được phép truy cập đơn hàng này' });
    }

    const payment = new Payment({
      orderId,
      userId,
      method,
      amount: order.totalPrice,
      status: 'pending'
    });

    const savedPayment = await payment.save();

    // orderSchema hiện tại không có paymentStatus; không cập nhật trường này

    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tạo thanh toán', error: error.message });
  }
};

export const processPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId } = req.body;

    const payment = await Payment.findById(id);
    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }

    payment.status = status;
    if (transactionId) payment.transactionId = transactionId;
    if (status === 'paid') payment.paidAt = new Date();

    await payment.save();

    const order = await Order.findById(payment.orderId);
    if (order) {
      if (status === 'paid') {
        order.status = 'paid';
      }
      await order.save();
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi xử lý thanh toán', error: error.message });
  }
};

export const getUserPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const payments = await Payment.find({ userId })
      .populate({ path: 'orderId', select: 'totalPrice status buyerId', populate: { path: 'buyerId', select: 'name email' } })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy lịch sử thanh toán', error: error.message });
  }
};

export const getPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const payment = await Payment.findById(id)
      .populate({ path: 'orderId', select: 'totalPrice status buyerId', populate: { path: 'buyerId', select: 'name email' } });

    if (!payment) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán' });
    }

    const isOwner = String(payment.userId) === String(userId);
    const isOrderBuyer = payment.orderId?.buyerId && String(payment.orderId.buyerId._id) === String(userId);
    if (!isOwner && !isOrderBuyer) {
      return res.status(401).json({ message: 'Không được phép truy cập thanh toán này' });
    }

    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết thanh toán', error: error.message });
  }
};
