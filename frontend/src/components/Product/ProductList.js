import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import './ProductList.css';

const ProductList = ({ keyword = '', categoryId = '' }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const params = new URLSearchParams();
                if (keyword) params.set('q', keyword);
                if (categoryId) params.set('categoryId', categoryId);
                const query = params.toString();
                const url = query ? `/api/products?${query}` : '/api/products';
                const response = await fetch(url);
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
    }, [keyword, categoryId]);

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