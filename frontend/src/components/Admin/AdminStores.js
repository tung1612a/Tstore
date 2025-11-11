import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { 
  FiSearch, FiEye, FiCheckCircle, FiXCircle, FiClock, FiArrowLeft,
  FiUser, FiMail, FiShoppingBag, FiPackage, FiStar, FiCalendar, FiEdit3
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminStores = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [storeDetail, setStoreDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [togglingActive, setTogglingActive] = useState(null);
  const [showToggleModal, setShowToggleModal] = useState(false);
  const [storeToToggle, setStoreToToggle] = useState(null);
  const [newActiveState, setNewActiveState] = useState(null);

  const [updatingStatus, setUpdatingStatus] = useState(null);

  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false }), 3000);
  };

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm.trim()) params.append('search', searchTerm);

      const url = `http://localhost:5000/api/admin/stores?${params.toString()}`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }

      const data = await response.json();
      setStores(data.stores || []);
    } catch (error) {
      console.error('Error fetching stores:', error);
      showAlert('Lỗi tải dữ liệu store', 'danger');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchStores(), searchTerm ? 500 : 0);
    return () => clearTimeout(timeoutId);
  }, [fetchStores]);

  // Cập nhật trạng thái store
  const handleStatusChange = async (storeId, newStatus) => {
    if (!newStatus) return;

    setUpdatingStatus(storeId);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/stores/${storeId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await res.json();

      if (res.ok) {
        showAlert('Cập nhật trạng thái thành công!', 'success');
        fetchStores();
        // Cập nhật storeDetail nếu đang mở modal
        if (storeDetail && storeDetail._id === storeId) {
          setStoreDetail({ ...storeDetail, status: newStatus });
        }
      } else {
        showAlert(data.message || 'Không thể cập nhật trạng thái', 'danger');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showAlert('Lỗi kết nối', 'danger');
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Mở modal xác nhận toggle
  const openToggleModal = (store, currentActive, e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setStoreToToggle(store);
    setNewActiveState(!currentActive);
    setShowToggleModal(true);
  };

  // Bật/tắt hoạt động của store (sau khi xác nhận)
  const handleToggleStoreActive = async () => {
    if (!storeToToggle || newActiveState === null) return;

    const storeId = storeToToggle._id;
    setTogglingActive(storeId);
    setShowToggleModal(false);
    
    try {
      const res = await fetch(`http://localhost:5000/api/admin/stores/${storeId}/active`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ active: newActiveState })
      });

      const data = await res.json();

      if (res.ok) {
        showAlert(
          newActiveState 
            ? 'Cửa hàng đã được kích hoạt thành công!' 
            : 'Cửa hàng đã bị khóa thành công!', 
          'success'
        );
        fetchStores();
        // Cập nhật storeDetail nếu đang mở modal
        if (storeDetail && storeDetail._id === storeId) {
          setStoreDetail({ ...storeDetail, active: newActiveState });
        }
      } else {
        showAlert(data.message || 'Không thể cập nhật trạng thái', 'danger');
      }
    } catch (error) {
      console.error('Error toggling store active:', error);
      showAlert('Lỗi kết nối', 'danger');
    } finally {
      setTogglingActive(null);
      setStoreToToggle(null);
      setNewActiveState(null);
    }
  };

  // Mở modal chi tiết
  const handleShowDetail = async (store) => {
    setShowDetailModal(true);
    setLoadingDetail(true);
    setStoreDetail(null);

    try {
      const res = await fetch(`http://localhost:5000/api/admin/stores/${store._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setStoreDetail(data);
      } else {
        showAlert('Không thể tải chi tiết cửa hàng', 'danger');
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error fetching store detail:', error);
      showAlert('Lỗi kết nối', 'danger');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': 
        return <Badge bg="success" className="d-inline-flex align-items-center gap-1">
          <FiCheckCircle size={14} /> Đã xác minh
        </Badge>;
      case 'pending': 
        return <Badge bg="warning" className="d-inline-flex align-items-center gap-1">
          <FiClock size={14} /> Chờ xác minh
        </Badge>;
      case 'rejected': 
        return <Badge bg="danger" className="d-inline-flex align-items-center gap-1">
          <FiXCircle size={14} /> Không được xác minh
        </Badge>;
      default: 
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getStatusOptions = () => [
    { value: 'pending', label: 'Chờ xác minh', icon: <FiClock /> },
    { value: 'approved', label: 'Đã xác minh', icon: <FiCheckCircle /> },
    { value: 'rejected', label: 'Không được xác minh', icon: <FiXCircle /> }
  ];

  if (loading && stores.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100" style={{ background: '#f8f9fa' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="py-4" style={{ background: '#f8f9fa', minHeight: '100vh' }}>
      <Row>
        <Col>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 style={{ color: '#212529', fontWeight: 'bold' }}>Quản lý Store</h1>
              <p style={{ color: '#6c757d', marginBottom: 0 }}>Danh sách tất cả các cửa hàng hệ thống</p>
            </div>
            <Button 
              variant="outline-primary" 
              onClick={() => navigate('/admin')}
            >
              <FiArrowLeft className="me-2" /> Quay lại Dashboard
            </Button>
          </div>

          {/* Alert */}
          {alert.show && (
            <Alert 
              variant={alert.variant} 
              dismissible 
              onClose={() => setAlert({ show: false })}
              className="mb-3"
            >
              {alert.message}
            </Alert>
          )}

          {/* Search and Filter */}
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Row className="g-3">
                <Col md={6}>
                  <div className="position-relative">
                    <FiSearch 
                      className="position-absolute" 
                      style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', zIndex: 10 }}
                    />
                    <Form.Control
                      placeholder="Tìm kiếm cửa hàng..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ 
                        paddingLeft: '40px'
                      }}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="approved">Đã xác minh</option>
                    <option value="pending">Chờ xác minh</option>
                    <option value="rejected">Không được xác minh</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Stores Table */}
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              {stores.length === 0 ? (
                <div className="text-center py-5">
                  <FiShoppingBag size={48} style={{ color: '#6c757d', marginBottom: '1rem' }} />
                  <p style={{ color: '#6c757d' }}>Không tìm thấy cửa hàng nào</p>
                </div>
              ) : (
                <Table hover responsive className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ padding: '1rem' }}>#</th>
                      <th style={{ padding: '1rem' }}>Tên Store</th>
                      <th style={{ padding: '1rem' }}>Email</th>
                      <th style={{ padding: '1rem' }}>Trạng thái</th>
                      <th style={{ padding: '1rem' }}>Ngày tạo</th>
                      <th style={{ padding: '1rem', textAlign: 'center' }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stores.map((s, i) => (
                      <tr key={s._id}>
                        <td style={{ padding: '1rem', verticalAlign: 'middle' }}>{i + 1}</td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                          <strong>{s.storeName}</strong>
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                          {s.seller?.email || 'N/A'}
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                          <div className="d-flex align-items-center gap-2">
                            {updatingStatus === s._id ? (
                              <Spinner size="sm" animation="border" />
                            ) : (
                              <>
                                <Form.Select
                                  size="sm"
                                  value={s.status}
                                  onChange={(e) => handleStatusChange(s._id, e.target.value)}
                                  style={{
                                    width: 'auto',
                                    minWidth: '150px'
                                  }}
                                >
                                  {getStatusOptions().map(option => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </Form.Select>
                                <div className="ms-2">
                                  {getStatusBadge(s.status)}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                          {new Date(s.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                          <div className="d-flex justify-content-center align-items-center gap-2">
                            <Button 
                              size="sm" 
                              variant="outline-primary" 
                              onClick={() => navigate(`/admin/stores/${s._id}`)}
                              title="Xem chi tiết"
                            >
                              <FiEye />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline-info" 
                              onClick={() => handleShowDetail(s)}
                              title="Xem nhanh"
                            >
                              <FiEdit3 />
                            </Button>
                            <div className="d-flex align-items-center gap-2">
                              {togglingActive === s._id ? (
                                <Spinner size="sm" animation="border" />
                              ) : (
                                <>
                                  <Form.Check
                                    type="switch"
                                    id={`active-switch-${s._id}`}
                                    checked={s.active !== false}
                                    onChange={(e) => openToggleModal(s, s.active !== false, e)}
                                    label={s.active !== false ? "Hoạt động" : "Đã khóa"}
                                    title={s.active !== false ? "Nhấn để khóa cửa hàng" : "Nhấn để mở khóa cửa hàng"}
                                  />
                                </>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>

          {/* Store Count */}
          {stores.length > 0 && (
            <div className="mt-3 text-end">
              <small className="text-muted">
                Tổng cộng: <strong>{stores.length}</strong> cửa hàng
              </small>
            </div>
          )}
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal 
        show={showDetailModal} 
        onHide={() => setShowDetailModal(false)} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết cửa hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetail ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : storeDetail ? (
            <>
              <Row className="mb-3">
                <Col md={8}>
                  <h4 className="mb-3">{storeDetail.storeName}</h4>
                  <p className="text-muted mb-3">
                    {storeDetail.description || "Không có mô tả"}
                  </p>
                </Col>
                <Col md={4} className="text-end">
                  {getStatusBadge(storeDetail.status)}
                </Col>
              </Row>

              <hr />

              <Row className="mb-3">
                <Col md={6}>
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <FiUser className="me-2 text-primary" />
                      <strong>Chủ cửa hàng:</strong>
                    </div>
                    <p className="ms-4 mb-0">{storeDetail.seller?.fullName || 'N/A'}</p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <FiMail className="me-2 text-primary" />
                      <strong>Email:</strong>
                    </div>
                    <p className="ms-4 mb-0">{storeDetail.seller?.email || 'N/A'}</p>
                  </div>
                </Col>
              </Row>

              <Row className="mb-3">
                <Col md={6}>
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <FiCalendar className="me-2 text-primary" />
                      <strong>Ngày tạo:</strong>
                    </div>
                    <p className="ms-4 mb-0">
                      {new Date(storeDetail.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <FiPackage className="me-2 text-primary" />
                      <strong>Số sản phẩm:</strong>
                    </div>
                    <p className="ms-4 mb-0">{storeDetail.productCount || 0}</p>
                  </div>
                </Col>
              </Row>

              {storeDetail.reviewCount !== undefined && (
                <Row className="mb-3">
                  <Col md={6}>
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <FiStar className="me-2 text-primary" />
                        <strong>Số đánh giá:</strong>
                      </div>
                      <p className="ms-4 mb-0">{storeDetail.reviewCount || 0}</p>
                    </div>
                  </Col>
                </Row>
              )}

              <hr />

              <div className="mb-3">
                <label className="form-label">
                  <strong>Cập nhật trạng thái:</strong>
                </label>
                {updatingStatus === storeDetail._id ? (
                  <div className="d-flex align-items-center gap-2">
                    <Spinner size="sm" animation="border" />
                    <span className="text-muted">Đang cập nhật...</span>
                  </div>
                ) : (
                  <Form.Select
                    value={storeDetail.status}
                    onChange={(e) => handleStatusChange(storeDetail._id, e.target.value)}
                  >
                    {getStatusOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Form.Select>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">
                  <strong>Trạng thái hoạt động:</strong>
                </label>
                {togglingActive === storeDetail._id ? (
                  <div className="d-flex align-items-center gap-2">
                    <Spinner size="sm" animation="border" />
                    <span className="text-muted">Đang cập nhật...</span>
                  </div>
                ) : (
                  <div>
                    <Form.Check
                      type="switch"
                      id={`active-switch-detail-${storeDetail._id}`}
                      checked={storeDetail.active !== false}
                      onChange={(e) => openToggleModal(storeDetail, storeDetail.active !== false, e)}
                      label={storeDetail.active !== false ? "Cửa hàng đang hoạt động" : "Cửa hàng đã bị khóa"}
                    />
                    <small className="text-muted d-block mt-1">
                      {storeDetail.active !== false 
                        ? "Tắt để khóa cửa hàng và tài khoản seller" 
                        : "Bật để mở khóa cửa hàng và tài khoản seller"}
                    </small>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setShowDetailModal(false)}
                >
                  Đóng
                </Button>
                <Button 
                  variant="primary" 
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(`/admin/stores/${storeDetail._id}`);
                  }}
                >
                  <FiEye className="me-2" /> Xem chi tiết đầy đủ
                </Button>
              </div>
            </>
          ) : (
            <Alert variant="danger">Không thể tải dữ liệu</Alert>
          )}
        </Modal.Body>
      </Modal>

      {/* Toggle Active Confirmation Modal */}
      <Modal 
        show={showToggleModal} 
        onHide={() => !togglingActive && setShowToggleModal(false)} 
        centered
      >
        <Modal.Header closeButton={!togglingActive}>
          <Modal.Title>
            {newActiveState === false ? 'Xác nhận khóa cửa hàng' : 'Xác nhận mở khóa cửa hàng'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {storeToToggle && (
            <>
              <p>
                Bạn có chắc chắn muốn {newActiveState === false ? 'khóa' : 'mở khóa'} cửa hàng <strong>"{storeToToggle.storeName}"</strong>?
              </p>
              <Alert variant={newActiveState === false ? "warning" : "info"} className="mb-0">
                <strong>Lưu ý:</strong> {
                  newActiveState === false 
                    ? "Khi khóa cửa hàng, tài khoản seller cũng sẽ bị khóa và không thể đăng nhập vào hệ thống." 
                    : "Khi mở khóa cửa hàng, tài khoản seller cũng sẽ được mở khóa và có thể đăng nhập lại."
                }
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowToggleModal(false)}
            disabled={togglingActive}
          >
            Hủy
          </Button>
          <Button 
            variant={newActiveState === false ? "danger" : "success"} 
            onClick={handleToggleStoreActive}
            disabled={togglingActive}
          >
            {togglingActive ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Đang xử lý...
              </>
            ) : (
              <>
                {newActiveState === false ? 'Khóa cửa hàng' : 'Mở khóa cửa hàng'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default AdminStores;
