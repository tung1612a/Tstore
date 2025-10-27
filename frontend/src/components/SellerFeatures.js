import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';

const SellerFeatures = () => {
  const features = [
    {
      icon: '📦',
      title: 'Quản lý sản phẩm',
      description: 'Thêm, sửa, xóa sản phẩm dễ dàng với giao diện thân thiện'
    },
    {
      icon: '📊',
      title: 'Dashboard thống kê',
      description: 'Theo dõi doanh thu, đơn hàng và hiệu suất bán hàng'
    },
    {
      icon: '🚚',
      title: 'Quản lý đơn hàng',
      description: 'Xử lý đơn hàng, cập nhật trạng thái giao hàng'
    },
    {
      icon: '💬',
      title: 'Hỗ trợ khách hàng',
      description: 'Chat trực tiếp với khách hàng, giải đáp thắc mắc'
    }
  ];

  return (
    <div className="seller-features mt-5">
      <h3 className="text-center mb-4">Tại sao chọn Tstore?</h3>
      <Row className="g-4">
        {features.map((feature, index) => (
          <Col md={6} lg={3} key={index}>
            <Card 
              className="h-100 text-center border-0 shadow-sm"
              style={{
                borderRadius: '15px',
                transition: 'all 0.3s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
              }}
            >
              <Card.Body className="p-4">
                <div 
                  className="mb-3"
                  style={{ 
                    fontSize: '2.5rem',
                    lineHeight: '1'
                  }}
                >
                  {feature.icon}
                </div>
                <Card.Title className="h5 mb-3">{feature.title}</Card.Title>
                <Card.Text className="text-muted small">
                  {feature.description}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default SellerFeatures;
