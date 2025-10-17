import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import './ProductList.css';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Gọi API qua proxy đã cấu hình trong package.json
                const response = await fetch('/api/products');
                if (!response.ok) {
                    throw new Error(`Lỗi HTTP: ${response.status}`);
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []); // Mảng rỗng đảm bảo chỉ gọi 1 lần

    // Xử lý các trạng thái giao diện
    if (loading) return <div className="loading-message">Đang tải sản phẩm...</div>;
    if (error) return <div className="error-message">Không thể tải sản phẩm: {error}</div>;
    if (products.length === 0) return <div className="empty-message">Không có sản phẩm nào để hiển thị.</div>;

    return (
        <div className="products-grid">
            {products.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    );
};

export default ProductList;