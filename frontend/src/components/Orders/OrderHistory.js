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
  FiAlertTriangle,
  FiImage,
  FiTrash2,
  FiEye,
} from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUserRole, getRole } from '../../store/userSlice';
import { useAuth } from '../../contexts/AuthContext';
import './OrderHistory.css';
import { Button, Toast, ToastContainer } from 'react-bootstrap';
import ReviewSection from './ReviewSection';

const PAGE_SIZE = 10;

const statusMeta = {
  pending: { label: 'Chờ xác nhận', color: '#856404', bg: '#fff3cd', icon: <FiPackage /> },
  confirmed: { label: 'Đã xác nhận', color: '#0c5460', bg: '#d1ecf1', icon: <FiCheckCircle /> },
  awaiting_delivery: { label: 'Chờ giao hàng', color: '#0c5460', bg: '#d1ecf1', icon: <FiPackage /> },
  shipping: { label: 'Đang giao hàng', color: '#856404', bg: '#fff3cd', icon: <FiTruck /> },
  delivered: { label: 'Đã giao hàng', color: '#004085', bg: '#cce7ff', icon: <FiTruck /> },
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

// Component con để hiển thị nút đánh giá và form review
const ReviewButton = ({ productId, orderId, orderStatus, role, order, user }) => {
  const [showReview, setShowReview] = useState(false);

  // Kiểm tra điều kiện hiển thị nút đánh giá

  // Hiển thị cho buyer, customer hoặc seller (khi họ là người mua)
  if (role !== 'buyer' && role !== 'customer' && role !== 'seller') {
    return null;
  }

  // Kiểm tra user có phải là buyer của order này không
  if (order && user && order.buyerId) {
    const buyerId = order.buyerId._id || order.buyerId;
    const userId = user._id || user.id;
    if (String(buyerId) !== String(userId)) {
      return null;
    }
  }

  // Phải có productId
  if (!productId) {
    return null;
  }

  // Kiểm tra status - chỉ hiển thị khi order đã completed (đã xác nhận nhận hàng)
  const statusNormalized = String(orderStatus || '')
    .toLowerCase()
    .trim();
  const isCompleted = statusNormalized === 'completed' || orderStatus === 'completed';

  if (!isCompleted) {
    return null;
  }

  if (showReview) {
    return (
      <div
        style={{
          marginTop: '20px',
          padding: '20px',
          background: '#ffffff',
          borderRadius: '10px',
          border: '2px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h4 style={{ margin: 0, color: '#333' }}>Đánh giá sản phẩm</h4>
          <button
            onClick={() => setShowReview(false)}
            style={{
              background: '#f0f0f0',
              border: 'none',
              borderRadius: '5px',
              padding: '5px 10px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
          >
            ✕ Đóng
          </button>
        </div>
        <ReviewSection productId={String(productId)} orderId={orderId} orderStatus={orderStatus} />
      </div>
    );
  }

  return (
    <div style={{ marginTop: '15px', textAlign: 'left' }}>
      <button
        onClick={() => setShowReview(true)}
        style={{
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '0.95rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
        onMouseOver={(e) => (e.target.style.transform = 'translateY(-2px)')}
        onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
      >
        ⭐ Đánh giá sản phẩm
      </button>
    </div>
  );
};

// Component để hiển thị nút khiếu nại
const ComplaintButton = ({ productId, orderId, orderStatus, role, onComplaintClick, order, user }) => {
  // Hiển thị cho buyer, customer hoặc seller (khi họ là người mua)
  if (role !== 'buyer' && role !== 'customer' && role !== 'seller') {
    return null;
  }

  // Kiểm tra user có phải là buyer của order này không
  if (order && user && order.buyerId) {
    const buyerId = order.buyerId._id || order.buyerId;
    const userId = user._id || user.id;
    if (String(buyerId) !== String(userId)) {
      return null;
    }
  }

  // Phải có productId
  if (!productId) {
    return null;
  }

  // Chỉ hiển thị khi order đã hoàn thành hoặc đã giao hàng
  const statusNormalized = String(orderStatus || '')
    .toLowerCase()
    .trim();
  const isCompleted = statusNormalized === 'completed' || orderStatus === 'completed';
  const isDelivered = statusNormalized === 'delivered' || orderStatus === 'delivered';

  if (!isCompleted && !isDelivered) {
    return null;
  }

  return (
    <div style={{ marginTop: '15px', textAlign: 'left' }}>
      <button
        onClick={() => onComplaintClick(orderId, productId)}
        style={{
          padding: '10px 20px',
          background: 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '0.95rem',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginLeft: '10px',
        }}
        onMouseOver={(e) => (e.target.style.transform = 'translateY(-2px)')}
        onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
      >
        <FiAlertTriangle size={18} />
        Khiếu nại sản phẩm
      </button>
    </div>
  );
};

// Memoized OrderCard component to prevent unnecessary re-renders
const OrderCard = React.memo(
  ({
    order,
    meta,
    expanded,
    details,
    detailsLoading,
    toggleDetails,
    handleOpenCancelModal,
    handleOpenConfirmReceivedModal,
    handleOpenComplaintModal,
    role,
    navigate,
    user,
  }) => {
    const handleViewDetails = (e) => {
      e.stopPropagation();
      navigate(`/orders/${order._id}`, { state: { from: '/orders' } });
    };

    const handleHeaderClick = (e) => {
      // Don't navigate if clicking on the toggle button
      if (e.target.closest('.toggle')) {
        return;
      }
      navigate(`/orders/${order._id}`, { state: { from: '/orders' } });
    };

    return (
      <div className={`order-card ${expanded[order._id] ? 'expanded' : ''}`}>
        <div className="card-header" onClick={handleHeaderClick} style={{ cursor: 'pointer' }}>
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
            <button className="toggle" aria-expanded={!!expanded[order._id]} onClick={(e) => {
              e.stopPropagation();
              toggleDetails(order._id);
            }}>
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
                    <div key={item._id || idx}>
                      <div className="item-card" style={{ '--index': idx }}>
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
                      {/* Nút đánh giá - Hiển thị khi order đã hoàn thành */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-start' }}>
                        <ReviewButton
                          productId={
                            item.productId?._id ||
                            item.productId ||
                            (item.productId && typeof item.productId === 'object' ? item.productId.toString() : null)
                          }
                          orderId={order._id}
                          orderStatus={order.status}
                          role={role}
                          order={order}
                          user={user}
                        />
                        <ComplaintButton
                          productId={
                            item.productId?._id ||
                            item.productId ||
                            (item.productId && typeof item.productId === 'object' ? item.productId.toString() : null)
                          }
                          orderId={order._id}
                          orderStatus={order.status}
                          role={role}
                          onComplaintClick={handleOpenComplaintModal}
                          order={order}
                          user={user}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* View Details Button */}
              <div style={{ padding: '15px 20px', borderTop: '1px solid #eee' }}>
                <button
                  onClick={handleViewDetails}
                  style={{
                    padding: '12px 24px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    justifyContent: 'center',
                  }}
                  onMouseOver={(e) => (e.target.style.transform = 'translateY(-2px)')}
                  onMouseOut={(e) => (e.target.style.transform = 'translateY(0)')}
                >
                  <FiEye size={18} />
                  Xem chi tiết đơn hàng
                </button>
              </div>

              {/* Order Actions - Show for buyer/customer/seller when they are the buyer of the order */}
              {((role === 'buyer' || role === 'customer' || role === 'seller' || !role) && 
                order.buyerId && 
                (order.buyerId._id || order.buyerId) && 
                user && 
                String(order.buyerId._id || order.buyerId) === String(user._id || user.id)) && (
                <div
                  className="order-actions"
                  style={{
                    padding: '20px',
                    borderTop: '1px solid #eee',
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                  }}
                >
                  {/* Cancel Button - Only show for pending/awaiting_delivery orders */}
                  {['pending', 'confirmed', 'awaiting_delivery'].includes(order.status) && (
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
                        gap: '8px',
                      }}
                    >
                      <FiXCircle size={18} />
                      Hủy đơn hàng
                    </button>
                  )}

                  {/* Confirm Received Button - Only show for delivered orders */}
                  {order.status === 'delivered' && (
                    <button
                      className="btn-confirm-received"
                      onClick={() => handleOpenConfirmReceivedModal(order)}
                      style={{
                        padding: '12px 24px',
                        background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <FiCheckCircle size={18} />
                      Xác nhận đã nhận hàng
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }
);

const OrderHistory = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const role = useSelector(selectUserRole);
  const { user } = useAuth();
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
  const [showConfirmReceivedModal, setShowConfirmReceivedModal] = useState(false);
  const [isConfirmingReceived, setIsConfirmingReceived] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [complaintType, setComplaintType] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [complaintImages, setComplaintImages] = useState([]);
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBg, setToastBg] = useState('success');

  const showToastNotification = (message, bg = 'success') => {
    setToastMessage(message);
    setToastBg(bg);
    setShowToast(true);
  };

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

        // Chọn API endpoint dựa trên role
        let apiUrl = '';
        if (role === 'seller') {
          apiUrl = `http://localhost:5000/api/orders/seller?${params.toString()}`;
        } else if (role === 'shipper') {
          apiUrl = `http://localhost:5000/api/shipper/orders?${params.toString()}`;
        } else {
          // buyer, customer, admin, hoặc các role khác dùng buyer endpoint
          apiUrl = `http://localhost:5000/api/orders/buyer?${params.toString()}`;
        }

        const res = await fetch(apiUrl, {
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
          Authorization: `Bearer ${token}`,
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

  const handleOpenConfirmReceivedModal = (order) => {
    setSelectedOrder(order);
    setShowConfirmReceivedModal(true);
  };

  const handleConfirmReceived = async () => {
    if (!selectedOrder) return;

    setIsConfirmingReceived(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${selectedOrder._id}/confirm-received`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setOrders((prev) => prev.map((o) => (o._id === selectedOrder._id ? { ...o, status: 'completed' } : o)));
        setShowConfirmReceivedModal(false);
        setSelectedOrder(null);
        showToastNotification('Xác nhận đã nhận hàng thành công!', 'success');
      } else {
        const error = await response.json();
        showToastNotification(error.message || 'Có lỗi xảy ra khi xác nhận nhận hàng', 'danger');
      }
    } catch (error) {
      console.error('Error confirming received:', error);
      showToastNotification('Có lỗi xảy ra khi xác nhận nhận hàng', 'danger');
    } finally {
      setIsConfirmingReceived(false);
    }
  };

  const handleOpenComplaintModal = (orderId, productId) => {
    setSelectedOrder({ _id: orderId });
    setSelectedProductId(productId);
    setShowComplaintModal(true);
  };

  const handleSubmitComplaint = async () => {
    if (!complaintType || !complaintDescription.trim()) {
      showToastNotification('Vui lòng điền đầy đủ thông tin khiếu nại', 'warning');
      return;
    }

    setIsSubmittingComplaint(true);
    try {
      const token = localStorage.getItem('token');

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('orderId', selectedOrder._id);
      formData.append('productId', selectedProductId);
      formData.append('complaintType', complaintType);
      formData.append('description', complaintDescription);

      // Append images
      complaintImages.forEach((file) => {
        formData.append('images', file);
      });

      const response = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        // Đóng modal trước
        setShowComplaintModal(false);
        setSelectedOrder(null);
        setSelectedProductId(null);
        setComplaintType('');
        setComplaintDescription('');
        setComplaintImages([]);
        
        // Hiển thị thông báo thành công sau một chút delay để đảm bảo modal đã đóng
        setTimeout(() => {
          showToastNotification('Gửi khiếu nại thành công! Người bán sẽ xem xét và phản hồi.', 'success');
          // Thêm alert để đảm bảo người dùng thấy thông báo
          alert('Gửi khiếu nại thành công! Người bán sẽ xem xét và phản hồi.');
        }, 300);
      } else {
        const error = await response.json();
        showToastNotification(error.message || 'Có lỗi xảy ra khi gửi khiếu nại', 'danger');
        alert(error.message || 'Có lỗi xảy ra khi gửi khiếu nại');
      }
    } catch (error) {
      console.error('Error submitting complaint:', error);
      showToastNotification('Có lỗi xảy ra khi gửi khiếu nại', 'danger');
      alert('Có lỗi xảy ra khi gửi khiếu nại. Vui lòng thử lại.');
    } finally {
      setIsSubmittingComplaint(false);
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
            <button className="back-btn" onClick={() => navigate('/')} title="Quay lại trang chủ">
              <FiArrowLeft size={20} />
              <span>Quay lại</span>
            </button>
            <div className="header-actions">
              <button className="refresh-btn" onClick={() => window.location.reload()} disabled={loading}>
                <FiRefreshCw className={loading ? 'spinning' : ''} size={18} />
                Làm mới
              </button>
            </div>
          </div>
          <div className="title-wrap">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h1>Lịch sử đơn hàng</h1>
                <p>Theo dõi đơn hàng của bạn</p>
              </div>
              {(role === 'buyer' || role === 'customer' || !role) && (
                <Button
                  variant="danger"
                  onClick={() => navigate('/buyer/complaints')}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <FiAlertTriangle size={18} />
                  Xem khiếu nại
                </Button>
              )}
            </div>
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
              <option value="awaiting_delivery">Chờ giao hàng</option>
              <option value="shipping">Đang giao hàng</option>
              <option value="delivered">Đã giao hàng</option>
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
                handleOpenConfirmReceivedModal={handleOpenConfirmReceivedModal}
                handleOpenComplaintModal={handleOpenComplaintModal}
                role={role}
                navigate={navigate}
                user={user}
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
                        console.log('Order details fetched:', { orderId, data });
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

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast bg={toastBg} onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Header>
            <strong className="me-auto">Thông báo</strong>
          </Toast.Header>
          <Toast.Body className={toastBg === 'danger' ? 'text-white' : ''}>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

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
            zIndex: 1000,
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
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
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
                marginBottom: '24px',
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
                  transition: 'all 0.3s ease',
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={isCancelling || !cancelReason.trim()}
                style={{
                  padding: '12px 24px',
                  background:
                    isCancelling || !cancelReason.trim() ? '#ccc' : 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isCancelling || !cancelReason.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                {isCancelling ? (
                  'Đang xử lý...'
                ) : (
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

      {/* Confirm Received Modal */}
      {showConfirmReceivedModal && (
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
            zIndex: 1000,
          }}
          onClick={() => !isConfirmingReceived && setShowConfirmReceivedModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <FiCheckCircle size={32} color="white" />
              </div>
              <h2 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '1.5rem' }}>Xác nhận đã nhận hàng</h2>
              <p style={{ margin: '0', color: '#6c757d', fontSize: '0.95rem' }}>
                Đơn hàng #{selectedOrder?._id.slice(-8)}
              </p>
            </div>

            <div
              style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <p style={{ margin: '0', color: '#495057', lineHeight: '1.6' }}>
                Bạn có chắc chắn đã nhận được hàng? Sau khi xác nhận, đơn hàng sẽ chuyển sang trạng thái hoàn thành.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowConfirmReceivedModal(false);
                  setSelectedOrder(null);
                }}
                disabled={isConfirmingReceived}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: '#f8f9fa',
                  color: '#2c3e50',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isConfirmingReceived ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmReceived}
                disabled={isConfirmingReceived}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: isConfirmingReceived ? '#ccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isConfirmingReceived ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isConfirmingReceived ? (
                  'Đang xử lý...'
                ) : (
                  <>
                    <FiCheckCircle size={18} />
                    Xác nhận
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Modal */}
      {showComplaintModal && (
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
            zIndex: 1000,
          }}
          onClick={() => !isSubmittingComplaint && setShowComplaintModal(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <FiAlertTriangle size={32} color="white" />
              </div>
              <h2 style={{ margin: '0 0 8px 0', color: '#2c3e50', fontSize: '1.5rem' }}>Khiếu nại sản phẩm</h2>
              <p style={{ margin: '0', color: '#6c757d', fontSize: '0.95rem' }}>
                Đơn hàng #{selectedOrder?._id.slice(-8)}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                Loại khiếu nại *
              </label>
              <select
                value={complaintType}
                onChange={(e) => setComplaintType(e.target.value)}
                disabled={isSubmittingComplaint}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  background: 'white',
                }}
              >
                <option value="">Chọn loại khiếu nại</option>
                <option value="quality">Chất lượng sản phẩm</option>
                <option value="wrong_item">Sai sản phẩm</option>
                <option value="damaged">Sản phẩm bị hỏng</option>
                <option value="missing">Thiếu sản phẩm</option>
                <option value="late_delivery">Giao hàng chậm</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                Mô tả chi tiết *
              </label>
              <textarea
                value={complaintDescription}
                onChange={(e) => setComplaintDescription(e.target.value)}
                placeholder="Vui lòng mô tả chi tiết vấn đề bạn gặp phải..."
                disabled={isSubmittingComplaint}
                style={{
                  width: '100%',
                  minHeight: '150px',
                  padding: '12px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#2c3e50' }}>
                Hình ảnh minh chứng (tối đa 5 ảnh)
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files).slice(0, 5);
                  setComplaintImages(files);
                }}
                disabled={isSubmittingComplaint}
                style={{ display: 'none' }}
                id="complaint-images-input"
              />
              <label
                htmlFor="complaint-images-input"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  background: '#f0f0f0',
                  border: '2px dashed #ccc',
                  borderRadius: '8px',
                  cursor: isSubmittingComplaint ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                }}
                onMouseOver={(e) => !isSubmittingComplaint && (e.target.style.background = '#e0e0e0')}
                onMouseOut={(e) => (e.target.style.background = '#f0f0f0')}
              >
                <FiImage size={18} />
                Chọn ảnh
              </label>
              {complaintImages.length > 0 && (
                <div style={{ marginTop: '12px', display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {complaintImages.map((file, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        width: '100px',
                        height: '100px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        border: '2px solid #e0e0e0',
                      }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = complaintImages.filter((_, i) => i !== index);
                          setComplaintImages(newImages);
                        }}
                        disabled={isSubmittingComplaint}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          background: 'rgba(220, 53, 69, 0.9)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isSubmittingComplaint ? 'not-allowed' : 'pointer',
                          fontSize: '12px',
                        }}
                      >
                        <FiTrash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {complaintImages.length > 0 && (
                <p style={{ marginTop: '8px', fontSize: '0.875rem', color: '#6c757d' }}>
                  Đã chọn {complaintImages.length} ảnh
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowComplaintModal(false);
                  setComplaintType('');
                  setComplaintDescription('');
                  setComplaintImages([]);
                  setSelectedOrder(null);
                  setSelectedProductId(null);
                }}
                disabled={isSubmittingComplaint}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background: '#f8f9fa',
                  color: '#2c3e50',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor: isSubmittingComplaint ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitComplaint}
                disabled={isSubmittingComplaint || !complaintType || !complaintDescription.trim()}
                style={{
                  flex: 1,
                  padding: '12px 24px',
                  background:
                    isSubmittingComplaint || !complaintType || !complaintDescription.trim()
                      ? '#ccc'
                      : 'linear-gradient(135deg, #dc3545 0%, #e83e8c 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  cursor:
                    isSubmittingComplaint || !complaintType || !complaintDescription.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                {isSubmittingComplaint ? (
                  'Đang gửi...'
                ) : (
                  <>
                    <FiAlertTriangle size={18} />
                    Gửi khiếu nại
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
