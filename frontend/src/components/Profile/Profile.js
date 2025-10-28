import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner, Badge, Form } from 'react-bootstrap';
import { FiUser, FiEdit, FiLogOut, FiMail, FiPhone, FiMapPin, FiTruck, FiPackage, FiCheckCircle, FiClock, FiDollarSign, FiSave } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Profile() {
  const { user, loading, logout, isShipper } = useAuth();
  const navigate = useNavigate();
  const [shipperStats, setShipperStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarMsg, setAvatarMsg] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Fetch shipper stats if user is a shipper
  useEffect(() => {
    if (isShipper()) {
      fetchShipperStats();
    }
  }, [isShipper]);

  const fetchShipperStats = async () => {
    try {
      setLoadingStats(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/shipper/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setShipperStats(data);
      }
    } catch (error) {
      console.error('Error fetching shipper stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  useEffect(() => {
    if (user?.avatarUrl || user?.avatarURL) {
      setAvatarUrl(user.avatarUrl || user.avatarURL);
    }
  }, [user]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted">Đang tải thông tin...</p>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container className="py-5">
        <Alert variant="warning">
          <Alert.Heading>Chưa đăng nhập</Alert.Heading>
          <p>Vui lòng đăng nhập để xem thông tin cá nhân.</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0 d-flex align-items-center">
                <FiUser className="me-2" />
                Thông tin cá nhân
              </h4>
            </Card.Header>
            <Card.Body className="p-4">
              <Row className="g-4">
                <Col md={4} className="text-center">
                  <div className="mb-3">
                    <div
                      className="rounded-circle bg-light d-flex align-items-center justify-content-center mx-auto"
                      style={{ width: '120px', height: '120px' }}
                    >
                      { (user.avatarUrl || user.avatarURL) ? (
                        <img
                          src={user.avatarUrl || user.avatarURL}
                          alt="Avatar"
                          className="rounded-circle"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <FiUser size={48} className="text-muted" />
                      )}
                    </div>
                  </div>
                  <Form.Group className="mb-2">
                    <Form.Control
                      type="file"
                      accept="image/*"
                      onChange={(e)=>{
                        const file = e.target.files?.[0];
                        if (file) {
                          setAvatarUrl(URL.createObjectURL(file));
                          // Store file object for upload
                          window.__avatarFile = file;
                        }
                      }}
                    />
                  </Form.Group>
                  <div className="d-grid">
                    <Button variant="outline-primary" size="sm" onClick={async ()=>{
                      setAvatarMsg('');
                      try {
                        const token = localStorage.getItem('token');
                        const fd = new FormData();
                        if (window.__avatarFile) {
                          fd.append('avatar', window.__avatarFile);
                        } else if (avatarUrl) {
                          // fallback: remote URL
                          fd.append('avatarUrl', avatarUrl);
                        }
                        const res = await fetch('/api/auth/avatar', {
                          method: 'PUT',
                          headers: {
                            Authorization: token ? `Bearer ${token}` : ''
                          },
                          body: fd
                        });
                        const data = await res.json();
                        if (!res.ok) throw new Error(data?.message || 'Cập nhật ảnh thất bại');
                        setAvatarMsg('Cập nhật ảnh thành công');
                      } catch (e) {
                        setAvatarMsg(e.message || 'Lỗi cập nhật ảnh');
                      }
                    }}>
                      <FiSave className="me-1" /> Upload & Lưu ảnh
                    </Button>
                  </div>
                  {avatarMsg && (
                    <div className="small mt-2 {avatarMsg.includes('thành công') ? 'text-success' : 'text-danger'}">
                      {avatarMsg}
                    </div>
                  )}
                </Col>

                <Col md={8}>
                  <div className="mb-4">
                    <h5 className="text-primary mb-3">Thông tin cơ bản</h5>
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <div className="d-flex align-items-center">
                          <FiUser className="me-2 text-muted" />
                          <div>
                            <small className="text-muted">Họ và tên</small>
                            <div className="fw-medium">{user.fullName || 'Chưa cập nhật'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="d-flex align-items-center">
                          <FiMail className="me-2 text-muted" />
                          <div>
                            <small className="text-muted">Email</small>
                            <div className="fw-medium">{user.email || 'Chưa cập nhật'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="d-flex align-items-center">
                          <FiPhone className="me-2 text-muted" />
                          <div>
                            <small className="text-muted">Số điện thoại</small>
                            <div className="fw-medium">{user.phone || 'Chưa cập nhật'}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-sm-6">
                        <div className="d-flex align-items-center">
                          <FiUser className="me-2 text-muted" />
                          <div>
                            <small className="text-muted">Vai trò</small>
                            <div className="fw-medium">
                              <span className={`badge ${
                                user.role === 'devadmin' ? 'bg-danger' :
                                user.role === 'admin' ? 'bg-warning' :
                                user.role === 'seller' ? 'bg-primary' :
                                user.role === 'shipper' ? 'bg-success' : 'bg-info'
                              }`}>
                                {user.role === 'devadmin' ? 'Dev Admin' :
                                 user.role === 'admin' ? 'Admin' :
                                 user.role === 'seller' ? 'Người bán' :
                                 user.role === 'shipper' ? 'Người giao hàng' : 'Khách hàng'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipper Stats Section */}
                  {isShipper() && (
                    <div className="mb-4">
                      <h5 className="text-success mb-3">
                        <FiTruck className="me-2" />
                        Thống kê giao hàng
                      </h5>
                      {loadingStats ? (
                        <div className="text-center py-3">
                          <Spinner size="sm" animation="border" variant="success" />
                          <span className="ms-2 text-muted">Đang tải thống kê...</span>
                        </div>
                      ) : shipperStats ? (
                        <Row className="g-3">
                          <Col md={3}>
                            <div className="text-center p-3 border rounded">
                              <FiCheckCircle size={24} className="text-success mb-2" />
                              <h6 className="text-success mb-1">{shipperStats.stats?.totalDelivered || 0}</h6>
                              <small className="text-muted">Đã giao</small>
                            </div>
                          </Col>
                          <Col md={3}>
                            <div className="text-center p-3 border rounded">
                              <FiTruck size={24} className="text-warning mb-2" />
                              <h6 className="text-warning mb-1">{shipperStats.stats?.totalShipping || 0}</h6>
                              <small className="text-muted">Đang giao</small>
                            </div>
                          </Col>
                          <Col md={3}>
                            <div className="text-center p-3 border rounded">
                              <FiClock size={24} className="text-info mb-2" />
                              <h6 className="text-info mb-1">{shipperStats.stats?.totalPending || 0}</h6>
                              <small className="text-muted">Chờ giao</small>
                            </div>
                          </Col>
                          <Col md={3}>
                            <div className="text-center p-3 border rounded">
                              <FiDollarSign size={24} className="text-primary mb-2" />
                              <h6 className="text-primary mb-1">{formatCurrency(shipperStats.stats?.totalEarnings || 0)}</h6>
                              <small className="text-muted">Thu nhập</small>
                            </div>
                          </Col>
                        </Row>
                      ) : (
                        <Alert variant="info" className="mb-0">
                          <FiPackage className="me-2" />
                          Chưa có thống kê giao hàng
                        </Alert>
                      )}
                    </div>
                  )}

                  <div className="d-flex gap-2">
                    <Button variant="primary" onClick={() => navigate('/change-password')}>
                      <FiEdit className="me-1" />
                      Đổi mật khẩu
                    </Button>
                    {isShipper() && (
                      <Button variant="success" onClick={() => navigate('/shipper/dashboard')}>
                        <FiTruck className="me-1" />
                        Dashboard Shipper
                      </Button>
                    )}
                    <Button variant="outline-danger" onClick={handleLogout}>
                      <FiLogOut className="me-1" />
                      Đăng xuất
                    </Button>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row className="justify-content-center mt-3">
        <Col lg={8} className="text-end">
          <Button className="btn-back-to-store" onClick={() => navigate('/')}>
            Quay lại cửa hàng
          </Button>
        </Col>
      </Row>
    </Container>
  );
}

export default Profile;
