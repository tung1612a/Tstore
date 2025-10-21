import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { FiPackage, FiShoppingCart, FiDollarSign, FiAlertTriangle, FiPlus, FiEdit, FiTrendingUp } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SellerHomepage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
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
              <h1 className="display-4 fw-bold">Seller Dashboard</h1>
              <p className="lead">Quản lý cửa hàng và bán hàng hiệu quả</p>
              <Button variant="light" onClick={() => navigate('/')}>
                Quay lại cửa hàng
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
            <strong>Cảnh báo:</strong> Bạn có {lowStockProducts.length} sản phẩm sắp hết hàng!
            <Button variant="outline-warning" size="sm" className="ms-3" onClick={() => navigate('/seller/products')}>
              Xem chi tiết
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
                <p className="text-muted mb-0">Sản phẩm</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiShoppingCart className="text-success mb-3" size={48} />
                <h3 className="text-success">{stats?.totalOrders || 0}</h3>
                <p className="text-muted mb-0">Đơn hàng</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiDollarSign className="text-info mb-3" size={48} />
                <h3 className="text-info">${stats?.totalRevenue?.toFixed(2) || '0.00'}</h3>
                <p className="text-muted mb-0">Doanh thu</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiAlertTriangle className="text-warning mb-3" size={48} />
                <h3 className="text-warning">{stats?.lowStockCount || 0}</h3>
                <p className="text-muted mb-0">Sắp hết hàng</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Row>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Quản lý sản phẩm</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">Thêm mới, chỉnh sửa và quản lý sản phẩm của bạn</p>
                <div className="d-grid gap-2">
                  <Button variant="primary" onClick={() => navigate('/seller/products')}>
                    <FiPackage className="me-2" />
                    Xem tất cả sản phẩm
                  </Button>
                  <Button variant="outline-primary" onClick={() => navigate('/seller/products/new')}>
                    <FiPlus className="me-2" />
                    Thêm sản phẩm mới
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-success text-white">
                <h5 className="mb-0">Quản lý đơn hàng</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">Theo dõi và xử lý đơn hàng từ khách hàng</p>
                <Button variant="success" onClick={() => navigate('/orders')}>
                  <FiShoppingCart className="me-2" />
                  Xem đơn hàng
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-info text-white">
                <h5 className="mb-0">Báo cáo bán hàng</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">Xem thống kê và báo cáo doanh thu</p>
                <Button variant="info" onClick={() => navigate('/seller/reports')}>
                  <FiTrendingUp className="me-2" />
                  Xem báo cáo
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Header className="bg-warning text-white">
                <h5 className="mb-0">Cài đặt cửa hàng</h5>
              </Card.Header>
              <Card.Body>
                <p className="text-muted">Cấu hình thông tin và cài đặt cửa hàng</p>
                <Button variant="warning" onClick={() => navigate('/seller/settings')}>
                  <FiEdit className="me-2" />
                  Cài đặt cửa hàng
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
                <Card.Header className="bg-warning text-white">
                  <h5 className="mb-0">Sản phẩm sắp hết hàng</h5>
                </Card.Header>
                <Card.Body>
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Tên sản phẩm</th>
                          <th>Số lượng còn lại</th>
                          <th>Giá</th>
                          <th>Hành động</th>
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
