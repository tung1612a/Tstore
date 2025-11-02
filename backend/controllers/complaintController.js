import Complaint from '../models/Complaint.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';

// Buyer tạo complaint
export const createComplaint = async (req, res) => {
  try {
    const { orderId, productId, complaintType, description } = req.body;
    const buyerId = req.user.id;

    // Verify order belongs to buyer
    const order = await Order.findById(orderId);
    if (!order || order.buyerId.toString() !== buyerId) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng hoặc không có quyền truy cập' });
    }

    // Verify product is in the order
    const orderItem = await OrderItem.findOne({ orderId, productId });
    if (!orderItem) {
      return res.status(400).json({ message: 'Sản phẩm này không có trong đơn hàng' });
    }

    // Get sellerId from product
    const product = await Product.findById(productId);
    if (!product || !product.sellerId) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm hoặc người bán' });
    }

    // Check if complaint already exists for this order and product
    const existingComplaint = await Complaint.findOne({ orderId, productId, buyerId });
    if (existingComplaint) {
      return res.status(400).json({ message: 'Bạn đã khiếu nại về sản phẩm này trong đơn hàng này rồi' });
    }

    // Handle uploaded images
    const images = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        images.push(`/uploads/${file.filename}`);
      });
    }

    const complaint = new Complaint({
      orderId,
      buyerId,
      sellerId: product.sellerId,
      productId,
      complaintType,
      description,
      images,
      status: 'pending'
    });

    const savedComplaint = await complaint.save();

    const populatedComplaint = await Complaint.findById(savedComplaint._id)
      .populate('orderId', '_id totalPrice')
      .populate('buyerId', 'fullName email')
      .populate('sellerId', 'fullName email')
      .populate('productId', 'title image imageURL');

    res.status(201).json(populatedComplaint);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tạo khiếu nại', error: error.message });
  }
};

// Seller xem danh sách complaints
export const getSellerComplaints = async (req, res) => {
  try {
    const sellerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = { sellerId };
    if (status) {
      query.status = status;
    }

    const complaints = await Complaint.find(query)
      .populate('orderId', '_id totalPrice createdAt')
      .populate('buyerId', 'fullName email')
      .populate('productId', 'title image imageURL')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách khiếu nại', error: error.message });
  }
};

// Buyer xem danh sách complaints của mình
export const getBuyerComplaints = async (req, res) => {
  try {
    const buyerId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    let query = { buyerId };
    if (status) {
      query.status = status;
    }

    const complaints = await Complaint.find(query)
      .populate('orderId', '_id totalPrice createdAt')
      .populate('sellerId', 'fullName email')
      .populate('productId', 'title image imageURL')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách khiếu nại', error: error.message });
  }
};

// Seller phản hồi/com cập nhật trạng thái complaint
export const respondToComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, status } = req.body;
    const sellerId = req.user.id;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Không tìm thấy khiếu nại' });
    }

    if (complaint.sellerId.toString() !== sellerId) {
      return res.status(401).json({ message: 'Bạn không có quyền phản hồi khiếu nại này' });
    }

    if (status) {
      const validStatuses = ['in_progress', 'resolved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
      }
      complaint.status = status;

      if (status === 'resolved') {
        complaint.resolvedAt = new Date();
      }
    }

    if (response) {
      complaint.response = response;
    }

    await complaint.save();

    const populatedComplaint = await Complaint.findById(id)
      .populate('orderId', '_id totalPrice')
      .populate('buyerId', 'fullName email')
      .populate('sellerId', 'fullName email')
      .populate('productId', 'title image imageURL');

    res.json(populatedComplaint);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi phản hồi khiếu nại', error: error.message });
  }
};

// Lấy chi tiết một complaint
export const getComplaintDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { role } = req.user;

    const complaint = await Complaint.findById(id)
      .populate('orderId', '_id totalPrice createdAt')
      .populate('buyerId', 'fullName email')
      .populate('sellerId', 'fullName email')
      .populate('productId', 'title image imageURL description');

    if (!complaint) {
      return res.status(404).json({ message: 'Không tìm thấy khiếu nại' });
    }

    // Check permissions
    const isBuyer = complaint.buyerId._id.toString() === userId;
    const isSeller = complaint.sellerId._id.toString() === userId;

    if (!isBuyer && !isSeller && role !== 'admin' && role !== 'devadmin') {
      return res.status(401).json({ message: 'Không có quyền truy cập khiếu nại này' });
    }

    res.json(complaint);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy chi tiết khiếu nại', error: error.message });
  }
};

