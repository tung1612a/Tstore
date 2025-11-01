import React, { useEffect, useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { FiStar } from "react-icons/fi";
import {
    getProductReviews,
    getUserReview,
    createReview,
    updateReview,
    deleteReview,
} from "../services/reviewService";

const ProductReviews = ({ productId, orderId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [userReview, setUserReview] = useState(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editingReviewId, setEditingReviewId] = useState(null);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");
    const currentUserId = user?._id || user?.id;

    // Tính rating trung bình và số lượng reviews
    const { averageRating, totalReviews } = useMemo(() => {
        if (!reviews || reviews.length === 0) {
            return { averageRating: 0, totalReviews: 0 };
        }
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return {
            averageRating: (sum / reviews.length).toFixed(1),
            totalReviews: reviews.length
        };
    }, [reviews]);

    // Lấy danh sách review
    const fetchReviews = async () => {
        try {
            const data = await getProductReviews(productId);
            setReviews(data || []);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            setReviews([]);
        } finally {
            setLoading(false);
        }
    };

    // Lấy review của user hiện tại
    const fetchUserReview = async () => {
        if (!token) return;
        try {
            const data = await getUserReview(productId, token);
            setUserReview(data);
            setRating(data.rating);
            setComment(data.comment);
        } catch (err) {
            setUserReview(null);
        }
    };

    useEffect(() => {
        if (!productId) {
            setLoading(false);
            return;
        }
        fetchReviews();
        if (token) fetchUserReview();
    }, [productId, token]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rating || rating === 0) {
            alert("Vui lòng chọn số sao đánh giá!");
            return;
        }

        if (!comment || comment.trim().length < 10) {
            alert("Vui lòng nhập nhận xét ít nhất 10 ký tự!");
            return;
        }

        try {
            const reviewData = { productId, orderId, rating, comment };

            if (isEditing && editingReviewId) {
                await updateReview(editingReviewId, reviewData, token);
                alert("Đã cập nhật review!");
            } else {
                await createReview(reviewData, token);
                alert("Cảm ơn bạn đã đánh giá!");
            }

            setIsEditing(false);
            setEditingReviewId(null);
            setRating(0);
            setComment("");
            fetchReviews();
            fetchUserReview();
        } catch (err) {
            console.error("Error submitting review:", err);
            const errorMessage = err.response?.data?.message || err.message || "Không thể gửi đánh giá. Vui lòng thử lại!";
            alert(errorMessage);
        }
    };

    const handleDelete = async () => {
        if (window.confirm("Bạn có chắc muốn xóa review này?")) {
            await deleteReview(userReview._id, token);
            setUserReview(null);
            setComment("");
            setRating(5);
            fetchReviews();
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                <p>Đang tải đánh giá...</p>
            </div>
        );
    }

    return (
        <div className="reviews-section">
            {/* Header với rating trung bình */}
            <div style={{ marginBottom: "30px", paddingBottom: "20px", borderBottom: "2px solid #f0f0f0" }}>
                <h3 style={{ marginBottom: "15px", color: "#333", fontSize: "24px", fontWeight: "600" }}>
                    Đánh giá sản phẩm
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "32px", fontWeight: "700", color: "#ee4d2d" }}>
                            {averageRating > 0 ? averageRating : "0"}
                        </span>
                        <div style={{ display: "flex", gap: "4px" }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FiStar
                                    key={star}
                                    size={20}
                                    color={star <= Math.round(averageRating) ? "#ffc107" : "#ddd"}
                                    fill={star <= Math.round(averageRating) ? "#ffc107" : "none"}
                                />
                            ))}
                        </div>
                    </div>
                    <span style={{ color: "#666", fontSize: "14px" }}>
                        ({totalReviews} {totalReviews === 1 ? 'đánh giá' : 'đánh giá'})
                    </span>
                </div>
            </div>

            {/* Form chỉnh sửa review - chỉ hiển thị khi đang edit */}
            {isEditing && editingReviewId && (
                <div style={{
                    background: "#f8f9fa",
                    padding: "24px",
                    borderRadius: "12px",
                    marginBottom: "20px"
                }}>
                    <h5 style={{ marginBottom: "20px", color: "#333" }}>Chỉnh sửa đánh giá</h5>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "12px",
                                color: "#333",
                                fontSize: "14px",
                                fontWeight: "500"
                            }}>
                                Chọn số sao:
                            </label>
                            <div style={{
                                display: "flex",
                                gap: "8px",
                                alignItems: "center"
                            }}>
                                {[1, 2, 3, 4, 5].map((star) => {
                                    const isFilled = star <= (hoverRating || rating);
                                    return (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                padding: "4px",
                                                cursor: "pointer",
                                                transition: "transform 0.2s ease",
                                                outline: "none"
                                            }}
                                        >
                                            <FiStar
                                                size={28}
                                                color={isFilled ? "#ffc107" : "#ddd"}
                                                fill={isFilled ? "#ffc107" : "none"}
                                                style={{
                                                    filter: isFilled ? "drop-shadow(0 2px 4px rgba(255, 193, 7, 0.4))" : "none",
                                                    transition: "all 0.2s ease"
                                                }}
                                            />
                                        </button>
                                    );
                                })}
                                {rating > 0 && (
                                    <span style={{ marginLeft: "8px", color: "#666", fontSize: "14px" }}>
                                        ({rating}/5)
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            <label style={{
                                display: "block",
                                marginBottom: "8px",
                                color: "#333",
                                fontSize: "14px",
                                fontWeight: "500"
                            }}>
                                Nhận xét của bạn:
                            </label>
                            <textarea
                                placeholder="Nhập nhận xét của bạn (ít nhất 10 ký tự)..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                required
                                rows="4"
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "1px solid #ddd",
                                    fontSize: "14px",
                                    fontFamily: "inherit",
                                    resize: "vertical",
                                    outline: "none",
                                    transition: "border-color 0.2s",
                                }}
                            />
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                type="submit"
                                disabled={rating === 0}
                                style={{
                                    background: rating === 0
                                        ? "linear-gradient(135deg, #ccc 0%, #999 100%)"
                                        : "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "12px 24px",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    cursor: rating === 0 ? "not-allowed" : "pointer",
                                    transition: "all 0.3s ease",
                                    opacity: rating === 0 ? 0.6 : 1
                                }}
                            >
                                Lưu thay đổi
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditingReviewId(null);
                                    setRating(0);
                                    setComment("");
                                }}
                                style={{
                                    background: "#f0f0f0",
                                    color: "#666",
                                    border: "none",
                                    borderRadius: "8px",
                                    padding: "12px 24px",
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    cursor: "pointer",
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Danh sách tất cả đánh giá */}
            <div>
                <h5 style={{ marginBottom: "20px", color: "#333", fontSize: "18px" }}>
                    {reviews.length > 0 ? `Tất cả đánh giá (${reviews.length})` : "Đánh giá"}
                </h5>
                {reviews.length === 0 ? (
                    <div style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "#999",
                        background: "#f8f9fa",
                        borderRadius: "12px"
                    }}>
                        <p style={{ margin: 0, fontSize: "16px" }}>Chưa có đánh giá nào cho sản phẩm này.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {reviews.map((r) => {
                            const isMyReview = currentUserId && (
                                r.reviewerId?._id?.toString() === currentUserId.toString() ||
                                r.reviewerId?.toString() === currentUserId.toString() ||
                                (r.reviewerId && typeof r.reviewerId === 'string' && r.reviewerId === currentUserId)
                            );
                            // Ở ProductDetail, hiển thị nút chỉnh sửa/xóa cho tất cả review của user (không cần check orderId)
                            const isMyReviewForDisplay = isMyReview;

                            return (
                                <div
                                    key={r._id}
                                    style={{
                                        padding: "20px",
                                        background: isMyReviewForDisplay ? "#e8f5e9" : "#fff",
                                        borderRadius: "12px",
                                        border: isMyReviewForDisplay ? "1px solid #c8e6c9" : "1px solid #e0e0e0",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            {r.reviewerId?.avatarURL ? (
                                                <img
                                                    src={r.reviewerId.avatarURL}
                                                    alt={r.reviewerId.fullName || "Avatar"}
                                                    style={{
                                                        width: "40px",
                                                        height: "40px",
                                                        borderRadius: "50%",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: "40px",
                                                    height: "40px",
                                                    borderRadius: "50%",
                                                    background: "#ddd",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "#666",
                                                    fontSize: "16px",
                                                    fontWeight: "600"
                                                }}>
                                                    {(r.reviewerId?.fullName || "U")[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <strong style={{ color: "#333", fontSize: "16px", display: "block" }}>
                                                    {r.reviewerId?.fullName || "Người dùng ẩn danh"}
                                                </strong>
                                                <span style={{ color: "#999", fontSize: "12px" }}>
                                                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : ''}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: "4px", alignItems: "center", marginBottom: "10px" }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FiStar
                                                key={star}
                                                size={16}
                                                color={star <= r.rating ? "#ffc107" : "#ddd"}
                                                fill={star <= r.rating ? "#ffc107" : "none"}
                                            />
                                        ))}
                                        <span style={{ marginLeft: "8px", color: "#666", fontSize: "14px" }}>
                                            {r.rating}/5
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, color: "#555", lineHeight: "1.6", fontSize: "14px" }}>
                                        {r.comment}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductReviews;
