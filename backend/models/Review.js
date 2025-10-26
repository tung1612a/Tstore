import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true,
        },
        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        orderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Order',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        comment: {
            type: String,
            required: true,
            minlength: 10,
            maxlength: 1000,
        },
        helpful: {
            type: Number,
            default: 0,
        },
        unhelpful: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

// Index để tìm kiếm nhanh
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ reviewerId: 1 });
reviewSchema.index({ orderId: 1 });

export default mongoose.model('Review', reviewSchema);