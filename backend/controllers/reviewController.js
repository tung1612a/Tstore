import Review from '../models/Review.js';
import Order from '../models/Order.js';

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

        if (order.userId.toString() !== req.user.id) {
            return res.status(401).json({ message: "Bạn không có quyền review sản phẩm này" });
        }

        // Kiểm tra xem user đã review sản phẩm này trong đơn hàng này chưa
        const existingReview = await Review.findOne({
            productId,
            orderId,
            reviewerId: req.user.id,
        });

        if (existingReview) {
            return res.status(400).json({ message: "Bạn đã review sản phẩm này rồi" });
        }

        const review = await Review.create({
            productId,
            orderId,
            reviewerId: req.user.id,
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
        const review = await Review.findOne({
            productId: req.params.productId,
            reviewerId: req.user.id,
        });

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

        if (review.reviewerId.toString() !== req.user.id) {
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

        if (review.reviewerId.toString() !== req.user.id) {
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