import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { FiStar } from "react-icons/fi";
import { createReview, getProductReviews, getUserReview, updateReview, deleteReview } from "../../services/reviewService";

const ReviewSection = ({ productId, orderId }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState("");
    const [userReview, setUserReview] = useState(null);
    const [editingReviewId, setEditingReviewId] = useState(null); // Lưu reviewId khi đang chỉnh sửa
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    const token = localStorage.getItem("token");
    const currentUserId = user?._id || user?.id;

    // 🔹 Lấy danh sách review của sản phẩm + review của user hiện tại
    useEffect(() => {
        if (!productId) {
            setLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                // Lấy review của user cho sản phẩm trong đơn hàng này (nếu có orderId)
                // Nếu không có orderId hoặc không tìm thấy review, thì user có thể review
                const myReview = orderId && token
                    ? await getUserReview(productId, token, orderId).catch(() => null)
                    : null;
                
                // Lấy tất cả reviews của sản phẩm (để hiển thị danh sách)
                const allReviews = await getProductReviews(productId).catch(() => []);
                
                setReviews(allReviews || []);
                setUserReview(myReview || null);
            } catch (err) {
                console.error("Error fetching reviews:", err);
                setReviews([]);
                setUserReview(null);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [productId, orderId, token]);

    // 🔹 Gửi đánh giá
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Kiểm tra rating
        if (!rating || rating === 0) {
            alert("Vui lòng chọn số sao đánh giá!");
            return;
        }
        
        // Kiểm tra comment có đủ độ dài (tối thiểu 10 ký tự theo backend)
        if (!comment || comment.trim().length < 10) {
            alert("Vui lòng nhập nhận xét ít nhất 10 ký tự!");
            return;
        }
        
        try {
            console.log('Submitting review:', { productId, rating, comment, orderId });
            
            // Nếu đang chỉnh sửa review cũ
            if (isEditing && editingReviewId) {
                await updateReview(editingReviewId, { productId, rating, comment, orderId }, token);
                alert("Đã cập nhật đánh giá!");
            } else {
                // Tạo review mới
                await createReview({ productId, rating, comment, orderId }, token);
                alert("Cảm ơn bạn đã đánh giá!");
            }
            
            // Refresh lại data để hiển thị review vừa tạo/cập nhật
            const myReview = orderId && token
                ? await getUserReview(productId, token, orderId).catch(() => null)
                : null;
            setUserReview(myReview || null);
            setRating(0);
            setComment("");
            setIsEditing(false);
            setEditingReviewId(null);
            
            // Refresh danh sách reviews
            const allReviews = await getProductReviews(productId).catch(() => []);
            setReviews(allReviews || []);
        } catch (err) {
            console.error("Error submitting review:", err);
            console.error("Error details:", {
                response: err.response?.data,
                status: err.response?.status,
                message: err.message
            });
            const errorMessage = err.response?.data?.message || err.message || "Không thể gửi đánh giá. Vui lòng thử lại!";
            alert(errorMessage);
        }
    };

    if (!productId) {
        return null;
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <p>Đang tải đánh giá...</p>
            </div>
        );
    }

    return (
        <div style={{ 
            background: "#ffffff", 
            padding: "24px", 
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
            <h4 style={{ 
                marginBottom: "20px", 
                color: "#333",
                fontSize: "20px",
                fontWeight: "600"
            }}>
                Đánh giá sản phẩm
            </h4>

            {/* Form đánh giá - chỉ hiển thị nếu user chưa review cho order này */}
            {!userReview && !isEditing && (
                // Form thêm review
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
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = "scale(1.15)";
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = "scale(1)";
                                        }}
                                    >
                                        <FiStar
                                            size={32}
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
                                <span style={{ 
                                    marginLeft: "8px", 
                                    color: "#666",
                                    fontSize: "14px"
                                }}>
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
                            placeholder="Nhập nhận xét của bạn..."
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
                                lineHeight: "1.5",
                            }}
                            onFocus={(e) => e.target.style.borderColor = "#28a745"}
                            onBlur={(e) => e.target.style.borderColor = "#ddd"}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={rating === 0}
                        style={{
                            background: rating === 0 
                                ? "linear-gradient(135deg, #ccc 0%, #999 100%)"
                                : "linear-gradient(135deg, #ff6b6b 0%, #ee4d2d 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            padding: "12px 24px",
                            fontSize: "16px",
                            fontWeight: "600",
                            cursor: rating === 0 ? "not-allowed" : "pointer",
                            transition: "all 0.3s ease",
                            boxShadow: rating === 0 
                                ? "none"
                                : "0 2px 4px rgba(238, 77, 45, 0.3)",
                            alignSelf: "flex-start",
                            opacity: rating === 0 ? 0.6 : 1
                        }}
                        onMouseOver={(e) => {
                            if (rating > 0) {
                                e.target.style.transform = "translateY(-2px)";
                                e.target.style.boxShadow = "0 4px 8px rgba(238, 77, 45, 0.4)";
                            }
                        }}
                        onMouseOut={(e) => {
                            if (rating > 0) {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "0 2px 4px rgba(238, 77, 45, 0.3)";
                            }
                        }}
                    >
                        Gửi đánh giá
                    </button>
                </form>
            )}

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
                                                size={32}
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
                                placeholder="Nhập nhận xét của bạn..."
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
                                    lineHeight: "1.5",
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
            <div style={{ marginTop: "30px" }}>
                <h5 style={{ marginBottom: "20px", color: "#333", fontSize: "18px" }}>
                    Tất cả đánh giá ({reviews.length})
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
                        {reviews.map((rev) => {
                            const isMyReview = currentUserId && (
                                rev.reviewerId?._id?.toString() === currentUserId.toString() ||
                                rev.reviewerId?.toString() === currentUserId.toString() ||
                                (rev.reviewerId && typeof rev.reviewerId === 'string' && rev.reviewerId === currentUserId)
                            );
                            const isMyReviewForThisOrder = isMyReview && userReview && rev._id === userReview._id;

                            return (
                                <div
                                    key={rev._id}
                                    style={{
                                        padding: "20px",
                                        background: isMyReviewForThisOrder ? "#e8f5e9" : "#fff",
                                        borderRadius: "12px",
                                        border: isMyReviewForThisOrder ? "1px solid #c8e6c9" : "1px solid #e0e0e0",
                                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
                                    }}
                                >
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            {rev.reviewerId?.avatarURL ? (
                                                <img
                                                    src={rev.reviewerId.avatarURL}
                                                    alt={rev.reviewerId.fullName || "Avatar"}
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
                                                    {(rev.reviewerId?.fullName || "U")[0].toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <strong style={{ color: "#333", fontSize: "16px", display: "block" }}>
                                                    {rev.reviewerId?.fullName || "Người dùng ẩn danh"}
                                                </strong>
                                                <span style={{ color: "#999", fontSize: "12px" }}>
                                                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString('vi-VN') : ''}
                                                </span>
                                            </div>
                                        </div>
                                        {isMyReviewForThisOrder && (
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                <button
                                                    onClick={() => {
                                                        setRating(rev.rating);
                                                        setComment(rev.comment);
                                                        setEditingReviewId(rev._id);
                                                        setIsEditing(true);
                                                    }}
                                                    style={{
                                                        background: "#fff",
                                                        border: "1px solid #4caf50",
                                                        color: "#4caf50",
                                                        padding: "6px 12px",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        fontSize: "14px",
                                                        fontWeight: "500"
                                                    }}
                                                >
                                                    ✏️ Chỉnh sửa
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm("Bạn có chắc muốn xóa đánh giá này?")) {
                                                            try {
                                                                await deleteReview(rev._id, token);
                                                                alert("Đã xóa đánh giá!");
                                                                // Refresh data
                                                                const myReview = orderId && token
                                                                    ? await getUserReview(productId, token, orderId).catch(() => null)
                                                                    : null;
                                                                setUserReview(myReview || null);
                                                                const allReviews = await getProductReviews(productId).catch(() => []);
                                                                setReviews(allReviews || []);
                                                            } catch (err) {
                                                                console.error("Error deleting review:", err);
                                                                alert("Không thể xóa đánh giá. Vui lòng thử lại!");
                                                            }
                                                        }
                                                    }}
                                                    style={{
                                                        background: "#fff",
                                                        border: "1px solid #f44336",
                                                        color: "#f44336",
                                                        padding: "6px 12px",
                                                        borderRadius: "6px",
                                                        cursor: "pointer",
                                                        fontSize: "14px",
                                                        fontWeight: "500"
                                                    }}
                                                >
                                                    🗑️ Xóa
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <div style={{ display: "flex", gap: "4px", alignItems: "center", marginBottom: "10px" }}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <FiStar
                                                key={star}
                                                size={16}
                                                color={star <= rev.rating ? "#ffc107" : "#ddd"}
                                                fill={star <= rev.rating ? "#ffc107" : "none"}
                                            />
                                        ))}
                                        <span style={{ marginLeft: "8px", color: "#666", fontSize: "14px" }}>
                                            {rev.rating}/5
                                        </span>
                                    </div>
                                    <p style={{ margin: 0, color: "#555", lineHeight: "1.6", fontSize: "14px" }}>
                                        {rev.comment}
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

export default ReviewSection;
