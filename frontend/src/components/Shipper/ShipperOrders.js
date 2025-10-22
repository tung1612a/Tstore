import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Table, Form, Modal, Alert } from 'react-bootstrap';
import { FiEye, FiTruck, FiCheckCircle, FiPackage, FiFilter } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';

const ShipperOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const status = searchParams.get('status') || '';
    setStatusFilter(status);
    fetchOrders(status);
  }, [searchParams]);

  const fetchOrders = async (status = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const url = status 
        ? `http://localhost:5000/api/shipper/orders?status=${status}`
        : 'http://localhost:5000/api/shipper/orders';
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      paid: { variant: 'info', text: 'Chờ giao' },
      shipped: { variant: 'warning', text: 'Đang giao' },
      completed: { variant: 'success', text: 'Đã giao' },
      cancelled: { variant: 'danger', text: 'Đã hủy' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    if (status) {
      setSearchParams({ status });
    } else {
      setSearchParams({});
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/shipper/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data);
        setShowModal(true);
      } else {
        showAlert('Không thể tải chi tiết đơn hàng', 'danger');
      }
    } catch (error) {
      showAlert('Lỗi khi tải chi tiết đơn hàng', 'danger');
    }
  };

  const handleShipOrder = async () => {
    if (!trackingNumber.trim()) {
      showAlert('Vui lòng nhập mã tracking', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/shipper/orders/${selectedOrder.order._id}/ship`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ trackingNumber })
      });

      if (response.ok) {
        showAlert('Cập nhật trạng thái đơn hàng thành công', 'success');
        setShowShipModal(false);
        setTrackingNumber('');
        fetchOrders(statusFilter);
      } else {
        showAlert('Không thể cập nhật trạng thái đơn hàng', 'danger');
      }
    } catch (error) {
      showAlert('Lỗi khi cập nhật trạng thái đơn hàng', 'danger');
    }
  };

  const handleCompleteOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/shipper/orders/${selectedOrder.order._id}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showAlert('Đánh dấu đơn hàng hoàn thành thành công', 'success');
        setShowCompleteModal(false);
        fetchOrders(statusFilter);
      } else {
        showAlert('Không thể cập nhật trạng thái đơn hàng', 'danger');
      }
    } catch (error) {
      showAlert('Lỗi khi cập nhật trạng thái đơn hàng', 'danger');
    }
  };

  const showAlert = (message, variant) => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: '' }), 3000);
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Đơn hàng giao</h2>
            <Button variant="outline-primary" onClick={() => navigate('/shipper/dashboard')}>
              Về Dashboard
            </Button>
          </div>
        </Col>
      </Row>

      {alert.show && (
        <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false, message: '', variant: '' })}>
          {alert.message}
        </Alert>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <Form.Label className="fw-bold">
                <FiFilter className="me-2" />
                Lọc theo trạng thái:
              </Form.Label>
            </Col>
            <Col md={6}>
              <Form.Select 
                value={statusFilter} 
                onChange={(e) => handleStatusFilter(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                <option value="paid">Chờ giao</option>
                <option value="shipped">Đang giao</option>
                <option value="completed">Đã giao</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-light">
          <h5 className="mb-0">
            Danh sách đơn hàng 
            {statusFilter && (
              <Badge bg="secondary" className="ms-2">
                {getStatusBadge(statusFilter)}
              </Badge>
            )}
          </h5>
        </Card.Header>
        <Card.Body>
          {orders.length > 0 ? (
            <div className="table-responsive">
              <Table hover>
                <thead>
                  <tr>
                    <th>Mã đơn hàng</th>
                    <th>Khách hàng</th>
                    <th>Địa chỉ giao</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td>
                        <code>{order._id.slice(-8)}</code>
                      </td>
                      <td>
                        <div>
                          <div className="fw-bold">{order.buyerId?.fullName}</div>
                          <small className="text-muted">{order.buyerId?.phone}</small>
                        </div>
                      </td>
                      <td>
                        <div className="small">
                          {order.addressId?.address}
                          {order.addressId?.city && (
                            <div className="text-muted">{order.addressId.city}</div>
                          )}
                        </div>
                      </td>
                      <td>{formatCurrency(order.totalPrice)}</td>
                      <td>{getStatusBadge(order.status)}</td>
                      <td>
                        <small>{formatDate(order.createdAt)}</small>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline-primary"
                            onClick={() => handleViewDetails(order._id)}
                          >
                            <FiEye size={14} />
                          </Button>
                          {order.status === 'paid' && (
                            <Button 
                              size="sm" 
                              variant="outline-warning"
                              onClick={() => {
                                setSelectedOrder({ order });
                                setShowShipModal(true);
                              }}
                            >
                              <FiTruck size={14} />
                            </Button>
                          )}
                          {order.status === 'shipped' && (
                            <Button 
                              size="sm" 
                              variant="outline-success"
                              onClick={() => {
                                setSelectedOrder({ order });
                                setShowCompleteModal(true);
                              }}
                            >
                              <FiCheckCircle size={14} />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-5">
              <FiPackage size={64} className="text-muted mb-3" />
              <h5 className="text-muted">Không có đơn hàng nào</h5>
              <p className="text-muted">Bạn chưa có đơn hàng nào được assign hoặc đã hoàn thành tất cả.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Order Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <div>
              <Row className="mb-3">
                <Col md={6}>
                  <h6>Thông tin khách hàng:</h6>
                  <p><strong>Tên:</strong> {selectedOrder.order.buyerId?.fullName}</p>
                  <p><strong>Email:</strong> {selectedOrder.order.buyerId?.email}</p>
                  <p><strong>Số điện thoại:</strong> {selectedOrder.order.buyerId?.phone}</p>
                </Col>
                <Col md={6}>
                  <h6>Thông tin đơn hàng:</h6>
                  <p><strong>Mã đơn hàng:</strong> <code>{selectedOrder.order._id}</code></p>
                  <p><strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.order.status)}</p>
                  <p><strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.order.totalPrice)}</p>
                  {selectedOrder.order.trackingNumber && (
                    <p><strong>Mã tracking:</strong> <code>{selectedOrder.order.trackingNumber}</code></p>
                  )}
                </Col>
              </Row>
              
              <h6>Địa chỉ giao hàng:</h6>
              <div className="border rounded p-3 mb-3">
                <p className="mb-1"><strong>{selectedOrder.order.addressId?.address}</strong></p>
                <p className="mb-1">{selectedOrder.order.addressId?.city}</p>
                <p className="mb-0">{selectedOrder.order.addressId?.district}</p>
              </div>

              <h6>Sản phẩm trong đơn hàng:</h6>
              <div className="table-responsive">
                <Table size="sm">
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.orderItems?.map((item) => (
                      <tr key={item._id}>
                        <td>
                          <div>
                            <div className="fw-bold">{item.productId?.title}</div>
                          </div>
                        </td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td>{formatCurrency(item.unitPrice * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Ship Order Modal */}
      <Modal show={showShipModal} onHide={() => setShowShipModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận giao hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Mã tracking (tùy chọn)</Form.Label>
            <Form.Control
              type="text"
              placeholder="Nhập mã tracking..."
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
            />
          </Form.Group>
          <p className="text-muted">
            Bạn có chắc chắn muốn đánh dấu đơn hàng này là "Đang giao"?
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowShipModal(false)}>
            Hủy
          </Button>
          <Button variant="warning" onClick={handleShipOrder}>
            Xác nhận giao hàng
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Complete Order Modal */}
      <Modal show={showCompleteModal} onHide={() => setShowCompleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Hoàn thành giao hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Bạn có chắc chắn muốn đánh dấu đơn hàng này là "Đã giao" thành công?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCompleteModal(false)}>
            Hủy
          </Button>
          <Button variant="success" onClick={handleCompleteOrder}>
            Xác nhận hoàn thành
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ShipperOrders;
