import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';

function Footer() {
  return (
    <footer className="mt-5">
      <Container>
        <Row className="py-5">
          <Col md={4} className="mb-4">
            <h5 className="text-white mb-3">WDP Shop</h5>
            <p className="text-light mb-3">
              Nền tảng thương mại điện tử hàng đầu Việt Nam, 
              mang đến trải nghiệm mua sắm tuyệt vời.
            </p>
            <div className="d-flex gap-3">
              <FiFacebook size={20} className="text-light" />
              <FiTwitter size={20} className="text-light" />
              <FiInstagram size={20} className="text-light" />
            </div>
          </Col>
          <Col md={2} className="mb-4">
            <h6 className="text-white mb-3">Về chúng tôi</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-light text-decoration-none">Giới thiệu</a></li>
              <li><a href="#" className="text-light text-decoration-none">Tuyển dụng</a></li>
              <li><a href="#" className="text-light text-decoration-none">Liên hệ</a></li>
            </ul>
          </Col>
          <Col md={2} className="mb-4">
            <h6 className="text-white mb-3">Hỗ trợ</h6>
            <ul className="list-unstyled">
              <li><a href="#" className="text-light text-decoration-none">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="text-light text-decoration-none">Chính sách bảo mật</a></li>
              <li><a href="#" className="text-light text-decoration-none">Điều khoản sử dụng</a></li>
            </ul>
          </Col>
          <Col md={4} className="mb-4">
            <h6 className="text-white mb-3">Liên hệ</h6>
            <div className="d-flex align-items-center mb-2">
              <FiMail className="me-2 text-light" />
              <span className="text-light">support@wdp.com</span>
            </div>
            <div className="d-flex align-items-center mb-2">
              <FiPhone className="me-2 text-light" />
              <span className="text-light">1900 1234</span>
            </div>
            <div className="d-flex align-items-center">
              <FiMapPin className="me-2 text-light" />
              <span className="text-light">Hà Nội, Việt Nam</span>
            </div>
          </Col>
        </Row>
        <hr className="text-light" />
        <Row className="py-3">
          <Col className="text-center">
            <p className="text-light mb-0">
              © {new Date().getFullYear()} WDP Shop. Tất cả quyền được bảo lưu.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;


