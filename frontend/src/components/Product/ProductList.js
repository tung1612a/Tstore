import React, { useState, useEffect, useMemo } from 'react';
import ProductCard from './ProductCard';
import './ProductList.css';

const ProductList = ({ keyword = '', categoryId = '', priceRange = { min: '', max: '' } }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const PAGE_SIZE = 6;
  const [page, setPage] = useState(1);

  // Reset trang khi đổi bộ lọc
  useEffect(() => {
    setPage(1);
  }, [keyword, categoryId, priceRange.min, priceRange.max]);

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
        if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, categoryId]);

  // ✅ Tính toán phân trang (trước khi return)
  const filteredProducts = useMemo(() => {
    const min = priceRange.min === '' ? null : Number(priceRange.min);
    const max = priceRange.max === '' ? null : Number(priceRange.max);

    if (Number.isNaN(min) || Number.isNaN(max)) {
      return products;
    }

    if (min !== null && max !== null && min > max) {
      return [];
    }

    return products.filter((product) => {
      const priceValue = Number(product.price);
      if (Number.isNaN(priceValue)) return true;

      if (min !== null && priceValue < min) return false;
      if (max !== null && priceValue > max) return false;

      return true;
    });
  }, [products, priceRange.min, priceRange.max]);

  const total = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;

  const pageItems = useMemo(
    () => filteredProducts.slice(startIndex, endIndex),
    [filteredProducts, startIndex, endIndex]
  );

  const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  const buildPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let p = 1; p <= totalPages; p++) pages.push(p);
      return pages;
    }
    pages.push(1);
    const left = Math.max(2, currentPage - 2);
    const right = Math.min(totalPages - 1, currentPage + 2);
    if (left > 2) pages.push('ellipsis-left');
    for (let p = left; p <= right; p++) pages.push(p);
    if (right < totalPages - 1) pages.push('ellipsis-right');
    pages.push(totalPages);
    return pages;
  };

  const pageNumbers = buildPageNumbers();

  // ✅ Các return luôn ở sau tất cả Hooks
  if (loading) return <div className="loading-message">Đang tải sản phẩm...</div>;
  if (error) return <div className="error-message">Không thể tải sản phẩm: {error}</div>;
  if (products.length === 0)
    return <div className="empty-message">Không có sản phẩm nào để hiển thị.</div>;

  if (filteredProducts.length === 0) {
    return (
      <div className="empty-message">
        Không tìm thấy sản phẩm phù hợp với mức giá bạn chọn.
      </div>
    );
  }

  return (
    <>
      <div className="products-grid">
        {pageItems.map((product) => (
          <ProductCard key={product._id || product.id} product={product} />
        ))}
      </div>

      <div className="pagination">
        <button className="page-button" onClick={() => goTo(1)} disabled={currentPage === 1}>
          «
        </button>
        <button className="page-button" onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1}>
          ‹
        </button>

        {pageNumbers.map((p, idx) =>
          typeof p === 'number' ? (
            <button
              key={`p-${p}-${idx}`}
              className={`page-button ${p === currentPage ? 'active' : ''}`}
              onClick={() => goTo(p)}
            >
              {p}
            </button>
          ) : (
            <span key={`e-${idx}`} className="page-ellipsis">…</span>
          )
        )}

        <button className="page-button" onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages}>
          ›
        </button>
        <button className="page-button" onClick={() => goTo(totalPages)} disabled={currentPage === totalPages}>
          »
        </button>
      </div>

      <div className="pagination-info">
        Hiển thị {startIndex + 1}–{Math.min(endIndex, total)} / {total} sản phẩm
      </div>
    </>
  );
};

export default ProductList;
