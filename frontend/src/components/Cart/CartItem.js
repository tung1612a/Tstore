import React from 'react';
import { Card, Button, Form, Row, Col } from 'react-bootstrap';
import { FiTrash2, FiMinus, FiPlus } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { updateQuantity, removeFromCart } from '../../store/cartSlice';
import { formatPrice } from '../../utils/formatters';
import { useToast } from '../../contexts/ToastContext';

function CartItem({ item, isSelected = true, onToggleSelect, onRemove }) {
  const dispatch = useDispatch();
  const { showWarning, showError, showConfirm } = useToast();
  
  // Helper functions
  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) {
      return;
    }
    
    // Kiểm tra stock
    const availableStock = item.stock ?? 0;
    if (newQuantity > availableStock) {
      showWarning(`Chỉ còn ${availableStock} sản phẩm trong kho`);
      return;
    }
    
    // Kiểm tra maxPurchaseQuantity nếu có
    const maxPurchaseQuantity = item.maxPurchaseQuantity;
    if (maxPurchaseQuantity !== null && maxPurchaseQuantity !== undefined && newQuantity > maxPurchaseQuantity) {
      showWarning(`Số lượng mua tối đa cho sản phẩm này là ${maxPurchaseQuantity} sản phẩm/đơn hàng`);
      return;
    }
    
    try {
      await dispatch(updateQuantity({ productId: item._id, quantity: newQuantity })).unwrap();
    } catch (error) {
      const errorMessage = error.message || 'Có lỗi xảy ra khi cập nhật số lượng';
      showError(errorMessage);
    }
  };
  
  const handleRemove = async () => {
    showConfirm('Bạn có chắc muốn xóa sản phẩm này?', async () => {
      try {
        await dispatch(removeFromCart(item._id)).unwrap();
        if (onRemove) onRemove();
      } catch (error) {
        showError('Có lỗi xảy ra khi xóa sản phẩm');
      }
    });
  };

  const handleQuantityInputChange = async (e) => {
    const value = parseInt(e.target.value) || 1;
    const availableStock = item.stock ?? 0;
    const maxPurchaseQuantity = item.maxPurchaseQuantity;
    
    // Giới hạn giá trị nhập vào không vượt quá stock và maxPurchaseQuantity
    let limitedValue = Math.min(value, availableStock);
    if (maxPurchaseQuantity !== null && maxPurchaseQuantity !== undefined) {
      limitedValue = Math.min(limitedValue, maxPurchaseQuantity);
    }
    
    if (value > availableStock) {
      showWarning(`Chỉ còn ${availableStock} sản phẩm trong kho`);
    } else if (maxPurchaseQuantity !== null && maxPurchaseQuantity !== undefined && value > maxPurchaseQuantity) {
      showWarning(`Số lượng mua tối đa cho sản phẩm này là ${maxPurchaseQuantity} sản phẩm/đơn hàng`);
    }
    
    await handleQuantityChange(limitedValue);
  };
  
  // Calculate total price for this item
  const totalPrice = item.price * item.quantity;
  
  return (
    <Card className={`mb-3 cart-item ${!isSelected ? 'opacity-50' : ''}`}>
      <Card.Body>
        <Row className="align-items-center">
          <Col md={1} className="d-flex align-items-center justify-content-center">
            <Form.Check
              type="checkbox"
              checked={isSelected}
              onChange={onToggleSelect}
              style={{ cursor: 'pointer' }}
            />
          </Col>
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
          
          <Col md={3}>
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
              {item.stock !== undefined && (
                <div className="stock-info mt-2">
                  <small className={item.stock > 0 ? 'text-success' : 'text-danger'}>
                    {item.stock > 0 
                      ? `Còn lại: ${item.stock} sản phẩm` 
                      : 'Đã hết hàng'}
                  </small>
                </div>
              )}
            </div>
          </Col>
          
          <Col md={3} className={!isSelected ? 'text-muted' : ''}>
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
                max={
                  item.maxPurchaseQuantity !== null && item.maxPurchaseQuantity !== undefined
                    ? Math.min(item.stock ?? Infinity, item.maxPurchaseQuantity)
                    : item.stock ?? undefined
                }
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
                disabled={
                  (item.stock !== undefined && item.quantity >= item.stock) ||
                  (item.maxPurchaseQuantity !== null && 
                   item.maxPurchaseQuantity !== undefined && 
                   item.quantity >= item.maxPurchaseQuantity)
                }
                title={
                  item.maxPurchaseQuantity !== null && item.maxPurchaseQuantity !== undefined && item.quantity >= item.maxPurchaseQuantity
                    ? `Số lượng mua tối đa: ${item.maxPurchaseQuantity} sản phẩm/đơn hàng`
                    : item.stock !== undefined && item.quantity >= item.stock
                    ? `Chỉ còn ${item.stock} sản phẩm`
                    : ''
                }
              >
                <FiPlus size={14} />
              </Button>
            </div>
            {item.maxPurchaseQuantity !== null && 
             item.maxPurchaseQuantity !== undefined && 
             item.quantity >= item.maxPurchaseQuantity && (
              <small className="text-danger d-block mt-1">
                Đã đạt giới hạn mua tối đa ({item.maxPurchaseQuantity} sản phẩm/đơn hàng)
              </small>
            )}
            {item.stock !== undefined && 
             item.quantity >= item.stock && 
             (item.maxPurchaseQuantity === null || 
              item.maxPurchaseQuantity === undefined || 
              item.maxPurchaseQuantity > item.stock) && (
              <small className="text-danger d-block mt-1">
                Đã đạt giới hạn tồn kho
              </small>
            )}
            {item.maxPurchaseQuantity !== null && 
             item.maxPurchaseQuantity !== undefined && 
             item.quantity < item.maxPurchaseQuantity && (
              <small className="text-muted d-block mt-1">
                Giới hạn mua: {item.maxPurchaseQuantity} sản phẩm/đơn hàng
              </small>
            )}
          </Col>
          
          <Col md={2}>
            <div className={`cart-item-total text-end ${!isSelected ? 'text-muted' : ''}`}>
              <div className={`fw-bold fs-5 ${isSelected ? 'text-danger' : 'text-muted'}`}>
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
