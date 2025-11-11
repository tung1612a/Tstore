import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import { FiSearch, FiEdit, FiTrash2, FiEye, FiArrowLeft } from 'react-icons/fi';
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
  const [selectedStore, setSelectedStore] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    fetchStores();
  }, [statusFilter, searchTerm]);

  const fetchStores = async () => {
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
  };

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

  const handleDeleteStore = async (storeId, sellerId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa store và user này không?')) {
      return;
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
                    <option value="approved">Hoạt động</option>
                    <option value="pending">Chờ xử lý</option>
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
                              onClick={() => handleDeleteStore(store._id, store.sellerId._id)}
                              style={{ 
                                color: '#999', 
                                borderColor: '#666',
                                backgroundColor: 'transparent'
                              }}
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
    </Container>
  );
};

export default AdminStores;
