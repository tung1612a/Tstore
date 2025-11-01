import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Toast,
  ToastContainer
} from 'react-bootstrap';
import {
  FiUsers,
  FiPackage,
  FiShoppingCart,
  FiBarChart,
  FiSettings
} from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const AdminDashboard = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); // 👈 lấy state từ navigate()
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastBg, setToastBg] = useState('success');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // ✅ Kiểm tra khi đăng nhập hoặc đăng xuất thành công
  useEffect(() => {
    if (location.state?.loginSuccess) {
      setToastMessage('Đăng nhập thành công');
      setToastBg('success');
      setShowToast(true);
      window.history.replaceState({}, document.title);
    } else if (location.state?.logoutSuccess) {
      setToastMessage('Đăng xuất thành công');
      setToastBg('info');
      setShowToast(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

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
              <h1 className="display-4 fw-bold">{t('profile.devAdmin')} Dashboard</h1>
              <p className="lead">{t('admin.systemManagement')}</p>
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
                <p className="text-muted mb-0">{t('admin.totalUsers')}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiPackage className="text-success mb-3" size={48} />
                <h3 className="text-success">{stats?.totalProducts || 0}</h3>
                <p className="text-muted mb-0">{t('admin.totalProducts')}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiShoppingCart className="text-info mb-3" size={48} />
                <h3 className="text-info">{stats?.totalOrders || 0}</h3>
                <p className="text-muted mb-0">{t('admin.totalOrders')}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiUsers className="text-warning mb-3" size={48} />
                <h3 className="text-warning">{stats?.totalSellers || 0}</h3>
                <p className="text-muted mb-0">{t('admin.totalSellers')}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">{t('admin.manageUsers')}</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">{t('admin.viewUsers')}</p>
                <Button variant="primary" onClick={() => navigate('/admin/users')}>
                  <FiUsers className="me-2" />
                  {t('admin.manageUserBtn')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">{t('admin.reports')}</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">{t('admin.viewReports')}</p>
                <Button variant="success" onClick={() => navigate('/admin/reports')}>
                  <FiBarChart className="me-2" />
                  {t('admin.viewReportsBtn')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">{t('admin.manageProducts')}</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">{t('admin.viewProducts')}</p>
                <Button variant="info" onClick={() => navigate('/admin/products')}>
                  <FiPackage className="me-2" />
                  {t('admin.manageProductsBtn')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-warning text-white">
                <h5 className="mb-0">{t('admin.settings')}</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">{t('admin.viewSettings')}</p>
                <Button variant="warning" onClick={() => navigate('/admin/settings')}>
                  <FiSettings className="me-2" />
                  {t('admin.settings')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col>
            <Button variant="secondary" onClick={() => navigate("/login", { state: { logoutSuccess: true } })}>
              {t('navbar.logout')}
            </Button>
          </Col>
        </Row>
      </Container>

      {/* ✅ Toast thông báo đăng nhập thành công */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toastBg}
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={2000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Thông báo</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default AdminDashboard;
