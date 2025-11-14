import Review from '../models/Review.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';

// Tạo review mới
export const createReview = async (req, res) => {
    try {
        const { productId, orderId, rating, comment } = req.body;

        // Kiểm tra rating hợp lệ
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: "Rating phải từ 1 đến 5" });
        }

        // Kiểm tra user đã mua sản phẩm này chưa
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        // Kiểm tra user có phải là buyer của order này không (Order model dùng buyerId)
        const userId = req.user._id || req.user.id;
        if (order.buyerId.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Bạn không có quyền review sản phẩm này" });
        }

        // Kiểm tra order status phải là 'completed' (đã xác nhận nhận hàng)
        if (order.status !== 'completed') {
            return res.status(400).json({ 
                message: "Bạn chỉ có thể đánh giá sản phẩm sau khi xác nhận đã nhận hàng" 
            });
        }

        // Kiểm tra sản phẩm có trong order này không
        const orderItem = await OrderItem.findOne({ 
            orderId, 
            productId 
        });
        if (!orderItem) {
            return res.status(400).json({ message: "Sản phẩm này không có trong đơn hàng" });
        }

        // Kiểm tra xem user đã review sản phẩm này trong đơn hàng này chưa
        const existingReview = await Review.findOne({
            productId,
            orderId,
            reviewerId: userId,
        });

        if (existingReview) {
            return res.status(400).json({ message: "Bạn đã review sản phẩm này rồi" });
        }

        const review = await Review.create({
            productId,
            orderId,
            reviewerId: userId,
            rating,
            comment,
        });

        const populatedReview = await review.populate('reviewerId', 'fullName avatarURL');
        res.status(201).json(populatedReview);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi tạo review", error: error.message });
    }
};

// Lấy reviews của một sản phẩm
export const getProductReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ productId: req.params.productId })
            .populate('reviewerId', 'fullName avatarURL')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy reviews", error: error.message });
    }
};

// Lấy review của user cho một sản phẩm
export const getUserProductReview = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { productId } = req.params;
        const { orderId } = req.query; // Lấy orderId từ query params

        // Nếu có orderId, kiểm tra review cho cả productId và orderId
        // Nếu không có orderId, chỉ kiểm tra theo productId (backward compatibility)
        const query = {
            productId,
            reviewerId: userId,
        };
        
        if (orderId) {
            query.orderId = orderId;
        }

        const review = await Review.findOne(query);

        if (!review) {
            return res.status(404).json({ message: "Bạn chưa review sản phẩm này" });
        }

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi lấy review", error: error.message });
    }
};

// Cập nhật review
export const updateReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Không tìm thấy review" });
        }

        const userId = req.user._id || req.user.id;
        if (review.reviewerId.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Bạn không có quyền sửa review này" });
        }

        const { rating, comment } = req.body;

        if (rating) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ message: "Rating phải từ 1 đến 5" });
            }
            review.rating = rating;
        }

        if (comment) {
            if (comment.length < 10 || comment.length > 1000) {
                return res.status(400).json({ message: "Comment phải từ 10 đến 1000 ký tự" });
            }
            review.comment = comment;
        }

        await review.save();
        const updated = await review.populate('reviewerId', 'fullName avatarURL');
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi cập nhật review", error: error.message });
    }
};

// Xóa review
export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ message: "Không tìm thấy review" });
        }

        const userId = req.user._id || req.user.id;
        if (review.reviewerId.toString() !== userId.toString()) {
            return res.status(401).json({ message: "Bạn không có quyền xóa review này" });
        }

        await Review.findByIdAndDelete(req.params.id);
        res.json({ message: "Xóa review thành công" });
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi xóa review", error: error.message });
    }
};

// Đánh dấu review hữu ích
export const markHelpful = async (req, res) => {
    try {
        const review = await Review.findByIdAndUpdate(
            req.params.id,
            { $inc: { helpful: 1 } },
            { new: true }
        );

        res.json(review);
    } catch (error) {
        res.status(500).json({ message: "Lỗi khi đánh dấu hữu ích", error: error.message });
    }
};