import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FiUsers, FiPackage, FiShoppingCart, FiBarChart, FiSettings, FiPlus } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminHomepage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <Container>
          <Row>
            <Col>
              <h1 className="display-4 fw-bold">Admin Dashboard</h1>
              <p className="lead">Quản lý hệ thống và giám sát hoạt động</p>
              <Button variant="light" onClick={() => navigate('/')}>
                Quay lại cửa hàng
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        {/* Quick Stats */}
        <Row className="mb-5">
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiUsers className="text-primary mb-3" size={48} />
                <h3 className="text-primary">{stats?.totalUsers || 0}</h3>
                <p className="text-muted mb-0">Tổng n   gười dùng</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiPackage className="text-success mb-3" size={48} />
                <h3 className="text-success">{stats?.totalProducts || 0}</h3>
                <p className="text-muted mb-0">Sản phẩm</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiShoppingCart className="text-info mb-3" size={48} />
                <h3 className="text-info">{stats?.totalOrders || 0}</h3>
                <p className="text-muted mb-0">Đơn hàng</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiUsers className="text-warning mb-3" size={48} />
                <h3 className="text-warning">{stats?.totalSellers || 0}</h3>
                <p className="text-muted mb-0">Người bán</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Quản lý người dùng</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">Xem và quản lý tất cả người dùng trong hệ thống</p>
                <Button variant="primary" onClick={() => navigate('/admin/users')}>
                  <FiUsers className="me-2" />
                  Quản lý Users
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">Báo cáo & Thống kê</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">Xem báo cáo chi tiết và thống kê hệ thống</p>
                <Button variant="success" onClick={() => navigate('/admin/reports')}>
                  <FiBarChart className="me-2" />
                  Xem Báo cáo
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">Quản lý sản phẩm</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">Kiểm duyệt và quản lý sản phẩm của sellers</p>
                <Button variant="info" onClick={() => navigate('/admin/products')}>
                  <FiPackage className="me-2" />
                  Quản lý Sản phẩm
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-warning text-white">
                <h5 className="mb-0">Cài đặt hệ thống</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">Cấu hình và cài đặt các tham số hệ thống</p>
                <Button variant="warning" onClick={() => navigate('/admin/settings')}>
                  <FiSettings className="me-2" />
                  Cài đặt
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminHomepage;
