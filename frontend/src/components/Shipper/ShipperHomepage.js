import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FiTruck, FiPackage, FiClock, FiCheckCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const ShipperHomepage = () => {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Dashboard",
      description: "Xem thống kê và tình hình giao hàng",
      icon: <FiTruck size={24} />,
      link: "/shipper/dashboard",
      color: "primary"
    },
    {
      title: "Đơn hàng của tôi",
      description: "Quản lý đơn hàng được giao",
      icon: <FiPackage size={24} />,
      link: "/shipper/orders",
      color: "success"
    },
    {
      title: "Đơn hàng chờ giao",
      description: "Xem đơn hàng chờ được giao",
      icon: <FiClock size={24} />,
      link: "/shipper/pending",
      color: "warning"
    }
  ];

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="text-center">
            <FiTruck size={48} className="text-primary mb-3" />
            <h2 className="mb-3">Shipper Dashboard</h2>
            <p className="text-muted">
              Quản lý đơn hàng giao và theo dõi tình hình công việc
            </p>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        {quickActions.map((action, index) => (
          <Col md={4} key={index}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Body className="text-center p-4">
                <div className={`text-${action.color} mb-3`}>
                  {action.icon}
                </div>
                <Card.Title className="h5">{action.title}</Card.Title>
                <Card.Text className="text-muted mb-4">
                  {action.description}
                </Card.Text>
                <Button 
                  variant={action.color}
                  onClick={() => navigate(action.link)}
                  className="w-100"
                >
                  Truy cập
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="mt-5">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h5 className="mb-0">Hướng dẫn sử dụng</h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <h6>Quy trình giao hàng:</h6>
                  <ol className="small">
                    <li>Nhận đơn hàng được assign</li>
                    <li>Xác nhận đã lấy hàng và cập nhật trạng thái "Đang giao"</li>
                    <li>Giao hàng đến khách hàng</li>
                    <li>Cập nhật trạng thái "Đã giao" khi hoàn thành</li>
                  </ol>
                </Col>
                <Col md={6}>
                  <h6>Lưu ý quan trọng:</h6>
                  <ul className="small text-muted">
                    <li>Kiểm tra thông tin địa chỉ giao hàng cẩn thận</li>
                    <li>Liên hệ khách hàng nếu cần thiết</li>
                    <li>Cập nhật trạng thái đơn hàng kịp thời</li>
                    <li>Chụp ảnh xác nhận giao hàng nếu có yêu cầu</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ShipperHomepage;
