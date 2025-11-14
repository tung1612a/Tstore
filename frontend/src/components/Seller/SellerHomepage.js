import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { FiPackage, FiShoppingCart, FiDollarSign, FiAlertTriangle, FiPlus, FiEdit, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SellerHomepage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/seller/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setLowStockProducts(data.lowStockProducts);
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
      <div className="bg-success text-white py-5">
        <Container>
          <Row>
            <Col>
              <h1 className="display-4 fw-bold">{t('seller.heroTitle')}</h1>
              <p className="lead">{t('seller.heroSubtitle')}</p>
              <Button variant="light" onClick={() => navigate('/')}>
                {t('common.back')}
              </Button>
              <Button style={{marginLeft: '10px'}} variant="light" onClick={() => navigate('/login')}>
                Đăng xuất
              </Button>
            </Col>
          </Row>
        </Container>
      </div>

      <Container className="py-5">
        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Alert variant="warning" className="mb-4">
            <FiAlertTriangle className="me-2" />
            <strong>{t('seller.warning')}:</strong> {t('seller.lowStockAlert')} {lowStockProducts.length}!
            <Button variant="outline-warning" size="sm" className="ms-3" onClick={() => navigate('/seller/products')}>
              {t('seller.viewDetails')}
            </Button>
          </Alert>
        )}

        {/* Quick Stats */}
        <Row className="mb-5">
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiPackage className="text-primary mb-3" size={48} />
                <h3 className="text-primary">{stats?.totalProducts || 0}</h3>
                <p className="text-muted mb-0">{t('seller.totalProducts')}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiShoppingCart className="text-success mb-3" size={48} />
                <h3 className="text-success">{stats?.totalOrders || 0}</h3>
                <p className="text-muted mb-0">{t('seller.totalOrders')}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiDollarSign className="text-info mb-3" size={48} />
                <h3 className="text-info">${stats?.totalRevenue?.toFixed(2) || '0.00'}</h3>
                <p className="text-muted mb-0">{t('seller.revenue')}</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiAlertTriangle className="text-warning mb-3" size={48} />
                <h3 className="text-warning">{stats?.lowStockCount || 0}</h3>
                <p className="text-muted mb-0">{t('seller.lowStockCount')}</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-primary text-dark">
                <h5 className="mb-0">{t('seller.manageProducts')}</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">{t('seller.manageProductsDesc')}</p>
                <div className="d-grid gap-2">
                  <Button variant="primary" onClick={() => navigate('/seller/products')}>
                    <FiPackage className="me-2" />
                    {t('seller.viewProducts')}
                  </Button>
                  {/* <Button variant="outline-primary" onClick={() => navigate('/seller/products/new')}>
                    <FiPlus className="me-2" />
                    Thêm sản phẩm mới
                  </Button> */}
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-success text-dark">
                <h5 className="mb-0">{t('seller.manageOrders')}</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">{t('seller.manageOrdersDesc')}</p>
                <Button variant="success" onClick={() => navigate('/seller/orders')}>
                  <FiShoppingCart className="me-2" />
                  {t('seller.viewOrders')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-danger text-dark">
                <h5 className="mb-0">Khiếu nại</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">Quản lý và xử lý khiếu nại từ khách hàng</p>
                <Button variant="danger" onClick={() => navigate('/seller/complaints')}>
                  <FiAlertTriangle className="me-2" />
                  Xem khiếu nại
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-info text-dark">
                <h5 className="mb-0">{t('seller.reports')}</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">{t('seller.reportsDesc')}</p>
                <Button variant="info" onClick={() => navigate('/seller/reports')}>
                  <FiTrendingUp className="me-2" />
                  {t('seller.viewReports')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-warning text-dark">
                <h5 className="mb-0">{t('seller.settings')}</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">{t('seller.settingsDesc')}</p>
                <Button variant="warning" onClick={() => navigate('/seller/settings')}>
                  <FiEdit className="me-2" />
                  {t('seller.settings')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Recent Low Stock Products */}
        {lowStockProducts.length > 0 && (
          <Row className="mt-4">
            <Col>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-warning text-dark">
                  <h5 className="mb-0">{t('seller.lowStock')}</h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>{t('product.description')}</th>
                          <th>{t('product.quantity')}</th>
                          <th>{t('product.price')}</th>
                          <th>{t('common.edit')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lowStockProducts.slice(0, 5).map(product => (
                          <tr key={product._id}>
                            <td>{product.title}</td>
                            <td>
                              <span className={`badge ${product.stock <= 5 ? 'bg-danger' : 'bg-warning'}`}>
                                {product.stock}
                              </span>
                            </td>
                            <td>${product.price}</td>
                            <td>
                              <Button variant="outline-primary" size="sm">
                                <FiEdit className="me-1" />
                                Cập nhật
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
};

export default SellerHomepage;
