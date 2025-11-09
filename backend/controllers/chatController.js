import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

// Tạo hoặc lấy conversation giữa customer và seller
export const getOrCreateConversation = async (req, res) => {
  try {
    const { sellerId, productId } = req.body;
    const customerId = req.user._id;

    if (!sellerId) {
      return res.status(400).json({ message: "sellerId is required" });
    }

    // Kiểm tra seller có tồn tại và là seller không
    const seller = await User.findById(sellerId);
    if (!seller || seller.role !== "seller") {
      return res.status(404).json({ message: "Seller not found" });
    }

    // Kiểm tra user có phải customer không
    if (req.user.role !== "customer") {
      return res.status(403).json({ message: "Only customers can create conversations" });
    }

    // Kiểm tra product nếu có productId
    if (productId) {
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      // Đảm bảo product thuộc về seller này
      if (product.sellerId.toString() !== sellerId.toString()) {
        return res.status(400).json({ message: "Product does not belong to this seller" });
      }
    }

    // Tìm hoặc tạo conversation
    let conversation = await Conversation.findOne({
      customerId,
      sellerId,
    })
      .populate("customerId", "fullName avatarUrl")
      .populate("sellerId", "fullName avatarUrl")
      .populate("productId", "title price image imageURL");

    if (!conversation) {
      conversation = await Conversation.create({
        customerId,
        sellerId,
        productId: productId || null,
      });
    } else if (productId && !conversation.productId) {
      // Nếu conversation đã tồn tại nhưng chưa có productId, cập nhật nó
      conversation.productId = productId;
      await conversation.save();
    }

    // Populate lại để có thông tin đầy đủ
    conversation = await Conversation.findById(conversation._id)
      .populate("customerId", "fullName avatarUrl")
      .populate("sellerId", "fullName avatarUrl")
      .populate("productId", "title price image imageURL description stock");

    res.json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy tất cả conversations của user hiện tại (customer hoặc seller)
export const getMyConversations = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let conversations;
    if (userRole === "customer") {
      conversations = await Conversation.find({ customerId: userId })
        .populate("customerId", "fullName avatarUrl")
        .populate("sellerId", "fullName avatarUrl")
        .populate("productId", "title price image imageURL")
        .sort({ lastMessageAt: -1 });
    } else if (userRole === "seller") {
      conversations = await Conversation.find({ sellerId: userId })
        .populate("customerId", "fullName avatarUrl")
        .populate("sellerId", "fullName avatarUrl")
        .populate("productId", "title price image imageURL")
        .sort({ lastMessageAt: -1 });
    } else {
      return res.status(403).json({ message: "Only customers and sellers can view conversations" });
    }

    res.json(conversations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy messages của một conversation
export const getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Kiểm tra user có quyền truy cập conversation này không
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (
      conversation.customerId.toString() !== userId.toString() &&
      conversation.sellerId.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Lấy messages
    const messages = await Message.find({ conversationId })
      .populate("senderId", "fullName avatarUrl")
      .sort({ createdAt: 1 });

    // Đánh dấu messages chưa đọc là đã đọc (chỉ đánh dấu messages từ người kia)
    if (req.user.role === "customer") {
      // Customer đang xem, đánh dấu messages từ seller là đã đọc
      await Message.updateMany(
        {
          conversationId,
          senderId: conversation.sellerId,
          read: false,
        },
        {
          read: true,
          readAt: new Date(),
        }
      );
      // Reset unread count
      conversation.customerUnreadCount = 0;
    } else if (req.user.role === "seller") {
      // Seller đang xem, đánh dấu messages từ customer là đã đọc
      await Message.updateMany(
        {
          conversationId,
          senderId: conversation.customerId,
          read: false,
        },
        {
          read: true,
          readAt: new Date(),
        }
      );
      // Reset unread count
      conversation.sellerUnreadCount = 0;
    }
    await conversation.save();

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Gửi message
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const userId = req.user._id;

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId is required" });
    }

    // Kiểm tra user có quyền gửi message trong conversation này không
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (
      conversation.customerId.toString() !== userId.toString() &&
      conversation.sellerId.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Xử lý ảnh nếu có
    let imageUrl = null;
    let messageType = "text";
    
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
      messageType = content && content.trim() ? "text_image" : "image";
    } else if (!content || !content.trim()) {
      return res.status(400).json({ message: "Content or image is required" });
    }

    // Tạo message
    const message = await Message.create({
      conversationId,
      senderId: userId,
      content: content || "",
      imageUrl: imageUrl || null,
      messageType,
    });

    // Cập nhật conversation last message
    if (imageUrl) {
      conversation.lastMessage = content ? `${content} [Hình ảnh]` : "[Hình ảnh]";
    } else {
      conversation.lastMessage = content;
    }
    conversation.lastMessageAt = new Date();

    // Tăng unread count cho người nhận và reset unread count của người gửi
    if (conversation.customerId.toString() === userId.toString()) {
      conversation.sellerUnreadCount += 1;
      conversation.customerUnreadCount = 0; // Reset khi customer gửi message
    } else if (conversation.sellerId.toString() === userId.toString()) {
      conversation.customerUnreadCount += 1;
      conversation.sellerUnreadCount = 0; // Reset khi seller gửi message
    }

    await conversation.save();

    // Populate sender info
    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "fullName avatarUrl");

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Lấy một conversation cụ thể
export const getConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    const conversation = await Conversation.findById(conversationId)
      .populate("customerId", "fullName avatarUrl")
      .populate("sellerId", "fullName avatarUrl")
      .populate("productId", "title price image imageURL description stock");

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    if (
      conversation.customerId._id.toString() !== userId.toString() &&
      conversation.sellerId._id.toString() !== userId.toString()
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(conversation);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

