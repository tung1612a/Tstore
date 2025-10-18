import React from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils/formatters';

function CartItem({ item }) {
  const { removeItem, updateItemQuantity } = useCart();
  
  // Helper functions
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1) {
      updateItemQuantity(item._id, newQuantity);
    }
  };
  
  const handleRemove = () => {
    removeItem(item._id);
  };

  const handleQuantityInputChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    handleQuantityChange(value);
  };
  
  // Calculate total price for this item
  const totalPrice = item.price * item.quantity;
  
  return (
    <Card className="mb-3 cart-item">
      <Card.Body>
        <Row className="align-items-center">
          <Col md={2}>
            <div className="cart-item-image">
              {item.image || item.imageURL ? (
                <img
                  src={item.image || item.imageURL}
                  alt={item.title}
                  className="img-fluid rounded"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                />
              ) : (
                <div
                  className="d-flex align-items-center justify-content-center bg-light rounded"
                  style={{ width: '80px', height: '80px' }}
                >
                  <span className="text-muted small">No Image</span>
                </div>
              )}
            </div>
          </Col>
          
          <Col md={4}>
            <div className="cart-item-details">
              <h6 className="mb-1 cart-item-title">{item.title}</h6>
              {item.sellerId?.fullName || item.seller?.fullName ? (
                <p className="text-muted small mb-0">
                  Người bán: {item.sellerId?.fullName || item.seller?.fullName}
                </p>
              ) : null}
              <div className="cart-item-price">
                <span className="text-danger fw-bold">{formatPrice(item.price)}</span>
              </div>
            </div>
          </Col>
          
          <Col md={3}>
            <div className="quantity-controls d-flex align-items-center">
              <Button
                variant="outline-secondary"
                size="sm"
                className="quantity-btn"
                onClick={() => handleQuantityChange(item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                <FiMinus size={14} />
              </Button>
              
              <Form.Control
                type="number"
                min="1"
                value={item.quantity}
                onChange={handleQuantityInputChange}
                className="quantity-input text-center mx-2"
                style={{ width: '60px' }}
              />
              
              <Button
                variant="outline-secondary"
                size="sm"
                className="quantity-btn"
                onClick={() => handleQuantityChange(item.quantity + 1)}
              >
                <FiPlus size={14} />
              </Button>
            </div>
          </Col>
          
          <Col md={2}>
            <div className="cart-item-total text-end">
              <div className="fw-bold text-danger fs-5">
                {formatPrice(totalPrice)}
              </div>
            </div>
          </Col>
          
          <Col md={1}>
            <Button
              variant="outline-danger"
              size="sm"
              className="remove-btn"
              onClick={handleRemove}
              title="Xóa sản phẩm"
            >
              <FiTrash2 size={16} />
            </Button>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}

export default CartItem;
