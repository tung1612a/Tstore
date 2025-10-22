import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Badge, Table } from 'react-bootstrap';
import { FiTrendingUp, FiPackage, FiDollarSign, FiAlertTriangle, FiShoppingCart, FiUsers, FiBarChart, FiPieChart } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const SellerDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Mock data for charts
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data for demonstration
      const mockStats = {
        totalProducts: 45,
        totalOrders: 128,
        totalRevenue: 125000000,
        lowStockCount: 3,
        monthlyGrowth: 12.5,
        conversionRate: 8.2
      };
      
      const mockLowStock = [
        { _id: '1', title: 'iPhone 14 Pro', stock: 2, price: 25000000 },
        { _id: '2', title: 'Samsung Galaxy S23', stock: 1, price: 22000000 },
        { _id: '3', title: 'MacBook Air M2', stock: 3, price: 35000000 }
      ];
      
      const mockOrders = [
        { _id: 'order1', userId: { fullName: 'Nguyễn Văn A' }, totalAmount: 1500000, status: 'completed' },
        { _id: 'order2', userId: { fullName: 'Trần Thị B' }, totalAmount: 2300000, status: 'pending' },
        { _id: 'order3', userId: { fullName: 'Lê Văn C' }, totalAmount: 1800000, status: 'shipped' }
      ];
      
      // Mock chart data
      const mockSalesData = [
        { month: 'Tháng 1', sales: 45000000 },
        { month: 'Tháng 2', sales: 52000000 },
        { month: 'Tháng 3', sales: 48000000 },
        { month: 'Tháng 4', sales: 62000000 },
        { month: 'Tháng 5', sales: 58000000 },
        { month: 'Tháng 6', sales: 75000000 }
      ];
      
      const mockCategoryData = [
        { category: 'Điện thoại', value: 45, color: '#007bff' },
        { category: 'Laptop', value: 30, color: '#28a745' },
        { category: 'Phụ kiện', value: 15, color: '#ffc107' },
        { category: 'Khác', value: 10, color: '#dc3545' }
      ];
      
      const mockMonthlyRevenue = [
        { month: 'Jan', revenue: 12000000 },
        { month: 'Feb', revenue: 15000000 },
        { month: 'Mar', revenue: 18000000 },
        { month: 'Apr', revenue: 22000000 },
        { month: 'May', revenue: 25000000 },
        { month: 'Jun', revenue: 30000000 }
      ];
      
      setStats(mockStats);
      setLowStockProducts(mockLowStock);
      setRecentOrders(mockOrders);
      setSalesData(mockSalesData);
      setCategoryData(mockCategoryData);
      setMonthlyRevenue(mockMonthlyRevenue);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
          <Spinner animation="border" variant="primary" />
          <span className="ms-3">Đang tải dữ liệu...</span>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <Alert.Heading>Lỗi tải dữ liệu</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h2 className="mb-0">Seller Dashboard</h2>
        <div className="text-muted">
          <FiBarChart className="me-2" />
          Tổng quan cửa hàng
        </div>
      </div>
      
      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                  <FiPackage className="text-primary" size={24} />
                </div>
              </div>
              <div>
                <h6 className="text-muted mb-1">Tổng sản phẩm</h6>
                <h3 className="mb-0 text-primary">{stats?.totalProducts || 0}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="bg-success bg-opacity-10 rounded-circle p-3">
                  <FiShoppingCart className="text-success" size={24} />
                </div>
              </div>
              <div>
                <h6 className="text-muted mb-1">Tổng đơn hàng</h6>
                <h3 className="mb-0 text-success">{stats?.totalOrders || 0}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="bg-info bg-opacity-10 rounded-circle p-3">
                  <FiDollarSign className="text-info" size={24} />
                </div>
              </div>
              <div>
                <h6 className="text-muted mb-1">Doanh thu</h6>
                <h3 className="mb-0 text-info">
                  {(stats?.totalRevenue || 0).toLocaleString('vi-VN')}đ
                </h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3} className="mb-3">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body className="d-flex align-items-center">
              <div className="flex-shrink-0 me-3">
                <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                  <FiAlertTriangle className="text-warning" size={24} />
                </div>
              </div>
              <div>
                <h6 className="text-muted mb-1">Sắp hết hàng</h6>
                <h3 className="mb-0 text-warning">{stats?.lowStockCount || 0}</h3>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Charts Section */}
      <Row className="mb-4">
        {/* Sales Chart */}
        <Col lg={8} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <div className="d-flex align-items-center">
                <FiTrendingUp className="me-2 text-primary" />
                <h5 className="mb-0">Biểu đồ doanh thu theo tháng</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="chart-container" style={{ height: '300px' }}>
                <div className="d-flex align-items-end justify-content-between h-100">
                  {salesData.map((item, index) => {
                    const maxValue = Math.max(...salesData.map(d => d.sales));
                    const height = (item.sales / maxValue) * 100;
                    return (
                      <div key={index} className="d-flex flex-column align-items-center">
                        <div 
                          className="bg-primary rounded-top"
                          style={{ 
                            width: '40px', 
                            height: `${height}%`,
                            minHeight: '20px'
                          }}
                        />
                        <small className="text-muted mt-2">{item.month}</small>
                        <small className="text-primary fw-bold">
                          {(item.sales / 1000000).toFixed(1)}M
                        </small>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Category Chart */}
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <div className="d-flex align-items-center">
                <FiPieChart className="me-2 text-success" />
                <h5 className="mb-0">Phân bố danh mục</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="chart-container" style={{ height: '300px' }}>
                <div className="d-flex flex-column justify-content-center h-100">
                  {categoryData.map((item, index) => (
                    <div key={index} className="d-flex align-items-center mb-3">
                      <div 
                        className="rounded-circle me-3"
                        style={{ 
                          width: '12px', 
                          height: '12px', 
                          backgroundColor: item.color 
                        }}
                      />
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between">
                          <span className="fw-medium">{item.category}</span>
                          <span className="text-muted">{item.value}%</span>
                        </div>
                        <div className="progress mt-1" style={{ height: '6px' }}>
                          <div 
                            className="progress-bar"
                            style={{ 
                              width: `${item.value}%`,
                              backgroundColor: item.color
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Data Tables */}
      <Row>
        {/* Low Stock Products */}
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <div className="d-flex align-items-center">
                <FiAlertTriangle className="me-2 text-warning" />
                <h5 className="mb-0">Sản phẩm sắp hết hàng</h5>
              </div>
            </Card.Header>
            <Card.Body>
              {lowStockProducts.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Tồn kho</th>
                      <th>Giá</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockProducts.map(product => (
                      <tr key={product._id}>
                        <td>
                          <div className="fw-medium">{product.title}</div>
                        </td>
                        <td>
                          <Badge 
                            bg={product.stock <= 2 ? 'danger' : 'warning'}
                            className="px-2 py-1"
                          >
                            {product.stock}
                          </Badge>
                        </td>
                        <td className="text-end">
                          {product.price.toLocaleString('vi-VN')}đ
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <FiPackage size={48} className="text-muted mb-3" />
                  <p className="text-muted">Không có sản phẩm nào sắp hết hàng</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Recent Orders */}
        <Col lg={6} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <div className="d-flex align-items-center">
                <FiShoppingCart className="me-2 text-info" />
                <h5 className="mb-0">Đơn hàng gần đây</h5>
              </div>
            </Card.Header>
            <Card.Body>
              {recentOrders.length > 0 ? (
                <Table responsive hover>
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Khách hàng</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map(order => (
                      <tr key={order._id}>
                        <td>
                          <code className="text-muted">#{order._id.slice(-8)}</code>
                        </td>
                        <td>{order.userId?.fullName}</td>
                        <td className="text-end">
                          {order.totalAmount.toLocaleString('vi-VN')}đ
                        </td>
                        <td>
                          <Badge 
                            bg={
                              order.status === 'completed' ? 'success' :
                              order.status === 'pending' ? 'warning' : 
                              order.status === 'shipped' ? 'info' : 'secondary'
                            }
                            className="px-2 py-1"
                          >
                            {order.status === 'completed' ? 'Hoàn thành' :
                             order.status === 'pending' ? 'Chờ xử lý' :
                             order.status === 'shipped' ? 'Đang giao' : order.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (
                <div className="text-center py-4">
                  <FiShoppingCart size={48} className="text-muted mb-3" />
                  <p className="text-muted">Chưa có đơn hàng nào</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SellerDashboard;