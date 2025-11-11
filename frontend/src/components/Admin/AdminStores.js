import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Badge, Spinner, Pagination } from 'react-bootstrap';
import { FiSearch, FiEye, FiCheckCircle, FiXCircle, FiClock, FiArrowLeft, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminStores = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  const LIMIT = 10;

  useEffect(() => {
    fetchStores();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: currentPage,
        limit: LIMIT,
        status: statusFilter !== 'all' ? statusFilter : '',
        search: searchTerm
      });

      const response = await fetch(`http://localhost:5000/api/admin/stores?${query}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStores(data.stores || []);
        setTotalPages(data.pagination?.pages || 1);
      } else {
        showAlert('Lỗi khi tải danh sách store', 'danger');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      showAlert('Lỗi khi tải danh sách store', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  const handleStatusChange = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/admin/stores/${selectedStore._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        showAlert('Cập nhật trạng thái store thành công!');
        setShowModal(false);
        setSelectedStore(null);
        fetchStores();
      } else {
        const error = await response.json();
        showAlert(error.message || 'Có lỗi xảy ra', 'danger');
      }
    } catch (error) {
      console.error('Error updating store status:', error);
      showAlert('Có lỗi xảy ra khi cập nhật trạng thái', 'danger');
    }
  };

  const handleOpenModal = (store) => {
    setSelectedStore(store);
    setNewStatus(store.status);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge bg="success"><FiCheckCircle className="me-1" />Được phê duyệt</Badge>;
      case 'pending':
        return <Badge bg="warning"><FiClock className="me-1" />Chờ xử lý</Badge>;
      case 'rejected':
        return <Badge bg="danger"><FiXCircle className="me-1" />Bị từ chối</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading && stores.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/admin')}
                className="me-3"
              >
                <FiArrowLeft className="me-2" />
                Quay lại
              </Button>
              <h2 className="mb-0">Quản lý Store</h2>
            </div>
          </div>

          {alert.show && (
            <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'success' })}>
              {alert.message}
            </Alert>
          )}

          {/* Filter Section */}
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={5}>
                  <div className="position-relative">
                    <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <Form.Control
                      type="text"
                      placeholder="Tìm kiếm tên cửa hàng..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="ps-5"
                    />
                  </div>
                </Col>
                <Col md={4}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="approved">Đã phê duyệt</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="rejected">Bị từ chối</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Stores Table */}
          <Card>
            <Card.Body>
              {stores.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Tên Cửa Hàng</th>
                        <th>Chủ Cửa Hàng</th>
                        <th>Sản phẩm</th>
                        <th>Đánh giá</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stores.map(store => (
                        <tr key={store._id}>
                          <td>
                            <strong>{store.storeName}</strong>
                            {store.description && (
                              <div className="text-muted small">{store.description.substring(0, 50)}...</div>
                            )}
                          </td>
                          <td>
                            <div>
                              <strong>{store.seller?.fullName}</strong>
                              <div className="text-muted small">{store.seller?.email}</div>
                            </div>
                          </td>
                          <td>
                            <Badge bg="info">{store.productCount || 0}</Badge>
                          </td>
                          <td>
                            <Badge bg="secondary">{store.reviewCount || 0}</Badge>
                          </td>
                          <td>
                            {getStatusBadge(store.status)}
                          </td>
                          <td>
                            {new Date(store.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleOpenModal(store)}
                              className="me-2"
                            >
                              <FiCheckCircle className="me-1" />
                              Phê duyệt
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => {
                                setSelectedStore(store);
                                navigate(`/admin/stores/${store._id}`);
                              }}
                            >
                              <FiEye className="me-1" />
                              Chi tiết
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <p className="text-muted">Không tìm thấy store nào</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First 
                  onClick={() => setCurrentPage(1)} 
                  disabled={currentPage === 1}
                />
                <Pagination.Prev 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1}
                />
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Pagination.Item
                      key={page}
                      active={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Pagination.Item>
                  );
                })}
                <Pagination.Next 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last 
                  onClick={() => setCurrentPage(totalPages)} 
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
        </Col>
      </Row>

      {/* Status Update Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật trạng thái Store</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedStore && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Tên cửa hàng</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedStore.storeName}
                  disabled
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Trạng thái hiện tại</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedStore.status}
                  disabled
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Trạng thái mới *</Form.Label>
                <Form.Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="">-- Chọn trạng thái --</option>
                  <option value="approved">Phê duyệt</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="rejected">Từ chối</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleStatusChange} disabled={!newStatus || newStatus === selectedStore?.status}>
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminStores;