// Buyer nâng cấp khiếu nại lên admin (chỉ khi seller từ chối)
export const escalateToAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.user.id;

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Không tìm thấy khiếu nại' });
    }

    // Kiểm tra quyền - chỉ buyer của khiếu nại mới được nâng cấp
    if (complaint.buyerId.toString() !== buyerId) {
      return res.status(401).json({ message: 'Bạn không có quyền nâng cấp khiếu nại này' });
    }

    // Chỉ cho phép nâng cấp khi seller đã từ chối
    if (complaint.status !== 'rejected') {
      return res.status(400).json({ message: 'Chỉ có thể nâng cấp khiếu nại khi người bán đã từ chối giải quyết' });
    }

    // Kiểm tra xem đã nâng cấp chưa
    if (complaint.escalatedToAdmin) {
      return res.status(400).json({ message: 'Khiếu nại này đã được nâng cấp lên admin rồi' });
    }

    // Nâng cấp lên admin
    complaint.escalatedToAdmin = true;
    complaint.escalatedAt = new Date();
    await complaint.save();

    const populatedComplaint = await Complaint.findById(id)
      .populate('orderId', '_id totalPrice createdAt')
      .populate('buyerId', 'fullName email')
      .populate('sellerId', 'fullName email')
      .populate('productId', 'title image imageURL');

    res.json({ 
      message: 'Đã nâng cấp khiếu nại lên admin thành công',
      complaint: populatedComplaint 
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi nâng cấp khiếu nại', error: error.message });
  }
};

// Admin xem danh sách complaints đã được nâng cấp
export const getAdminComplaints = async (req, res) => {
  try {
    const { role } = req.user;
    
    // Chỉ admin và devadmin mới được xem
    if (role !== 'admin' && role !== 'devadmin') {
      return res.status(403).json({ message: 'Bạn không có quyền truy cập' });
    }

    const { status, page = 1, limit = 10 } = req.query;

    let query = { escalatedToAdmin: true };
    if (status) {
      query.status = status;
    }

    const complaints = await Complaint.find(query)
      .populate('orderId', '_id totalPrice createdAt')
      .populate('buyerId', 'fullName email')
      .populate('sellerId', 'fullName email')
      .populate('productId', 'title image imageURL')
      .sort({ escalatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Complaint.countDocuments(query);

    res.json({
      complaints,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách khiếu nại admin', error: error.message });
  }
};

// Admin giải quyết khiếu nại
export const resolveComplaintByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { response, status, adminResponse } = req.body;
    const { role } = req.user;
    const adminId = req.user.id;

    // Chỉ admin và devadmin mới được giải quyết
    if (role !== 'admin' && role !== 'devadmin') {
      return res.status(403).json({ message: 'Bạn không có quyền giải quyết khiếu nại' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ message: 'Không tìm thấy khiếu nại' });
    }

    // Chỉ giải quyết các khiếu nại đã được nâng cấp lên admin
    if (!complaint.escalatedToAdmin) {
      return res.status(400).json({ message: 'Khiếu nại này chưa được nâng cấp lên admin' });
    }

    // Cập nhật trạng thái và phản hồi
    if (status) {
      const validStatuses = ['in_progress', 'resolved', 'rejected'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
      }
      complaint.status = status;

      if (status === 'resolved') {
        complaint.resolvedAt = new Date();
      }
    }

    // Lưu phản hồi từ admin (nếu có)
    if (adminResponse || response) {
      // Tạo hoặc cập nhật phản hồi của admin
      const existingResponse = complaint.response || '';
      const adminNote = adminResponse || response;
      complaint.response = existingResponse ? `${existingResponse}\n\n[Phản hồi từ Admin]: ${adminNote}` : `[Phản hồi từ Admin]: ${adminNote}`;
    }

    await complaint.save();

    const populatedComplaint = await Complaint.findById(id)
      .populate('orderId', '_id totalPrice createdAt')
      .populate('buyerId', 'fullName email')
      .populate('sellerId', 'fullName email')
      .populate('productId', 'title image imageURL');

    res.json({
      message: 'Đã cập nhật khiếu nại thành công',
      complaint: populatedComplaint
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi giải quyết khiếu nại', error: error.message });
  }
};

