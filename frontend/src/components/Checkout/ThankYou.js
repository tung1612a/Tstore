import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { FiCheckCircle, FiPackage, FiHome, FiShoppingBag, FiTruck, FiCreditCard } from 'react-icons/fi';
import './ThankYou.css';

const ThankYou = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;
  const orderIds = location.state?.orderIds; // Mảng các orderIds nếu có nhiều đơn hàng
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Nếu không có orderId, redirect về home
    if (!orderId) {
      navigate('/');
      return;
    }

    // Lấy thông tin đơn hàng
    fetchOrderDetails();
  }, [orderId, orderIds, navigate]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Vui lòng đăng nhập để xem đơn hàng');
        setLoading(false);
        return;
      }

      // Nếu có nhiều orderIds, fetch tất cả
      const idsToFetch = orderIds && orderIds.length > 1 ? orderIds : [orderId];
      const orderPromises = idsToFetch.map(async (id) => {
        const response = await fetch(`http://localhost:5000/api/orders/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          // API trả về { order, items } hoặc chỉ order
          if (data.order && data.items) {
            return { ...data.order, items: data.items };
          } else if (data._id) {
            return data;
          }
        }
        return null;
      });

      const fetchedOrders = await Promise.all(orderPromises);
      const validOrders = fetchedOrders.filter(order => order !== null);
      
      if (validOrders.length === 0) {
        setError('Không tìm thấy đơn hàng');
      } else {
        setOrders(validOrders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Có lỗi xảy ra khi tải thông tin đơn hàng: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Chờ xác nhận' },
      confirmed: { variant: 'info', text: 'Đã xác nhận' },
      awaiting_delivery: { variant: 'primary', text: 'Chờ giao hàng' },
      shipping: { variant: 'info', text: 'Đang giao hàng' },
      delivered: { variant: 'success', text: 'Đã giao hàng' },
      completed: { variant: 'success', text: 'Hoàn thành' },
      cancelled: { variant: 'danger', text: 'Đã hủy' },
      paid: { variant: 'success', text: 'Đã thanh toán' },
    };

    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const getPaymentMethodText = (method) => {
    const methods = {
      cod: 'Thanh toán khi nhận hàng (COD)',
      bank_transfer: 'Chuyển khoản ngân hàng',
      momo: 'Ví MoMo',
      zalopay: 'ZaloPay',
    };
    return methods[method] || method;
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Đang tải thông tin đơn hàng...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => navigate('/')} className="mt-3">
          Về trang chủ
        </Button>
      </Container>
    );
  }

  if (orders.length === 0) {
    return null;
  }

  const totalAmount = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const hasMultipleOrders = orders.length > 1;

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          {/* Success Header */}
          <Card className="text-center mb-4 thank-you-card">
            <Card.Body className="py-5">
              <div className="success-icon mb-4">
                <FiCheckCircle size={80} className="text-success" />
              </div>
              <h1 className="mb-3">Cảm ơn bạn đã đặt hàng!</h1>
              <p className="lead text-muted mb-4">
                {hasMultipleOrders
                  ? `Bạn đã đặt ${orders.length} đơn hàng từ các shop khác nhau. Các đơn hàng đã được tiếp nhận và đang được xử lý.`
                  : 'Đơn hàng của bạn đã được tiếp nhận và đang được xử lý'
                }
              </p>
              {hasMultipleOrders ? (
                <div className="mb-3">
                  <Alert variant="info" className="mb-3">
                    <strong>Lưu ý:</strong> Bạn đã đặt {orders.length} đơn hàng từ các shop khác nhau. 
                    Mỗi đơn hàng sẽ được xử lý và giao hàng riêng biệt.
                  </Alert>
                  <div className="order-ids-list">
                    <strong className="d-block mb-2">Mã các đơn hàng:</strong>
                    {orders.map((order, index) => {
                      const orderId = order._id?.toString() || order._id;
                      return (
                        <div 
                          key={orderId}
                          className="order-id-badge mb-2" 
                          onClick={() => {
                            navigate(`/orders/${orderId}`, { state: { from: '/thank-you' } });
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          <strong>Đơn hàng {index + 1}:</strong> <code>{(orderId || '').slice(-8).toUpperCase()}</code>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div 
                  className="order-id-badge" 
                  onClick={() => {
                    const orderId = orders[0]._id?.toString() || orders[0]._id;
                    navigate(`/orders/${orderId}`, { state: { from: '/thank-you' } });
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <strong>Mã đơn hàng:</strong> <code>{(orders[0]._id?.toString() || orders[0]._id || '').slice(-8).toUpperCase()}</code>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Order Details - Hiển thị tất cả các đơn hàng */}
          {orders.map((order, orderIndex) => (
            <Row key={order._id} className="g-4 mb-4">
              <Col md={8}>
                <Card className="mb-4">
                  <Card.Header className="bg-primary text-white">
                    <h5 className="mb-0">
                      <FiPackage className="me-2" />
                      {hasMultipleOrders ? `Chi tiết đơn hàng ${orderIndex + 1}` : 'Chi tiết đơn hàng'}
                    </h5>
                  </Card.Header>
                  <Card.Body>
                    <div className="mb-4">
                      <h6 className="text-muted mb-2">Trạng thái đơn hàng</h6>
                      <div>{getStatusBadge(order.status)}</div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="mb-4">
                        <h6 className="text-muted mb-3">Sản phẩm đã đặt</h6>
                        <div className="order-items">
                          {order.items.map((item, index) => {
                            // Xử lý cả hai format: item.productId hoặc item.product
                            const product = item.productId || item.product || {};
                            const productTitle = product.title || 'Sản phẩm';
                            const productImage = product.image || product.imageURL;
                            const productPrice = item.unitPrice || product.price || 0;
                            
                            return (
                              <div key={item._id || index} className="order-item-row mb-3 pb-3 border-bottom">
                                <div className="d-flex align-items-center">
                                  {productImage ? (
                                    <img
                                      src={productImage}
                                      alt={productTitle}
                                      className="order-item-image me-3"
                                      style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                                    />
                                  ) : (
                                    <div
                                      className="order-item-image me-3 d-flex align-items-center justify-content-center bg-light"
                                      style={{ width: '60px', height: '60px', borderRadius: '8px' }}
                                    >
                                      <FiPackage size={24} className="text-muted" />
                                    </div>
                                  )}
                                  <div className="flex-grow-1">
                                    <h6 className="mb-1">{productTitle}</h6>
                                    <p className="text-muted mb-0 small">
                                      Số lượng: {item.quantity} x {formatCurrency(productPrice)}
                                    </p>
                                  </div>
                                  <div className="text-end">
                                    <strong className="text-danger">
                                      {formatCurrency(productPrice * item.quantity)}
                                    </strong>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {order.addressId && (
                      <div className="mb-4">
                        <h6 className="text-muted mb-2">
                          <FiTruck className="me-2" />
                          Địa chỉ giao hàng
                        </h6>
                        <div className="address-info">
                          <p className="mb-1">
                            <strong>{order.addressId.fullName}</strong>
                          </p>
                          <p className="mb-1 text-muted">{order.addressId.phone}</p>
                          <p className="mb-0 text-muted">
                            {order.addressId.street}, {order.addressId.city}, {order.addressId.state}, {order.addressId.country}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <h6 className="text-muted mb-2">
                        <FiCreditCard className="me-2" />
                        Phương thức thanh toán
                      </h6>
                      <p className="mb-0">{getPaymentMethodText(order.paymentMethod)}</p>
                    </div>
                  </Card.Body>
                </Card>

                {order.notes && (
                  <Card className="mb-4">
                    <Card.Header>
                      <h6 className="mb-0">Ghi chú đơn hàng</h6>
                    </Card.Header>
                    <Card.Body>
                      <p className="mb-0">{order.notes}</p>
                    </Card.Body>
                  </Card>
                )}
              </Col>

              <Col md={4}>
                <Card className="sticky-top" style={{ top: '20px' }}>
                  <Card.Header className="bg-light">
                    <h6 className="mb-0">
                      {hasMultipleOrders ? `Tóm tắt đơn hàng ${orderIndex + 1}` : 'Tóm tắt đơn hàng'}
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <div className="order-summary">
                      <div className="summary-row mb-3">
                        <span>Tạm tính:</span>
                        <span>{formatCurrency(order.totalPrice || 0)}</span>
                      </div>
                      <div className="summary-row mb-3">
                        <span>Phí vận chuyển:</span>
                        <span className="text-success">Miễn phí</span>
                      </div>
                      <div className="summary-row border-top pt-3 mb-3">
                        <strong>Tổng cộng:</strong>
                        <strong className="text-danger fs-5">{formatCurrency(order.totalPrice || 0)}</strong>
                      </div>
                    </div>

                    {order.createdAt && (
                      <div className="order-date mt-4 pt-3 border-top">
                        <small className="text-muted">
                          <strong>Ngày đặt hàng:</strong>
                          <br />
                          {formatDate(order.createdAt)}
                        </small>
                      </div>
                    )}

                    <div className="mt-4 d-grid gap-2">
                      <Button
                        variant="primary"
                        onClick={() => {
                          const orderId = order._id?.toString() || order._id;
                          navigate(`/orders/${orderId}`, { state: { from: '/thank-you' } });
                        }}
                        className="w-100"
                      >
                        <FiShoppingBag className="me-2" />
                        XEM CHI TIẾT ĐƠN HÀNG
                      </Button>
                      {orderIndex === orders.length - 1 && (
                        <>
                          <Button
                            variant="outline-secondary"
                            onClick={() => navigate('/orders')}
                            className="w-100"
                          >
                            Xem tất cả đơn hàng
                          </Button>
                          <Button
                            variant="outline-primary"
                            onClick={() => navigate('/')}
                            className="w-100"
                          >
                            <FiHome className="me-2" />
                            Tiếp tục mua sắm
                          </Button>
                        </>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          ))}

          {/* Tổng kết nếu có nhiều đơn hàng */}
          {hasMultipleOrders && (
            <Card className="mt-4 border-primary">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Tổng kết tất cả đơn hàng</h5>
              </Card.Header>
              <Card.Body>
                <div className="order-summary">
                  <div className="summary-row mb-3">
                    <span>Tổng tạm tính ({orders.length} đơn):</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="summary-row mb-3">
                    <span>Phí vận chuyển:</span>
                    <span className="text-success">Miễn phí</span>
                  </div>
                  <div className="summary-row border-top pt-3 mb-3">
                    <strong>Tổng cộng tất cả đơn hàng:</strong>
                    <strong className="text-danger fs-4">{formatCurrency(totalAmount)}</strong>
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* Information Card */}
          <Card className="mt-4 bg-light">
            <Card.Body>
              <h6 className="mb-3">Những điều cần biết:</h6>
              <ul className="mb-0 small">
                <li>Bạn sẽ nhận được email xác nhận đơn hàng trong vòng vài phút</li>
                <li>Đơn hàng sẽ được xử lý trong vòng 24 giờ</li>
                <li>Bạn có thể theo dõi trạng thái đơn hàng trong phần "Đơn hàng của tôi"</li>
                {orders[0]?.paymentMethod === 'cod' && (
                  <li>Vui lòng chuẩn bị số tiền thanh toán khi nhận hàng</li>
                )}
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ThankYou;

