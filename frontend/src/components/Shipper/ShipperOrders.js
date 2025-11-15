import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Badge, Button, Table, Form, Modal, Alert } from 'react-bootstrap';
import { FiEye, FiTruck, FiCheckCircle, FiPackage, FiFilter, FiArrowLeft, FiRefreshCw, FiCalendar } from 'react-icons/fi';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './ShipperOrders.css';

const ShipperOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showShipModal, setShowShipModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [alert, setAlert] = useState({ show: false, message: '', variant: '' });
  const [deliveryResult, setDeliveryResult] = useState('success'); // 'success' or 'failed'
  const [failureReason, setFailureReason] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const itemsPerPage = 10;
  const navigate = useNavigate();

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`http://localhost:5000/api/shipper/orders?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || data);
        setTotalPages(data.totalPages || 0);
        setTotalOrders(data.total || 0);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    const status = searchParams.get('status') || '';
    const page = searchParams.get('page') || '1';
    setStatusFilter(status);
    setCurrentPage(parseInt(page));
  }, [searchParams]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', text: 'Chờ xác nhận' },
      confirmed: { variant: 'info', text: 'Đã xác nhận' },
      awaiting_delivery: { variant: 'info', text: 'Chờ giao hàng' },
      shipping: { variant: 'warning', text: 'Đang giao hàng' },
      delivered: { variant: 'success', text: 'Đã giao hàng' },
      completed: { variant: 'success', text: 'Hoàn thành' },
      cancelled: { variant: 'danger', text: 'Đã hủy' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    if (status) {
      setSearchParams({ status, page: '1' });
    } else {
      setSearchParams({ page: '1' });
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (statusFilter) {
      setSearchParams({ status: statusFilter, page: page.toString() });
    } else {
      setSearchParams({ page: page.toString() });
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
        // Backend returns { order, orderItems }, so we need to combine them
        setSelectedOrder({
          order: data.order,
          orderItems: data.orderItems || []
        });
        setShowModal(true);
      } else {
        showAlert('Không thể tải chi tiết đơn hàng', 'danger');
      }
    } catch (error) {
      showAlert('Lỗi khi tải chi tiết đơn hàng', 'danger');
    }
  };

  const handleShipOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/shipper/orders/${selectedOrder.order._id}/ship`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showAlert('Cập nhật trạng thái đơn hàng thành công', 'success');
        setShowShipModal(false);
        fetchOrders();
      } else {
        showAlert('Không thể cập nhật trạng thái đơn hàng', 'danger');
      }
    } catch (error) {
      showAlert('Lỗi khi cập nhật trạng thái đơn hàng', 'danger');
    }
  };

  const handleCompleteOrder = async () => {
    if (deliveryResult === 'failed' && !failureReason.trim()) {
      showAlert('Vui lòng nhập lý do thất bại', 'warning');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/shipper/orders/${selectedOrder.order._id}/complete`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          success: deliveryResult === 'success',
          failureReason: deliveryResult === 'failed' ? failureReason : null
        })
      });

      if (response.ok) {
        showAlert(
          deliveryResult === 'success' 
            ? 'Đánh dấu đơn hàng giao thành công' 
            : 'Cập nhật trạng thái giao hàng thất bại thành công', 
          deliveryResult === 'success' ? 'success' : 'warning'
        );
        setShowCompleteModal(false);
        setDeliveryResult('success');
        setFailureReason('');
        fetchOrders();
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
      <div className="so-loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="so-wrapper">
      <div className="so-container">
        <div className="so-header">
          <div className="so-header-top">
            <button 
              className="so-back-btn"
              onClick={() => navigate('/shipper')}
              title="Quay lại dashboard"
            >
              <FiArrowLeft size={20} />
              <span>Quay lại</span>
            </button>
            <div className="so-header-actions">
              <button 
                className="btn btn-outline-primary"
                onClick={() => fetchOrders(statusFilter)}
                disabled={loading}
              >
                <FiRefreshCw className={`me-1 ${loading ? 'so-spinning' : ''}`} />
                Làm mới
              </button>
            </div>
          </div>
          <div className="so-header-content">
            <div>
              <h1 className="so-page-title">Quản lý đơn hàng giao hàng</h1>
              <p className="so-page-subtitle">Theo dõi và quản lý đơn hàng của bạn</p>
            </div>
          </div>
        </div>

        <div className="so-content-wrapper">
          <div className="row">
            <div className="col-12">

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
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="awaiting_delivery">Chờ giao hàng</option>
                        <option value="shipping">Đang giao hàng</option>
                        <option value="delivered">Đã giao hàng</option>
                        <option value="completed">Hoàn thành</option>
                        <option value="cancelled">Đã hủy</option>
                      </Form.Select>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Orders Table */}
              <Card className="so-orders-card border-0 shadow-sm">
                <Card.Header className="so-card-header bg-light border-0 py-3">
                  <div className="d-flex justify-content-between align-items-center gap-3">
                    <div className="d-flex align-items-center">
                      <h5 className="mb-0 me-3">Danh sách đơn hàng</h5>
                      <span className="badge bg-primary">{orders.length} đơn hàng</span>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  {orders.length > 0 ? (
                    <div className="table-responsive">
                      <Table className="so-table table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th className="border-0 py-3 px-4 fw-semibold">Mã đơn hàng</th>
                            <th className="border-0 py-3 px-4 fw-semibold">Khách hàng</th>
                            <th className="border-0 py-3 px-4 fw-semibold">Địa chỉ giao</th>
                            <th className="border-0 py-3 px-4 fw-semibold">Tổng tiền</th>
                            <th className="border-0 py-3 px-4 fw-semibold">Trạng thái</th>
                            <th className="border-0 py-3 px-4 fw-semibold">Ngày tạo</th>
                            <th className="border-0 py-3 px-4 fw-semibold text-center">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((order, index) => (
                            <tr key={order._id} className={index % 2 === 0 ? 'table-light' : ''}>
                              <td className="py-3 px-4">
                                <div className="d-flex align-items-center">
                                  <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                    <FiPackage className="text-primary" size={16} />
                                  </div>
                                  <div>
                                    <code className="fw-bold text-primary">#{order._id.slice(-8)}</code>
                                    <br />
                                    <small className="text-muted">ID: {order._id.slice(0, 8)}...</small>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div>
                                  <div className="fw-bold">{order.buyerId?.fullName}</div>
                                  <small className="text-muted">{order.buyerId?.phone}</small>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="small">
                                  {order.addressId?.street || 'N/A'}
                                  {order.addressId?.city && (
                                    <div className="text-muted">{order.addressId.city}{order.addressId?.state ? `, ${order.addressId.state}` : ''}</div>
                                  )}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-end">
                                  <h6 className="mb-0 text-success fw-bold">{formatCurrency(order.totalPrice)}</h6>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                {getStatusBadge(order.status)}
                              </td>
                              <td className="py-3 px-4">
                                <div className="d-flex align-items-center">
                                  <FiCalendar className="text-muted me-2" size={14} />
                                  <div>
                                    <div className="fw-semibold">{formatDate(order.createdAt)}</div>
                                    <small className="text-muted">{new Date(order.createdAt).toLocaleTimeString('vi-VN')}</small>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="d-flex gap-2 justify-content-center">
                                  <Button 
                                    size="sm" 
                                    variant="outline-primary"
                                    onClick={() => handleViewDetails(order._id)}
                                    title="Xem chi tiết"
                                  >
                                    <FiEye size={14} />
                                  </Button>
                                  {order.status === 'awaiting_delivery' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline-warning"
                                      onClick={() => {
                                        setSelectedOrder({ order });
                                        setShowShipModal(true);
                                      }}
                                      title="Bắt đầu giao hàng"
                                    >
                                      <FiTruck size={14} />
                                    </Button>
                                  )}
                                  {order.status === 'shipping' && (
                                    <Button 
                                      size="sm" 
                                      variant="outline-success"
                                      onClick={() => {
                                        setSelectedOrder({ order });
                                        setShowCompleteModal(true);
                                      }}
                                      title="Hoàn thành giao hàng"
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

                {totalOrders > 0 && (
                  <div className="card-footer bg-white border-0 py-3">
                    <div className="so-pagination-wrapper">
                      <div className="so-pagination-info">
                        <span className="text-muted">
                          Hiển thị trang {currentPage} / {totalPages} - Tổng {totalOrders} đơn hàng
                        </span>
                      </div>
                      <nav>
                      <ul className="pagination pagination-sm mb-0">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                          >
                            Trước
                          </button>
                        </li>
                        {[...Array(totalPages)].map((_, index) => {
                          const page = index + 1;
                          const isCurrentPage = page === currentPage;
                          const isNearCurrentPage = Math.abs(page - currentPage) <= 2;
                          const isFirstPage = page === 1;
                          const isLastPage = page === totalPages;
                          
                          if (!isNearCurrentPage && !isFirstPage && !isLastPage) {
                            if (page === 2 || page === totalPages - 1) {
                              return <li key={page} className="page-item disabled"><span className="page-link">...</span></li>;
                            }
                            return null;
                          }
                          
                          return (
                            <li key={page} className={`page-item ${isCurrentPage ? 'active' : ''}`}>
                              <button 
                                className="page-link" 
                                onClick={() => handlePageChange(page)}
                              >
                                {page}
                              </button>
                            </li>
                          );
                        })}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                          <button 
                            className="page-link" 
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                          >
                            Sau
                          </button>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
                )}
              </Card>

            </div>
          </div>
        </div>
      </div>

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
                  <p><strong>Ngày đặt:</strong> {formatDateTime(selectedOrder.order.createdAt)}</p>
                  <p><strong>Trạng thái:</strong> {getStatusBadge(selectedOrder.order.status)}</p>
                  <p><strong>Tổng tiền:</strong> {formatCurrency(selectedOrder.order.totalPrice)}</p>
                </Col>
              </Row>
              
              <h6>Địa chỉ giao hàng:</h6>
              <div className="border rounded p-3 mb-3">
                <div className="mb-2">
                  <strong>Tên người nhận:</strong> {selectedOrder.order.addressId?.fullName || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>SĐT:</strong> {selectedOrder.order.addressId?.phone || 'N/A'}
                </div>
                <div className="mb-2">
                  <strong>Địa chỉ:</strong> {selectedOrder.order.addressId?.street || 'N/A'}
                </div>
                <div className="mb-0">
                  <strong>Thành phố:</strong> {selectedOrder.order.addressId?.city || 'N/A'}{selectedOrder.order.addressId?.state ? `, ${selectedOrder.order.addressId.state}` : ''}
                </div>
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
                          <div className="d-flex align-items-center">
                            {item.productId?.imageURL || item.productId?.image ? (
                              <img
                                src={item.productId?.imageURL || item.productId?.image}
                                alt={item.productId?.title}
                                style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', marginRight: '12px' }}
                              />
                            ) : (
                              <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f0f0', borderRadius: '4px', marginRight: '12px' }}></div>
                            )}
                            <div>
                              <div className="fw-bold">{item.productId?.title || 'Sản phẩm không xác định'}</div>
                              {item.productId?.price && (
                                <small className="text-muted">Giá gốc: {formatCurrency(item.productId.price)}</small>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <span className="badge bg-primary">{item.quantity}</span>
                        </td>
                        <td>{formatCurrency(item.unitPrice)}</td>
                        <td className="fw-bold text-success">{formatCurrency(item.unitPrice * item.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="table-light">
                      <td colSpan="3" className="text-end fw-bold">Tổng cộng:</td>
                      <td className="fw-bold text-success fs-5">
                        {formatCurrency(selectedOrder.order.totalPrice)}
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              </div>

              <hr className="my-4" />

              <div className="row">
                <Col md={6}>
                  <h6 className="mb-3">
                    <FiPackage className="me-2" />
                    Thông tin thanh toán
                  </h6>
                  <div className="ps-3">
                    <p className="mb-2">
                      <strong>Phương thức:</strong>{' '}
                      <span className="badge bg-info">
                        {selectedOrder.order.paymentMethod === 'cod' ? 'COD' :
                         selectedOrder.order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' :
                         selectedOrder.order.paymentMethod === 'momo' ? 'MoMo' :
                         selectedOrder.order.paymentMethod === 'zalopay' ? 'ZaloPay' :
                         selectedOrder.order.paymentMethod}
                      </span>
                    </p>
                    {selectedOrder.order.notes && (
                      <p className="mb-2">
                        <strong>Ghi chú:</strong><br />
                        <em className="text-muted">{selectedOrder.order.notes}</em>
                      </p>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <h6 className="mb-3">
                    <FiCheckCircle className="me-2" />
                    Trạng thái đơn hàng
                  </h6>
                  <div className="ps-3">
                    <p className="mb-2">
                      <strong>Hiện tại:</strong>{' '}
                      {getStatusBadge(selectedOrder.order.status)}
                    </p>
                    {selectedOrder.order.deliveryFailureReason && (
                      <p className="mb-2">
                        <strong className="text-danger">Lý do thất bại:</strong><br />
                        <span className="text-danger">{selectedOrder.order.deliveryFailureReason}</span>
                      </p>
                    )}
                  </div>
                </Col>
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
          <p>
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
      <Modal show={showCompleteModal} onHide={() => {
        setShowCompleteModal(false);
        setDeliveryResult('success');
        setFailureReason('');
      }}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận kết quả giao hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">Kết quả giao hàng:</Form.Label>
            <div>
              <Form.Check
                type="radio"
                label="Giao hàng thành công"
                name="deliveryResult"
                id="success"
                checked={deliveryResult === 'success'}
                onChange={() => setDeliveryResult('success')}
              />
              <Form.Check
                type="radio"
                label="Giao hàng thất bại"
                name="deliveryResult"
                id="failed"
                checked={deliveryResult === 'failed'}
                onChange={() => setDeliveryResult('failed')}
              />
            </div>
          </Form.Group>

          {deliveryResult === 'failed' && (
            <Form.Group className="mb-3">
              <Form.Label>Lý do thất bại (bắt buộc):</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Nhập lý do thất bại giao hàng..."
                value={failureReason}
                onChange={(e) => setFailureReason(e.target.value)}
              />
              <Form.Text className="text-muted">
                Ví dụ: Khách hàng không có nhà, Địa chỉ sai, Khách hàng từ chối nhận hàng...
              </Form.Text>
            </Form.Group>
          )}

          <Alert variant={deliveryResult === 'success' ? 'success' : 'warning'} className="mb-0">
            {deliveryResult === 'success' 
              ? 'Đơn hàng sẽ được đánh dấu "Đã giao thành công"'
              : 'Đơn hàng sẽ được đánh dấu "Giao thất bại" và cần lý do chi tiết'
            }
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowCompleteModal(false);
            setDeliveryResult('success');
            setFailureReason('');
          }}>
            Hủy
          </Button>
          <Button 
            variant={deliveryResult === 'success' ? 'success' : 'warning'}
            onClick={handleCompleteOrder}
          >
            {deliveryResult === 'success' ? 'Xác nhận thành công' : 'Xác nhận thất bại'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShipperOrders;
