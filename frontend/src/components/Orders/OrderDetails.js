import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../../hooks/useUser';
import { useAuth } from '../../contexts/AuthContext';
import { Container, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import {
  FiArrowLeft,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiUser,
  FiMapPin,
  FiDollarSign,
  FiMessageSquare,
  FiCheck,
  FiX
} from 'react-icons/fi';
import ReviewSection from "./ReviewSection";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { role } = useUser();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [isOrderSeller, setIsOrderSeller] = useState(false);

  // Lấy trang trước đó từ location state hoặc mặc định là /orders
  const getBackPath = () => {
    if (location.state?.from) {
      return location.state.from;
    }
    // Nếu không có from, thử quay lại history
    return null; // null sẽ dùng navigate(-1)
  };

  const handleGoBack = () => {
    const backPath = getBackPath();
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1); // Quay lại trang trước trong history
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Vui lòng đăng nhập để xem chi tiết đơn hàng');
        setLoading(false);
        return;
      }

      if (!id) {
        setError('Không tìm thấy mã đơn hàng');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Có lỗi xảy ra' }));
        setError(errorData.message || `Lỗi ${response.status}: Không thể tải chi tiết đơn hàng`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('Order data received:', data);
      
      if (!data || !data.order) {
        setError('Không tìm thấy thông tin đơn hàng');
        setLoading(false);
        return;
      }

      // Normalize order data
      const orderData = {
        ...data.order,
        _id: data.order._id?.toString() || String(data.order._id || ''),
        buyerId: data.order.buyerId || {},
        addressId: data.order.addressId || {}
      };

      // Normalize items
      const normalizedItems = (data.items || []).map((item, index) => {
        const product = item.productId || {};
        return {
          ...item,
          _id: item._id?.toString() || item._id || `item-${index}`,
          productId: {
            ...product,
            _id: product._id?.toString() || product._id || product,
            sellerId: product.sellerId || null
          },
          orderId: item.orderId?.toString() || item.orderId || orderData._id
        };
      });

      // Lấy thông tin seller từ item đầu tiên (giả sử tất cả items từ cùng một seller)
      const firstItem = normalizedItems[0];
      const seller = firstItem?.productId?.sellerId || null;

      // Kiểm tra xem user hiện tại có phải là seller của đơn hàng này không
      // Kiểm tra tất cả items để đảm bảo chính xác
      const currentUserId = user?._id || user?.id;
      const isSeller = currentUserId && normalizedItems.some(item => {
        const itemSellerId = item?.productId?.sellerId?._id || item?.productId?.sellerId;
        return itemSellerId && String(currentUserId) === String(itemSellerId);
      });

      setOrder(orderData);
      setItems(normalizedItems);
      setTrackingNumber(orderData.trackingNumber || '');
      setSellerInfo(seller);
      setIsOrderSeller(isSeller);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Không thể kết nối đến server. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'confirmed':
        return 'bg-info';
      case 'awaiting_delivery':
        return 'bg-info';
      case 'shipping':
        return 'bg-warning';
      case 'delivered':
        return 'bg-success';
      case 'completed':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'CHỜ XÁC NHẬN';
      case 'confirmed':
        return 'ĐÃ XÁC NHẬN';
      case 'awaiting_delivery':
        return 'CHỜ GIAO HÀNG';
      case 'shipping':
        return 'ĐANG GIAO HÀNG';
      case 'delivered':
        return 'ĐÃ GIAO HÀNG';
      case 'completed':
        return 'HOÀN THÀNH';
      case 'cancelled':
        return 'ĐÃ HỦY';
      default:
        return status?.toUpperCase() || '';
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cod':
        return 'COD';
      case 'bank_transfer':
        return 'Chuyển khoản';
      case 'momo':
        return 'MoMo';
      case 'zalopay':
        return 'ZaloPay';
      default:
        return method || 'N/A';
    }
  };

  const getPaymentMethodBadgeClass = (method) => {
    switch (method) {
      case 'cod':
        return 'bg-info';
      case 'bank_transfer':
        return 'bg-primary';
      case 'momo':
        return 'bg-danger';
      case 'zalopay':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setConfirming(true);
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
        await fetchOrderDetails();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Có lỗi xảy ra' }));
        alert(errorData.message || 'Không thể cập nhật trạng thái đơn hàng');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái');
    } finally {
      setConfirming(false);
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
        await fetchOrderDetails();
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Có lỗi xảy ra' }));
        alert(errorData.message || 'Không thể hủy đơn hàng');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert('Có lỗi xảy ra khi hủy đơn hàng');
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải chi tiết đơn hàng...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <div className="d-flex gap-2 justify-content-center mt-3">
          <Button variant="secondary" onClick={handleGoBack}>
            Quay lại
          </Button>
          <Button variant="primary" onClick={fetchOrderDetails}>
            Thử lại
          </Button>
        </div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Không tìm thấy đơn hàng</Alert>
        <Button variant="primary" onClick={handleGoBack} className="mt-3">
          Quay lại
        </Button>
      </Container>
    );
  }

  const orderIdStr = order._id?.toString() || String(order._id || '');

  return (
    <Container className="py-4">
      <div className="mb-3">
        <Button variant="outline-secondary" onClick={handleGoBack}>
          <FiArrowLeft className="me-2" />
          Quay lại
        </Button>
      </div>

      <Card className="border-0 shadow-lg mb-4">
        <Card.Header className="bg-primary text-white">
          <div className="d-flex align-items-center">
            <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
              <FiPackage size={20} />
            </div>
            <div>
              <h5 className="mb-0">Chi tiết đơn hàng #{orderIdStr.slice(-8)}</h5>
              <small className="opacity-75">
                Đặt lúc {new Date(order.createdAt).toLocaleString('vi-VN')}
              </small>
            </div>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          {/* Customer Info & Address */}
          <div className="row g-0">
            <div className="col-md-6 p-4 border-end">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                  <FiUser className="text-info" size={20} />
                </div>
                <h6 className="mb-0 fw-semibold">Thông tin khách hàng</h6>
              </div>
              <div className="ps-5">
                <div className="mb-2">
                  <strong>Tên:</strong> {order.buyerId?.fullName || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>Email:</strong> {order.buyerId?.email || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>SĐT:</strong> {order.buyerId?.phone || 'Chưa cập nhật'}
                </div>
              </div>
            </div>

            <div className="col-md-6 p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                  <FiMapPin className="text-warning" size={20} />
                </div>
                <h6 className="mb-0 fw-semibold">Địa chỉ giao hàng</h6>
              </div>
              <div className="ps-5">
                <div className="mb-2">
                  <strong>Tên người nhận:</strong> {order.addressId?.fullName || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>SĐT:</strong> {order.addressId?.phone || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>Địa chỉ:</strong> {order.addressId?.street || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>Thành phố:</strong> {order.addressId?.city || 'N/A'}, {order.addressId?.state || ''}
                </div>
              </div>
            </div>
          </div>

          <hr className="my-0" />

          {/* Seller Info */}
          {sellerInfo && (
            <>
              <div className="p-4">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                    <FiUser className="text-primary" size={20} />
                  </div>
                  <h6 className="mb-0 fw-semibold">Thông tin người bán</h6>
                </div>
                <div className="ps-5">
                  <div className="mb-2">
                    <strong>Tên:</strong> {sellerInfo.fullName || 'N/A'}
                  </div>
                  <div className="mb-2">
                    <strong>Email:</strong> {sellerInfo.email || 'N/A'}
                  </div>
                  {sellerInfo.phone && (
                    <div className="mb-2">
                      <strong>SĐT:</strong> {sellerInfo.phone}
                    </div>
                  )}
                </div>
              </div>
              <hr className="my-0" />
            </>
          )}

          {/* Products */}
          <div className="p-4">
            <div className="d-flex align-items-center mb-3">
              <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                <FiPackage className="text-success" size={20} />
              </div>
              <h6 className="mb-0 fw-semibold">Sản phẩm đã đặt</h6>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th className="border-0">Sản phẩm</th>
                    <th className="border-0 text-center">Số lượng</th>
                    <th className="border-0 text-end">Đơn giá</th>
                    <th className="border-0 text-end">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {items && items.length > 0 ? (
                    items.map((item, index) => {
                      const product = item.productId || {};
                      const productId = product._id || product;
                      const productTitle = product.title || 'Sản phẩm không xác định';
                      const productImage = product.image || product.imageURL || '/placeholder.jpg';
                      const productDescription = product.description || '';
                      const quantity = item.quantity || 0;
                      const unitPrice = item.unitPrice || product.price || 0;

                      return (
                        <tr key={item._id || index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={productImage}
                                alt={productTitle}
                                style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                className="me-3 rounded"
                                onError={(e) => {
                                  e.target.src = '/placeholder.jpg';
                                }}
                              />
                              <div>
                                <strong className="d-block">{productTitle}</strong>
                                {productDescription && (
                                  <small className="text-muted">{productDescription}</small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="text-center">
                            <span className="badge bg-primary">{quantity}</span>
                          </td>
                          <td className="text-end fw-semibold">{unitPrice?.toLocaleString()}đ</td>
                          <td className="text-end fw-bold text-success">
                            {(unitPrice * quantity)?.toLocaleString()}đ
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="4" className="text-center text-muted py-4">
                        Chưa có sản phẩm nào trong đơn hàng này
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <hr className="my-0" />

          {/* Payment Info & Notes */}
          <div className="p-4 bg-light">
            <div className="row">
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                    <FiDollarSign className="text-primary" size={20} />
                  </div>
                  <h6 className="mb-0 fw-semibold">Thông tin thanh toán</h6>
                </div>
                <div className="ps-5">
                  <div className="mb-2">
                    <strong>Phương thức:</strong>
                    <span className={`badge ${getPaymentMethodBadgeClass(order.paymentMethod)} ms-2`}>
                      {getPaymentMethodText(order.paymentMethod)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Trạng thái:</strong>
                    <span className={`badge ${getStatusBadgeClass(order.status)} ms-2`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="mb-2">
                    <strong>Tổng tiền:</strong>
                    <span className="fw-bold text-success fs-5 ms-2">
                      {order.totalPrice?.toLocaleString()}đ
                    </span>
                  </div>
                  {order.shippingFee && (
                    <div className="mb-2">
                      <strong>Phí vận chuyển:</strong>
                      <span className="ms-2">{order.shippingFee?.toLocaleString()}đ</span>
                    </div>
                  )}
                  {trackingNumber && (
                    <div className="mb-2">
                      <strong>Mã vận đơn:</strong>
                      <span className="ms-2 font-monospace">{trackingNumber}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-6">
                <div className="d-flex align-items-center mb-3">
                  <div className="bg-secondary bg-opacity-10 rounded-circle p-2 me-3">
                    <FiMessageSquare className="text-secondary" size={20} />
                  </div>
                  <h6 className="mb-0 fw-semibold">
                    {order.status === 'cancelled' ? 'Lý do hủy đơn' : 'Ghi chú'}
                  </h6>
                </div>
                <div className="ps-5">
                  <div className={`bg-white p-3 rounded border ${order.status === 'cancelled' ? 'border-danger' : ''}`}>
                    {(order.status === 'cancelled' && order.cancellationReason) ? (
                      <div>
                        <span className="badge bg-danger mb-2">Lý do hủy</span>
                        <p className="mb-0">{order.cancellationReason}</p>
                      </div>
                    ) : order.notes ? (
                      <span>{order.notes}</span>
                    ) : (
                      <span className="text-muted fst-italic">
                        {order.status === 'cancelled' ? 'Không có lý do' : 'Không có ghi chú'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>

        {/* Footer Actions */}
        <Card.Footer className="bg-light border-0">
          <div className="d-flex justify-content-between align-items-center">
            <Button variant="secondary" onClick={handleGoBack}>
              <FiX className="me-1" />
              Đóng
            </Button>
            <div className="d-flex gap-2">
              {isOrderSeller && order.status === 'pending' && (
                <Button
                  variant="success"
                  onClick={() => updateOrderStatus('confirmed')}
                  disabled={confirming}
                >
                  {confirming ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-1" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FiCheck className="me-1" />
                      Xác nhận đơn hàng
                    </>
                  )}
                </Button>
              )}
              {(role === 'buyer' || role === 'customer' || role === 'seller') && ['pending', 'confirmed'].includes(order.status) && 
                order.buyerId && (order.buyerId._id || order.buyerId) && 
                String(order.buyerId._id || order.buyerId) === String(user?._id || user?.id) && (
                <Button variant="danger" onClick={cancelOrder}>
                  <FiXCircle className="me-1" />
                  Hủy đơn hàng
                </Button>
              )}
              {(role === 'buyer' || role === 'customer' || role === 'seller') && order.status === 'delivered' && 
                order.buyerId && (order.buyerId._id || order.buyerId) && 
                String(order.buyerId._id || order.buyerId) === String(user?._id || user?.id) && (
                <Button
                  variant="success"
                  onClick={async () => {
                    try {
                      setConfirming(true);
                      const token = localStorage.getItem('token');
                      const response = await fetch(`http://localhost:5000/api/orders/${id}/confirm-received`, {
                        method: 'PUT',
                        headers: {
                          'Authorization': `Bearer ${token}`
                        }
                      });
                      if (response.ok) {
                        await fetchOrderDetails();
                        alert('Xác nhận nhận hàng thành công!');
                      } else {
                        const errorData = await response.json().catch(() => ({ message: 'Có lỗi xảy ra' }));
                        alert(errorData.message || 'Không thể xác nhận nhận hàng');
                      }
                    } catch (error) {
                      console.error('Error confirming received:', error);
                      alert('Có lỗi xảy ra khi xác nhận nhận hàng');
                    } finally {
                      setConfirming(false);
                    }
                  }}
                  disabled={confirming}
                >
                  {confirming ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-1" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="me-1" />
                      Xác nhận đã nhận hàng
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </Card.Footer>
      </Card>

      {/* Review Section for Buyer (including seller when they are buyer) */}
      {(role === 'buyer' || role === 'customer' || role === 'seller') && items && items.length > 0 && 
        order.buyerId && (order.buyerId._id || order.buyerId) && 
        String(order.buyerId._id || order.buyerId) === String(user?._id || user?.id) && (
        <Card className="border-0 shadow-sm">
          <Card.Body>
            <h5 className="mb-4">Đánh giá sản phẩm</h5>
            {items.map((item, index) => {
              const product = item.productId || {};
              const productId = product._id || product;
              // Chỉ hiển thị form review khi order status là 'completed' (đã xác nhận nhận hàng)
              const shouldShowReview = order.status === 'completed';

              return shouldShowReview && productId ? (
                <div key={item._id || index} className="mb-4 pb-4 border-bottom">
                  <div className="d-flex align-items-center mb-3">
                    <img
                      src={product.image || product.imageURL || '/placeholder.jpg'}
                      alt={product.title}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      className="me-3 rounded"
                    />
                    <div>
                      <strong>{product.title || 'Sản phẩm'}</strong>
                    </div>
                  </div>
                  <ReviewSection
                    productId={typeof productId === 'object' ? String(productId) : String(productId)}
                    orderId={orderIdStr}
                    orderStatus={order.status}
                  />
                </div>
              ) : null;
            })}
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default OrderDetails;
