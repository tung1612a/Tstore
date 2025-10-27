import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { 
  FiArrowLeft, 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiXCircle, 
  FiUser, 
  FiMapPin, 
  FiCreditCard,
  FiEdit3,
  FiSave,
  FiX
} from 'react-icons/fi';
import './OrderDetails.css';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useUser();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const [tempTrackingNumber, setTempTrackingNumber] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setItems(data.items);
        setTrackingNumber(data.order.trackingNumber || '');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          trackingNumber: trackingNumber || undefined
        })
      });

      if (response.ok) {
        fetchOrderDetails();
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const cancelOrder = async () => {
    const reason = prompt('Lý do hủy đơn hàng:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${id}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      });

      if (response.ok) {
        fetchOrderDetails();
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  const handleTrackingEdit = () => {
    setTempTrackingNumber(trackingNumber);
    setIsEditingTracking(true);
  };

  const handleTrackingSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: order.status,
          trackingNumber: tempTrackingNumber
        })
      });

      if (response.ok) {
        setTrackingNumber(tempTrackingNumber);
        setIsEditingTracking(false);
        fetchOrderDetails();
      }
    } catch (error) {
      console.error('Error updating tracking number:', error);
    }
  };

  const handleTrackingCancel = () => {
    setTempTrackingNumber(trackingNumber);
    setIsEditingTracking(false);
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { 
        text: 'Chờ xác nhận', 
        color: '#ffc107', 
        bgColor: '#fff3cd', 
        icon: <FiPackage /> 
      },
      confirmed: { 
        text: 'Đã xác nhận', 
        color: '#17a2b8', 
        bgColor: '#d1ecf1', 
        icon: <FiCheckCircle /> 
      },
      awaiting_delivery: { 
        text: 'Chờ giao hàng', 
        color: '#17a2b8', 
        bgColor: '#d1ecf1', 
        icon: <FiPackage /> 
      },
      shipping: { 
        text: 'Đang giao hàng', 
        color: '#ffc107', 
        bgColor: '#fff3cd', 
        icon: <FiTruck /> 
      },
      delivered: { 
        text: 'Đã giao hàng', 
        color: '#28a745', 
        bgColor: '#d4edda', 
        icon: <FiTruck /> 
      },
      completed: { 
        text: 'Hoàn thành', 
        color: '#28a745', 
        bgColor: '#d4edda', 
        icon: <FiCheckCircle /> 
      },
      cancelled: { 
        text: 'Đã hủy', 
        color: '#dc3545', 
        bgColor: '#f8d7da', 
        icon: <FiXCircle /> 
      },
      refunded: { 
        text: 'Đã hoàn tiền', 
        color: '#6c757d', 
        bgColor: '#e2e3e5', 
        icon: <FiXCircle /> 
      }
    };
    return configs[status] || configs.pending;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="order-details">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải chi tiết đơn hàng...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details">
        <div className="error-container">
          <h2>Không tìm thấy đơn hàng</h2>
          <button onClick={() => navigate('/orders')} className="btn-primary">
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(order.status);

  return (
    <div className="order-details">
      <div className="order-details-container">
        {/* Header */}
        <div className="order-header">
          <button onClick={() => navigate('/orders')} className="back-btn">
            <FiArrowLeft size={20} />
            Quay lại
          </button>
          <div className="header-content">
            <h1>Chi tiết đơn hàng #{order._id.slice(-8)}</h1>
            <div 
              className="order-status"
              style={{ 
                color: statusConfig.color,
                backgroundColor: statusConfig.bgColor
              }}
            >
              {statusConfig.icon}
              <span>{statusConfig.text}</span>
            </div>
          </div>
        </div>

        <div className="order-content">
          <div className="info-section">
            <h2>
              <FiPackage className="section-icon" />
              Thông tin đơn hàng
            </h2>
            <div className="info-grid">
              <div className="info-card">
                <div className="info-item">
                  <span className="label">Ngày đặt hàng:</span>
                  <span className="value">{formatDate(order.createdAt)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Tổng tiền:</span>
                  <span className="value price">{order.totalPrice?.toLocaleString()}đ</span>
                </div>
                <div className="info-item">
                  <span className="label">Phí vận chuyển:</span>
                  <span className="value">{order.shippingFee?.toLocaleString()}đ</span>
                </div>
                <div className="info-item">
                  <span className="label">Trạng thái thanh toán:</span>
                  <span className={`payment-status ${order.paymentStatus}`}>
                    {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>
              
              <div className="info-card">
                <div className="info-item">
                  <span className="label">Mã vận đơn:</span>
                  <div className="tracking-container">
                    {isEditingTracking ? (
                      <div className="tracking-edit">
                        <input
                          type="text"
                          value={tempTrackingNumber}
                          onChange={(e) => setTempTrackingNumber(e.target.value)}
                          placeholder="Nhập mã vận đơn"
                          className="tracking-input"
                        />
                        <button onClick={handleTrackingSave} className="btn-save">
                          <FiSave size={16} />
                        </button>
                        <button onClick={handleTrackingCancel} className="btn-cancel">
                          <FiX size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="tracking-display">
                        <span className="tracking-number">
                          {trackingNumber || 'Chưa có mã vận đơn'}
                        </span>
                        {role === 'seller' && (
                          <button onClick={handleTrackingEdit} className="btn-edit">
                            <FiEdit3 size={16} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                {order.notes && (
                  <div className="info-item full-width">
                    <span className="label">Ghi chú:</span>
                    <span className="value">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="info-section">
            <h2>
              <FiMapPin className="section-icon" />
              Thông tin người nhận
            </h2>
            <div className="address-card">
              <div className="address-header">
                <h3>{order.addressId?.fullName}</h3>
                <span className="phone">{order.addressId?.phone}</span>
              </div>
              <div className="address-details">
                <p>{order.addressId?.street}</p>
                <p>{order.addressId?.city}, {order.addressId?.state}, {order.addressId?.country}</p>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h2>
              <FiUser className="section-icon" />
              Thông tin người bán
            </h2>
            <div className="seller-card">
              <div className="seller-info">
                <h3>{order.sellerId?.name}</h3>
                <p>{order.sellerId?.email}</p>
                <p><strong>Cửa hàng:</strong> {order.storeId?.storeName}</p>
              </div>
            </div>
          </div>

          <div className="info-section">
            <h2>
              <FiPackage className="section-icon" />
              Sản phẩm đã đặt
            </h2>
            <div className="items-container">
              {items.map((item, index) => (
                <div key={index} className="item-card">
                  <img
                    src={item.productId?.image || item.productId?.imageURL || '/placeholder.jpg'}
                    alt={item.productId?.title}
                    className="item-image"
                  />
                  <div className="item-details">
                    <h4>{item.productId?.title}</h4>
                    <p className="item-description">{item.productId?.description}</p>
                    <div className="item-quantity">
                      <span>Số lượng: {item.quantity}</span>
                      <span className="item-price">{item.unitPrice?.toLocaleString()}đ</span>
                    </div>
                    <div className="item-total">
                      Tổng: {(item.unitPrice * item.quantity)?.toLocaleString()}đ
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {role === 'seller' && (
            <div className="actions-section">
              <h2>
                <FiCreditCard className="section-icon" />
                Quản lý đơn hàng
              </h2>
              
              <div className="action-cards">
                {order.status === 'pending' && (
                  <div className="action-card">
                    <h3>Xác nhận đơn hàng</h3>
                    <p>Xác nhận đơn hàng để bắt đầu xử lý</p>
                    <div className="action-buttons">
                      <button 
                        className="btn-confirm"
                        onClick={() => updateOrderStatus('confirmed')}
                      >
                        <FiCheckCircle size={16} />
                        Xác nhận đơn hàng
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={() => updateOrderStatus('cancelled')}
                      >
                        <FiXCircle size={16} />
                        Từ chối đơn hàng
                      </button>
                    </div>
                  </div>
                )}

                {order.status === 'confirmed' && (
                  <div className="action-card">
                    <h3>Giao hàng</h3>
                    <p>Đánh dấu đơn hàng đã được giao cho đơn vị vận chuyển</p>
                    <div className="action-buttons">
                      <button 
                        className="btn-ship"
                        onClick={() => {
                          const trackingNumber = prompt('Nhập mã vận đơn:');
                          if (trackingNumber) {
                            setTrackingNumber(trackingNumber);
                            updateOrderStatus('shipped');
                          }
                        }}
                      >
                        <FiTruck size={16} />
                        Giao hàng
                      </button>
                    </div>
                  </div>
                )}

                {order.status === 'shipped' && (
                  <div className="action-card">
                    <h3>Hoàn thành giao hàng</h3>
                    <p>Xác nhận khách hàng đã nhận được hàng</p>
                    <div className="action-buttons">
                      <button 
                        className="btn-deliver"
                        onClick={() => updateOrderStatus('delivered')}
                      >
                        <FiCheckCircle size={16} />
                        Hoàn thành giao hàng
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {role === 'buyer' && ['pending', 'confirmed'].includes(order.status) && (
            <div className="actions-section">
              <h2>
                <FiCreditCard className="section-icon" />
                Thao tác
              </h2>
              <div className="action-cards">
                <div className="action-card">
                  <h3>Hủy đơn hàng</h3>
                  <p>Hủy đơn hàng nếu bạn không muốn tiếp tục</p>
                  <div className="action-buttons">
                    <button 
                      className="btn-cancel"
                      onClick={cancelOrder}
                    >
                      <FiXCircle size={16} />
                      Hủy đơn hàng
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
