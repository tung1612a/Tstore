import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { FiUser, FiEdit, FiLogOut, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      navigate('/login');
      return;
    }

    try {
      setUser(JSON.parse(userData));
    } catch (err) {
      console.error('Error parsing user data:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

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
                      {user.avatarURL ? (
                        <img 
                          src={user.avatarURL} 
                          alt="Avatar" 
                          className="rounded-circle"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <FiUser size={48} className="text-muted" />
                      )}
                    </div>
                  </div>
                  <Button variant="outline-primary" size="sm">
                    <FiEdit className="me-1" />
                    Cập nhật ảnh
                  </Button>
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
                                user.role === 'admin' ? 'bg-danger' : 
                                user.role === 'seller' ? 'bg-warning' : 'bg-info'
                              }`}>
                                {user.role === 'admin' ? 'Quản trị viên' : 
                                 user.role === 'seller' ? 'Người bán' : 'Khách hàng'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex gap-2">
                    <Button variant="primary" onClick={() => navigate('/change-password')}>
                      <FiEdit className="me-1" />
                      Đổi mật khẩu
                    </Button>
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
    </Container>
  );
}

export default Profile;
