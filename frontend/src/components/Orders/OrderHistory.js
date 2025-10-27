import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  FiPackage,
  FiSearch,
  FiFilter,
  FiXCircle,
  FiCheckCircle,
  FiTruck,
  FiChevronDown,
  FiChevronUp,
  FiArrowLeft,
  FiRefreshCw,
} from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUserRole, getRole } from '../../store/userSlice';
import './OrderHistory.css';
import { Button } from 'react-bootstrap';

const PAGE_SIZE = 10;

const statusMeta = {
  pending: { label: 'Chờ xác nhận', color: '#856404', bg: '#fff3cd', icon: <FiPackage /> },
  confirmed: { label: 'Đã xác nhận', color: '#0c5460', bg: '#d1ecf1', icon: <FiCheckCircle /> },
  paid: { label: 'Đã thanh toán', color: '#155724', bg: '#d4edda', icon: <FiCheckCircle /> },
  shipped: { label: 'Đã giao hàng', color: '#004085', bg: '#cce7ff', icon: <FiTruck /> },
  completed: { label: 'Hoàn thành', color: '#28a745', bg: '#d4edda', icon: <FiCheckCircle /> },
  cancelled: { label: 'Đã hủy', color: '#721c24', bg: '#f8d7da', icon: <FiXCircle /> },
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Memoized OrderCard component to prevent unnecessary re-renders
const OrderCard = React.memo(({ order, meta, expanded, details, detailsLoading, toggleDetails, handleOpenCancelModal }) => {
  return (
    <div className={`order-card ${expanded[order._id] ? 'expanded' : ''}`}>
      <div className="card-header">
        <div className="header-left">
          <div className="id-area">
            <div className="order-id">#{order._id.slice(-8)}</div>
            <div className="order-date">{formatDate(order.createdAt)}</div>
          </div>
          <div className="order-meta">
            <div className="order-total">{order.totalPrice?.toLocaleString()}đ</div>
            <div className="order-status">
              <span className="badge" style={{ color: meta.color, background: meta.bg }}>
                {meta.icon}
                <span>{meta.label}</span>
              </span>
            </div>
            {order.paymentStatus && (
              <div className="order-payment">
                <span className="badge payment">{order.paymentStatus}</span>
                <div className="pay-method">{order.paymentMethod || '—'}</div>
              </div>
            )}
          </div>
        </div>
        <div className="header-right">
          <button className="toggle" aria-expanded={!!expanded[order._id]} onClick={() => toggleDetails(order._id)}>
            <div className="toggle-icon">{expanded[order._id] ? <FiChevronUp /> : <FiChevronDown />}</div>
          </button>
        </div>
      </div>

      <div className={`order-details ${expanded[order._id] ? 'open' : ''}`}>
        {detailsLoading[order._id] ? (
          <div className="loading-block">
            <div className="spinner" />
          </div>
        ) : (
          <>
            <div className="items-section">
              <h4 className="section-title">Chi tiết đơn hàng</h4>
              <div className="items-cards">
                {(details[order._id]?.items || []).map((item, idx) => (
                  <div key={item._id} className="item-card" style={{ '--index': idx }}>
                    <div className="item-left">
                      <div className="prod-thumb">
                        <img src={item.productId?.imageURL || item.productId?.image} alt={item.productId?.title} />
                      </div>
                      <div className="prod-info">
                        <div className="prod-title">{item.productId?.title}</div>
                        <div className="prod-sub">{item.productId?.description?.slice(0, 80)}</div>
                      </div>
                    </div>
                    <div className="item-right">
                      <div className="price">{(item.unitPrice || item.productId?.price)?.toLocaleString()}đ</div>
                      <div className="quantity">
                        Số lượng: <strong>{item.quantity}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Cancel Button - Only show for pending/confirmed orders */}
            {!order.status || (order.status !== 'cancelled' && order.status !== 'completed' && order.status !== 'shipped') ? (
              <div className="order-actions" style={{ padding: '20px', borderTop: '1px solid #eee' }}>
                <button 
                  className="btn-cancel-order"
                  onClick={() => handleOpenCancelModal(order)}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FiXCircle size={18} />
                  Hủy đơn hàng
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
});

const OrderHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector(selectUserRole);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);
  const [expanded, setExpanded] = useState({});
  const [details, setDetails] = useState({});
  const [detailsLoading, setDetailsLoading] = useState({});
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    dispatch(getRole());
  }, [dispatch]);

  useEffect(() => {
    setOrders([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
  }, [status]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({ page, limit: PAGE_SIZE });
        if (status) params.append('status', status);
        const res = await fetch(`http://localhost:5000/api/orders/buyer?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrders((prev) => (page === 1 ? data.orders : [...prev, ...data.orders]));
          setTotalPages(data.totalPages);
          setHasMore(page < data.totalPages);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    };
    fetchOrders();
  }, [page, status, role]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && !isFetchingMore) {
          setIsFetchingMore(true);
          setPage((p) => p + 1);
        }
      },
      { root: null, rootMargin: '200px', threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, isFetchingMore]);

  const filtered = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase();
    return orders.filter(
      (o) =>
        o._id?.toLowerCase().includes(q) ||
        o.buyerId?.name?.toLowerCase().includes(q) ||
        o.storeId?.storeName?.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const handleOpenCancelModal = (order) => {
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Vui lòng nhập lý do hủy đơn hàng');
      return;
    }

    if (!selectedOrder) return;

    setIsCancelling(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${selectedOrder._id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ reason: cancelReason }),
      });

      if (response.ok) {
        setOrders((prev) => prev.map((o) => (o._id === selectedOrder._id ? { ...o, status: 'cancelled' } : o)));
        setShowCancelModal(false);
        setCancelReason('');
        setSelectedOrder(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra khi hủy đơn hàng');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Có lỗi xảy ra khi hủy đơn hàng');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="order-history">
        <div className="history-container">
          <div className="loading-block">
            <div className="spinner" />
            <p>Đang tải đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history">
      <div className="history-container">
        <div className="history-header">
          <div className="header-top">
            <button 
              className="back-btn"
              onClick={() => navigate(-1)}
              title="Quay lại trang trước"
            >
              <FiArrowLeft size={20} />
              <span>Quay lại</span>
            </button>
            <div className="header-actions">
              <button 
                className="refresh-btn"
                onClick={() => window.location.reload()}
                disabled={loading}
              >
                <FiRefreshCw className={loading ? 'spinning' : ''} size={18} />
                Làm mới
              </button>
            </div>
          </div>
          <div className="title-wrap">
            <h1>Lịch sử đơn hàng</h1>
            <p>Theo dõi đơn hàng của bạn</p>
          </div>
          <div className="quick-stats">
            <div className="stat">
              <span className="label">Tổng</span>
              <span className="value">{orders.length}</span>
            </div>
            <div className="stat">
              <span className="label">Hoàn thành</span>
              <span className="value">{orders.filter((o) => o.status === 'completed').length}</span>
            </div>
          </div>
        </div>

        <div className="history-filters">
          <div className="search">
            <FiSearch className="icon" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm theo mã, người bán/người mua, cửa hàng..."
            />
          </div>
          <div className="filters">
            <FiFilter className="fi" />
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="paid">Đã thanh toán</option>
              <option value="shipped">Đã giao hàng</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <FiPackage size={64} />
            <h3>Không có đơn hàng</h3>
            <p>Hãy thử điều chỉnh bộ lọc hoặc từ khóa</p>
          </div>
        ) : (
          <div className="history-list">
            {filtered.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                meta={statusMeta[order.status] || statusMeta.pending}
                expanded={expanded}
                details={details}
                detailsLoading={detailsLoading}
                handleOpenCancelModal={handleOpenCancelModal}
                toggleDetails={async (orderId) => {
                  // First, determine if we're opening or closing
                  const isCurrentlyOpen = expanded[orderId];

                  if (isCurrentlyOpen) {
                    // If we're closing, just close this one
                    setExpanded((prev) => ({ ...prev, [orderId]: false }));
                    return;
                  }

                  // If we're opening, close others first
                  setExpanded((prev) => {
                    const newState = {};
                    // Set all to false
                    Object.keys(prev).forEach((key) => {
                      newState[key] = false;
                    });
                    // Set current to true
                    newState[orderId] = true;
                    return newState;
                  });

                  // Only fetch details if we don't have them yet
                  if (!details[orderId]) {
                    setDetailsLoading((prev) => ({ ...prev, [orderId]: true }));
                    try {
                      const token = localStorage.getItem('token');
                      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      if (res.ok) {
                        const data = await res.json();
                        setDetails((prev) => ({ ...prev, [orderId]: data }));
                      }
                    } catch (e) {
                      console.error('Error fetching order details:', e);
                    } finally {
                      setDetailsLoading((prev) => ({ ...prev, [orderId]: false }));
                    }
                  }
                }}
              />
            ))}
            {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
          </div>
        )}

        {hasMore && (
          <div className="infinite-loader">
            {isFetchingMore ? <div className="spinner" /> : <div className="muted">Kéo để tải thêm...</div>}
          </div>
        )}
      </div>
      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={() => !isCancelling && setShowCancelModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 16px 0', color: '#2c3e50', fontSize: '1.5rem' }}>Hủy đơn hàng</h2>
            <p style={{ margin: '0 0 24px 0', color: '#6c757d' }}>
              Bạn có chắc chắn muốn hủy đơn hàng #{selectedOrder?._id.slice(-8)}? Vui lòng nhập lý do hủy đơn hàng.
            </p>
            
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Nhập lý do hủy đơn hàng..."
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '12px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '0.95rem',
                fontFamily: 'inherit',
                resize: 'vertical',
                marginBottom: '24px'
              }}
              disabled={isCancelling}
            />

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                  setSelectedOrder(null);
                }}
                disabled={isCancelling}
                style={{
                  padding: '12px 24px',
                  background: '#f8f9fa',
                  color: '#2c3e50',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isCancelling ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling || !cancelReason.trim()}
                style={{
                  padding: '12px 24px',
                  background: isCancelling || !cancelReason.trim() ? '#ccc' : 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: (isCancelling || !cancelReason.trim()) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isCancelling ? 'Đang xử lý...' : (
                  <>
                    <FiXCircle size={18} />
                    Xác nhận hủy
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
