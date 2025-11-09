import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Table } from 'react-bootstrap';
import { FiTruck, FiPackage, FiClock, FiEye, FiCheckCircle, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const   ShipperDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/shipper/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else {
        console.error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      shipped: { variant: 'warning', text: 'Đang giao' },
      completed: { variant: 'success', text: 'Đã giao' },
      paid: { variant: 'info', text: 'Chờ giao' }
    };
    
    const config = statusConfig[status] || { variant: 'secondary', text: status };
    return <Badge bg={config.variant}>{config.text}</Badge>;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <h2>Shipper Dashboard</h2>
            <Button variant="outline-primary" onClick={() => navigate('/shipper/orders')}>
              Xem tất cả đơn hàng
            </Button>
          </div>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="g-4 mb-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FiCheckCircle size={32} className="text-success mb-3" />
              <h3 className="text-success">{dashboardData?.stats?.totalDelivered || 0}</h3>
              <p className="text-muted mb-0">Đã giao</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FiTruck size={32} className="text-warning mb-3" />
              <h3 className="text-warning">{dashboardData?.stats?.totalShipping || 0}</h3>
              <p className="text-muted mb-0">Đang giao</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center">
              <FiClock size={32} className="text-info mb-3" />
              <h3 className="text-info">{dashboardData?.stats?.totalPending || 0}</h3>
              <p className="text-muted mb-0">Chờ giao</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Recent Orders */}
        <Col md={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Đơn hàng gần đây</h5>
            </Card.Header>
            <Card.Body>
              {dashboardData?.recentOrders?.length > 0 ? (
                <div className="table-responsive">
                  <Table hover>
                    <thead>
                      <tr>
                        <th>Mã đơn hàng</th>
                        <th>Khách hàng</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th>Thời gian</th>
                        <th>Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentOrders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            <code>{order._id.slice(-8)}</code>
                          </td>
                          <td>
                            <div>
                              <div className="fw-bold">{order.buyerId?.fullName}</div>
                              <small className="text-muted">{order.buyerId?.phone}</small>
                            </div>
                          </td>
                          <td>{formatCurrency(order.totalPrice)}</td>
                          <td>{getStatusBadge(order.status)}</td>
                          <td>
                            <small>{formatDate(order.updatedAt)}</small>
                          </td>
                          <td>
                            <Button 
                              size="sm" 
                              variant="outline-primary"
                              onClick={() => navigate(`/shipper/orders/${order._id}`)}
                            >
                              <FiEye size={14} />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiPackage size={48} className="text-muted mb-3" />
                  <p className="text-muted">Chưa có đơn hàng nào</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Pending Orders */}
        <Col md={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Đơn hàng chờ giao</h5>
            </Card.Header>
            <Card.Body>
              {dashboardData?.pendingOrders?.length > 0 ? (
                <div className="d-flex flex-column gap-3">
                  {dashboardData.pendingOrders.slice(0, 5).map((order) => (
                    <div key={order._id} className="border rounded p-3">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <code className="small">{order._id.slice(-8)}</code>
                        <Badge bg="info">Chờ giao</Badge>
                      </div>
                      <div className="small">
                        <div className="fw-bold">{order.buyerId?.fullName}</div>
                        <div className="text-muted">{order.addressId?.address}</div>
                        <div className="text-primary fw-bold">{formatCurrency(order.totalPrice)}</div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline-primary" 
                        className="mt-2 w-100"
                        onClick={() => navigate(`/shipper/orders/${order._id}`)}
                      >
                        Xem chi tiết
                      </Button>
                    </div>
                  ))}
                  {dashboardData.pendingOrders.length > 5 && (
                    <Button 
                      variant="outline-secondary" 
                      size="sm"
                      onClick={() => navigate('/shipper/orders?status=paid')}
                    >
                      Xem thêm ({dashboardData.pendingOrders.length - 5})
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <FiClock size={48} className="text-muted mb-3" />
                  <p className="text-muted">Không có đơn hàng chờ giao</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Logout Button */}
      <Row className="mt-5">
        <Col className="text-center">
          <Button 
            variant="outline-danger" 
            size="lg"
            onClick={handleLogout}
            className="d-inline-flex align-items-center"
          >
            <FiLogOut className="me-2" />
            Đăng xuất
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default ShipperDashboard;
