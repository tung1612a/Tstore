import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Spinner, Badge } from 'react-bootstrap';
import { 
  FiSearch, FiEye, FiCheckCircle, FiXCircle, FiClock, FiArrowLeft, FiTrash2,
  FiUser, FiMail, FiShoppingBag, FiPackage, FiStar, FiCalendar
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

      const data = await response.json();
      setStores(data.stores || []);
    } catch (error) {
      showAlert('Lỗi tải dữ liệu store', 'danger');
    } finally {
      setLoading(false);
    }
  }, [token, statusFilter, searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => fetchStores(), searchTerm ? 500 : 0);
    return () => clearTimeout(timeoutId);
  }, [fetchStores]);

  const handleStatusToggle = async (storeId, currentStatus) => {
    const statusMap = { approved: 'pending', pending: 'approved' };
    const newStatus = statusMap[currentStatus] || 'pending';

    try {
      const res = await fetch(`http://localhost:5000/api/admin/stores/${storeId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        showAlert('Cập nhật trạng thái thành công!');
        fetchStores();
      } else showAlert('Không thể cập nhật trạng thái', 'danger');
    } catch {
      showAlert('Lỗi kết nối', 'danger');
    }
  };

  const handleShowDetail = async (store) => {
    setShowDetailModal(true);
    setLoadingDetail(true);

    try {
      const res = await fetch(`http://localhost:5000/api/admin/stores/${store._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      setStoreDetail(data);
    } catch {
      showAlert('Không thể tải chi tiết cửa hàng', 'danger');
      setShowDetailModal(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved': return <Badge bg="success"><FiCheckCircle /> Đã xác minh</Badge>;
      case 'pending': return <Badge bg="warning"><FiClock /> Chờ xác minh</Badge>;
      case 'rejected': return <Badge bg="danger"><FiXCircle /> Từ chối</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" />
      </div>
    );

  return (
    <Container fluid className="py-4" style={{ background: '#1a1a1a', minHeight: '100vh' }}>
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 style={{ color: '#64B5F6' }}>Quản lý Store</h1>
              <p style={{ color: '#aaa' }}>Danh sách tất cả các cửa hàng hệ thống</p>
            </div>
            <Button variant="outline-secondary" style={{ color: '#64B5F6', borderColor: '#64B5F6' }} onClick={() => navigate('/admin')}>
              <FiArrowLeft className="me-2" /> Quay lại Dashboard
            </Button>
          </div>

          {alert.show && <Alert variant={alert.variant}>{alert.message}</Alert>}

          <Card className="mb-4" style={{ background: '#2a2a2a' }}>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <Form.Control
                    placeholder="Tìm kiếm cửa hàng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ background: '#1a1a1a', color: '#fff' }}
                  />
                </Col>
                <Col md={6}>
                  <Form.Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{ background: '#1a1a1a', color: '#fff' }}
                  >
                    <option value="all">Tất cả</option>
                    <option value="approved">Đã xác minh</option>
                    <option value="pending">Chờ xác minh</option>
                    <option value="rejected">Từ chối</option>
                  </Form.Select>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card style={{ background: '#2a2a2a' }}>
            <Table hover responsive className="text-white">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tên Store</th>
                  <th>Email</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((s, i) => (
                  <tr key={s._id}>
                    <td>{i + 1}</td>
                    <td>{s.storeName}</td>
                    <td>{s.seller?.email}</td>
                    <td>
                      <Form.Check
                        type="switch"
                        checked={s.status === 'approved'}
                        onChange={() => handleStatusToggle(s._id, s.status)}
                      />
                      {getStatusBadge(s.status)}
                    </td>
                    <td>{new Date(s.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <Button size="sm" variant="outline-primary" onClick={() => navigate(`/admin/stores/${s._id}`)}>
                        <FiEye />
                      </Button>
                      <Button size="sm" variant="outline-secondary" className="ms-2" onClick={() => handleShowDetail(s)}>
                        <FiTrash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>

      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết cửa hàng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingDetail ? (
            <div className="text-center py-3"><Spinner animation="border" /></div>
          ) : storeDetail ? (
            <>
              <h4>{storeDetail.storeName}</h4>
              <p>{storeDetail.description || "Không có mô tả"}</p>
              <p><FiUser /> {storeDetail.seller?.fullName} - <FiMail /> {storeDetail.seller?.email}</p>
              <p><FiCalendar /> Ngày tạo: {new Date(storeDetail.createdAt).toLocaleDateString('vi-VN')}</p>
              <p>{getStatusBadge(storeDetail.status)}</p>
            </>
          ) : (
            <Alert variant="danger">Không thể tải dữ liệu</Alert>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AdminStores;
