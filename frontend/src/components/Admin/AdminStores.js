import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Badge, Spinner, Pagination } from 'react-bootstrap';
import { FiSearch, FiEye, FiCheckCircle, FiXCircle, FiClock, FiArrowLeft, FiShoppingBag, FiUser, FiMail, FiPackage, FiStar, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminStores = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeDetail, setStoreDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  const LIMIT = 10;

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Only add status param if not 'all'
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      
      // Only add search param if not empty
      if (searchTerm.trim()) {
        params.append('search', searchTerm);
      }

      const queryString = params.toString();
      const url = `http://localhost:5000/api/admin/stores${queryString ? `?${queryString}` : ''}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Stores response:', data);
        setStores(data.stores || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', response.status, errorData);
        showAlert(`Lỗi: ${errorData.message || response.statusText}`, 'danger');
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      showAlert('Lỗi kết nối hoặc tải danh sách store', 'danger');
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, statusFilter, searchTerm, LIMIT]);

  useEffect(() => {
    // Debounce search to avoid too many API calls, but fetch immediately for page/status changes
    const timeoutId = setTimeout(() => {
      fetchStores();
    }, searchTerm ? 500 : 0); // Wait 500ms after user stops typing, but fetch immediately for other changes

    return () => clearTimeout(timeoutId);
  }, [fetchStores]);

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  const handleStatusChange = async (storeId, currentStatus) => {
    const statusMap = {
      'approved': 'pending',
      'pending': 'approved'
    };
    
    const newStatus = statusMap[currentStatus] || 'pending';

    try {
      const response = await fetch(`http://localhost:5000/api/admin/stores/${storeId}/status`, {
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
        setNewStatus('');
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
    setNewStatus(''); // Reset to empty so user must select a new status
    setShowModal(true);
  };

  const handleShowDetail = async (store) => {
    setSelectedStore(store);
    setShowDetailModal(true);
    setLoadingDetail(true);
    setStoreDetail(null);

    try {
      const response = await fetch(`http://localhost:5000/api/admin/stores/${store._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStoreDetail(data);
      } else {
        const error = await response.json();
        showAlert(error.message || 'Không thể tải chi tiết cửa hàng', 'danger');
        setShowDetailModal(false);
      }
    } catch (error) {
      console.error('Error fetching store detail:', error);
      showAlert('Lỗi khi tải chi tiết cửa hàng', 'danger');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge bg="success"><FiCheckCircle className="me-1" />ĐÃ XÁC MINH</Badge>;
      case 'pending':
        return <Badge bg="warning"><FiClock className="me-1" />ĐANG CHỜ XÁC MINH</Badge>;
      case 'rejected':
        return <Badge bg="danger"><FiXCircle className="me-1" />Không Được Xác Minh</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }

    try {
      setLoading(true);
      
      // Delete store
      const storeResponse = await fetch(`http://localhost:5000/api/admin/stores/${storeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!storeResponse.ok) {
        const error = await storeResponse.json();
        showAlert(`Lỗi xóa store: ${error.message || 'Có lỗi xảy ra'}`, 'danger');
        return;
      }

      // Delete user (seller)
      const userResponse = await fetch(`http://localhost:5000/api/admin/users/${sellerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!userResponse.ok) {
        const error = await userResponse.json();
        showAlert(`Lỗi xóa user: ${error.message || 'Có lỗi xảy ra'}`, 'danger');
        return;
      }

      showAlert('Xóa store và user thành công!');
      fetchStores();
    } catch (error) {
      console.error('Error deleting store and user:', error);
      showAlert('Có lỗi xảy ra khi xóa', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'ĐÃ XÁC MINH';
      case 'pending':
        return 'ĐANG CHỜ XÁC MINH';
      case 'rejected':
        return 'BỊ TỪ CHỐI';
      default:
        return status;
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
    <Container fluid className="py-4" style={{ backgroundColor: '#1a1a1a', minHeight: '100vh' }}>
      <Row>
        <Col>
          {/* Header */}
          <div className="mb-4" style={{ color: '#64B5F6' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h1 className="mb-0" style={{ color: '#64B5F6', fontSize: '2rem', fontWeight: 'bold' }}>
                  Quản lý Store
                </h1>
                <p style={{ color: '#888' }}>Danh sách tất cả các cửa hàng trong hệ thống</p>
              </div>
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/admin')}
                style={{ color: '#64B5F6', borderColor: '#64B5F6' }}
              >
                <FiArrowLeft className="me-2" />
                Quay lại Dashboard
              </Button>
            </div>
          </div>

          {alert.show && (
            <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'success' })}>
              {alert.message}
            </Alert>
          )}

          {/* Filter Section */}
          <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#333', marginBottom: '2rem' }}>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <div className="position-relative">
                    <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                    <Form.Control
                      type="text"
                      placeholder="Tìm kiếm tên cửa hàng..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                    }}
                      className="ps-5"
                      style={{ backgroundColor: '#1a1a1a', color: '#fff', borderColor: '#333' }}
                    />
                  </div>
                </Col>
                <Col md={6}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                    }}
                    style={{ backgroundColor: '#1a1a1a', color: '#fff', borderColor: '#333' }}
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="approved">Đã xác minh</option>
                    <option value="pending">Đang chờ xác minh</option>
                    <option value="rejected">Bị từ chối</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Stores Table */}
          <Card style={{ backgroundColor: '#2a2a2a', borderColor: '#333' }}>
            <Card.Body style={{ padding: 0 }}>
              {stores.length > 0 ? (
                <div className="table-responsive">
                  <Table hover style={{ marginBottom: 0, color: '#fff' }}>
                    <thead style={{ backgroundColor: '#1a1a1a' }}>
                      <tr>
                        <th style={{ color: '#64B5F6', borderColor: '#333' }}>#</th>
                        <th style={{ color: '#64B5F6', borderColor: '#333' }}>Tên Store</th>
                        <th style={{ color: '#64B5F6', borderColor: '#333' }}>Email</th>
                        <th style={{ color: '#64B5F6', borderColor: '#333' }}>Trạng thái</th>
                        
                        <th style={{ color: '#64B5F6', borderColor: '#333' }}>Ngày tạo</th>
                        <th style={{ color: '#64B5F6', borderColor: '#333' }}>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stores.map((store, index) => (
                        <tr key={store._id} style={{ borderColor: '#333' }}>
                          <td style={{ color: '#fff', borderColor: '#333' }}>
                            {index + 1}
                          </td>
                          <td style={{ color: '#fff', borderColor: '#333' }}>
                            <strong>{store.storeName}</strong>
                          </td>
                          <td style={{ color: '#999', borderColor: '#333' }}>
                            {store.seller?.email}
                          </td>
                          <td style={{ borderColor: '#333' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Form.Check 
                                type="switch" 
                                checked={store.status === 'approved'}
                                onChange={() => handleStatusChange(store._id, store.status)}
                                style={{ cursor: 'pointer' }}
                              />
                              <span style={{ color: '#999', fontSize: '0.9rem' }}>
                                {store.status === 'approved' ? 'Hoạt động' : 'Chờ xử lý'}
                              </span>
                            </div>
                          </td>
                         
                          <td style={{ color: '#999', borderColor: '#333' }}>
                            {new Date(store.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td style={{ borderColor: '#333' }}>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/admin/stores/${store._id}`)}
                              className="me-2"
                              style={{ 
                                color: '#64B5F6', 
                                borderColor: '#64B5F6',
                                backgroundColor: 'transparent'
                              }}
                            >
                              <FiEye />
                            </Button>
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => handleShowDetail(store)}
                            >
                              <FiTrash2 />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-5" style={{ color: '#999' }}>
                  <p>Không tìm thấy store nào</p>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Total count */}
          {stores.length > 0 && (
            <div className="mt-3" style={{ color: '#999', textAlign: 'right' }}>
              <span>Tổng số: <strong style={{ color: '#64B5F6' }}>{stores.length}</strong> store</span>
            </div>
          )}
        </Col>
      </Row>

      {/* Status Update Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
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
                  value={getStatusText(selectedStore.status)}
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
                  <option value="approved">Đã xác minh</option>
                  <option value="pending">Đang chờ xác minh</option>
                  <option value="rejected">Từ chối</option>
                </Form.Select>
              </Form.Group>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowModal(false);
            setSelectedStore(null);
            setNewStatus('');
          }}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleStatusChange} disabled={!newStatus || newStatus === selectedStore?.status}>
            Cập nhật
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Store Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết cửa hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetail ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Đang tải...</span>
              </Spinner>
            </div>
          ) : storeDetail ? (
            <>
              <Row className="mb-4">
                <Col md={12}>
                  <Card className="border-0 bg-light">
                    <Card.Body>
                      <h4 className="mb-3">{storeDetail.storeName}</h4>
                      {storeDetail.bannerImageURL && (
                        <div className="mb-3">
                          <img 
                            src={storeDetail.bannerImageURL} 
                            alt="Banner" 
                            className="img-fluid rounded"
                            style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                          />
                        </div>
                      )}
                      {storeDetail.description && (
                        <p className="text-muted mb-0">{storeDetail.description}</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="mb-4">
                <Col md={6}>
                  <Card>
                    <Card.Body>
                      <h5 className="mb-3">
                        <FiUser className="me-2" />
                        Thông tin chủ cửa hàng
                      </h5>
                      {storeDetail.seller ? (
                        <>
                          <p className="mb-2">
                            <strong>Tên:</strong> {storeDetail.seller.fullName}
                          </p>
                          <p className="mb-2">
                            <FiMail className="me-2" />
                            <strong>Email:</strong> {storeDetail.seller.email}
                          </p>
                          {storeDetail.seller.avatarUrl && (
                            <div className="mt-3">
                              <img 
                                src={storeDetail.seller.avatarUrl} 
                                alt="Avatar" 
                                className="rounded-circle"
                                style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-muted">Không có thông tin chủ cửa hàng</p>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card>
                    <Card.Body>
                      <h5 className="mb-3">
                        <FiShoppingBag className="me-2" />
                        Thống kê
                      </h5>
                      <div className="d-flex align-items-center mb-3">
                        <FiPackage className="me-2 text-primary" size={20} />
                        <div>
                          <strong>Sản phẩm:</strong> {storeDetail.productCount || 0}
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <FiStar className="me-2 text-warning" size={20} />
                        <div>
                          <strong>Đánh giá:</strong> {storeDetail.recentReviews?.length || 0}
                        </div>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="me-2">
                          {getStatusBadge(storeDetail.status)}
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <FiCalendar className="me-2 text-secondary" size={20} />
                        <div>
                          <strong>Ngày tạo:</strong> {new Date(storeDetail.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {storeDetail.recentProducts && storeDetail.recentProducts.length > 0 && (
                <Row className="mb-4">
                  <Col md={12}>
                    <Card>
                      <Card.Body>
                        <h5 className="mb-3">
                          <FiPackage className="me-2" />
                          Sản phẩm gần đây ({storeDetail.recentProducts.length})
                        </h5>
                        <div className="table-responsive">
                          <Table striped hover size="sm">
                            <thead>
                              <tr>
                                <th>Tên sản phẩm</th>
                                <th>Giá</th>
                                <th>Tồn kho</th>
                              </tr>
                            </thead>
                            <tbody>
                              {storeDetail.recentProducts.map((product) => (
                                <tr key={product._id}>
                                  <td>{product.title}</td>
                                  <td>{product.price?.toLocaleString('vi-VN')} đ</td>
                                  <td>{product.stock || 0}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}

              {storeDetail.recentReviews && storeDetail.recentReviews.length > 0 && (
                <Row>
                  <Col md={12}>
                    <Card>
                      <Card.Body>
                        <h5 className="mb-3">
                          <FiStar className="me-2" />
                          Đánh giá gần đây ({storeDetail.recentReviews.length})
                        </h5>
                        <div className="table-responsive">
                          <Table striped hover size="sm">
                            <thead>
                              <tr>
                                <th>Sản phẩm</th>
                                <th>Đánh giá</th>
                                <th>Bình luận</th>
                              </tr>
                            </thead>
                            <tbody>
                              {storeDetail.recentReviews.map((review) => (
                                <tr key={review._id}>
                                  <td>{review.productId?.title || 'N/A'}</td>
                                  <td>
                                    <Badge bg="warning">
                                      {review.rating} <FiStar size={12} />
                                    </Badge>
                                  </td>
                                  <td>{review.comment || 'Không có bình luận'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              )}
            </>
          ) : (
            <Alert variant="danger">Không thể tải chi tiết cửa hàng</Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowDetailModal(false);
            setStoreDetail(null);
            setSelectedStore(null);
          }}>
            Đóng
          </Button>
          {storeDetail && (
            <Button 
              variant="primary" 
              onClick={() => {
                setShowDetailModal(false);
                handleOpenModal(storeDetail);
              }}
            >
              <FiCheckCircle className="me-1" />
              Phê duyệt
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminStores;
