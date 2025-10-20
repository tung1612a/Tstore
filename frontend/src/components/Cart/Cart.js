import React from 'react';
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft, FiCreditCard } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, clearCart } from '../../store/cartSlice';
import { useEffect } from 'react';
import { formatPrice } from '../../utils/formatters';
import CartItem from './CartItem';
import './Cart.css';

function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector(state => state.cart.items);
  const loading = useSelector(state => state.cart.loading);
  const totalQuantity = items.reduce((t,i)=>t+i.quantity,0);
  const totalAmount = items.reduce((t,i)=>t+i.quantity*i.price,0);
  const isEmpty = items.length === 0;

  // Load cart khi component mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);
  
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  const handleClearCart = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?')) {
      try {
        await dispatch(clearCart()).unwrap();
      } catch (error) {
        alert('Có lỗi xảy ra khi xóa giỏ hàng');
      }
    }
  };

  const handleContinueShopping = () => {
    navigate('/');
  };
  
  if (loading) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="text-center">
              <Card.Body className="py-5 d-flex flex-column align-items-center justify-content-center">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h4 className="mb-3">Đang tải giỏ hàng...</h4>
                <p className="text-muted mb-0">Vui lòng chờ trong giây lát</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  if (isEmpty) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <Card className="text-center empty-cart">
              <Card.Body className="py-5 d-flex flex-column align-items-center justify-content-center">
                <FiShoppingCart size={80} className="text-muted mb-4" />
                <h4 className="mb-3">Giỏ hàng trống</h4>
                <p className="text-muted mb-4">
                  Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy thêm một số sản phẩm để bắt đầu mua sắm!
                </p>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleContinueShopping}
                  className="px-4"
                >
                  <FiArrowLeft className="me-2" />
                  Tiếp tục mua sắm
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
  
  return (
    <Container className="py-4">
      <Row>
        <Col lg={8}>
          <div className="cart-header mb-4">
            <h2 className="mb-0">
              <FiShoppingCart className="me-2" />
              Giỏ hàng của bạn
            </h2>
            <p className="text-muted mb-0">
              {totalQuantity} sản phẩm trong giỏ hàng
            </p>
          </div>
          
          <div className="cart-items">
            {items.map(item => (
              <CartItem key={item._id} item={item} />
            ))}
          </div>
          
          <div className="cart-actions mt-4">
            <Button 
              variant="outline-secondary" 
              onClick={handleContinueShopping}
              className="me-2"
            >
              <FiArrowLeft className="me-2" />
              Tiếp tục mua sắm
            </Button>
            <Button 
              variant="outline-danger" 
              onClick={handleClearCart}
            >
              Xóa tất cả
            </Button>
          </div>
        </Col>
        
        <Col lg={4}>
          <Card className="cart-summary sticky-top">
            <Card.Header>
              <h5 className="mb-0">Tóm tắt đơn hàng</h5>
            </Card.Header>
            <Card.Body>
              <div className="summary-row">
                <span>Tạm tính ({totalQuantity} sản phẩm):</span>
                <span className="fw-bold">{formatPrice(totalAmount)}</span>
              </div>
              <div className="summary-row">
                <span>Phí vận chuyển:</span>
                <span className="text-success">Miễn phí</span>
              </div>
              <hr />
              <div className="summary-row total-row">
                <span className="fs-5 fw-bold">Tổng cộng:</span>
                <span className="fs-5 fw-bold text-danger">{formatPrice(totalAmount)}</span>
              </div>
              
              <Alert variant="info" className="mt-3">
                <small>
                  <strong>Ưu đãi:</strong> Miễn phí vận chuyển cho đơn hàng từ 500.000đ
                </small>
              </Alert>
              
              <Button 
                variant="primary" 
                size="lg" 
                className="w-100 mt-3 checkout-btn"
                onClick={handleCheckout}
              >
                <FiCreditCard className="me-2" />
                Thanh toán ngay
              </Button>
              
              <div className="text-center mt-3">
                <small className="text-muted">
                  Bạn có thể thanh toán bằng thẻ tín dụng, ví điện tử hoặc COD
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Cart;
