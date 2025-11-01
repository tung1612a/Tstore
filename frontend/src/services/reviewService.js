import axios from "axios";

const API_URL = "http://localhost:5000/api/reviews";

// Lấy tất cả review của 1 sản phẩm
export const getProductReviews = async (productId) => {
    const res = await axios.get(`${API_URL}/product/${productId}`);
    return res.data;
};

// Lấy review của user hiện tại cho sản phẩm
// Nếu có orderId, sẽ kiểm tra review cho sản phẩm trong đơn hàng cụ thể
export const getUserReview = async (productId, token, orderId = null) => {
    const url = orderId 
        ? `${API_URL}/product/${productId}/user?orderId=${orderId}`
        : `${API_URL}/product/${productId}/user`;
    const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Gửi review mới
export const createReview = async (reviewData, token) => {
    const res = await axios.post(API_URL, reviewData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Cập nhật review
export const updateReview = async (id, reviewData, token) => {
    const res = await axios.put(`${API_URL}/${id}`, reviewData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Xóa review
export const deleteReview = async (id, token) => {
    const res = await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
