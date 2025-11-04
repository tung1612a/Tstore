import React from 'react';
import { Container, Row, Col, Card, Button, Alert, Toast, ToastContainer, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft, FiCreditCard } from 'react-icons/fi';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, clearCart, removeFromCart } from '../../store/cartSlice';
import { useEffect } from 'react';
import { formatPrice } from '../../utils/formatters';
import { useTranslation } from 'react-i18next';
import CartItem from './CartItem';
import './Cart.css';

function Cart() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const items = useSelector((state) => state.cart.items);
  const loading = useSelector((state) => state.cart.loading);
  const [selectedItems, setSelectedItems] = React.useState(new Set());
  const isEmpty = items.length === 0;
  const [showToast, setShowToast] = React.useState(false);
  const [toastMessage, setToastMessage] = React.useState('');
  const [toastBg, setToastBg] = React.useState('success');
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const showToastNotification = (message, bg = 'success') => {
    setToastMessage(message);
    setToastBg(bg);
    setShowToast(true);
  };

  // Initialize selected items: select all by default
  React.useEffect(() => {
    if (items.length > 0 && selectedItems.size === 0) {
      setSelectedItems(new Set(items.map((item) => item._id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // Calculate totals only for selected items
  const selectedItemsArray = items.filter((item) => selectedItems.has(item._id));
  const totalQuantity = selectedItemsArray.reduce((t, i) => t + i.quantity, 0);
  const totalAmount = selectedItemsArray.reduce((t, i) => t + i.quantity * i.price, 0);

  // Load cart khi component mount
  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const handleCheckout = () => {
    if (selectedItems.size === 0) {
      showToastNotification('Vui lòng chọn ít nhất một sản phẩm để thanh toán', 'warning');
      return;
    }
    // Pass selected items to checkout via navigation state
    navigate('/checkout', { state: { selectedItems: Array.from(selectedItems) } });
  };

  const handleClearCart = () => {
    if (selectedItems.size === 0) {
      showToastNotification('Không có sản phẩm nào được chọn', 'warning');
      return;
    }
    setShowDeleteModal(true);
  };

  const confirmClearCart = async () => {
    const itemsToDelete = selectedItems.size;
    try {
      // Remove only selected items
      const removePromises = Array.from(selectedItems).map((itemId) => dispatch(removeFromCart(itemId)).unwrap());
      await Promise.all(removePromises);
      setSelectedItems(new Set());
      setShowDeleteModal(false);
      showToastNotification(`Đã xóa ${itemsToDelete} sản phẩm khỏi giỏ hàng`, 'success');
    } catch (error) {
      setShowDeleteModal(false);
      showToastNotification(t('common.error') || 'Có lỗi xảy ra khi xóa sản phẩm', 'danger');
    }
  };

  const handleToggleSelect = (itemId) => {
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === items.length) {
      // Deselect all
      setSelectedItems(new Set());
    } else {
      // Select all
      setSelectedItems(new Set(items.map((item) => item._id)));
    }
  };

  const handleRemoveItem = (itemId) => {
    // Also remove from selected items if it's selected
    setSelectedItems((prev) => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
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
                <h4 className="mb-3">{t('cart.loading')}</h4>
                <p className="text-muted mb-0">{t('cart.waitMsg')}</p>
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
                <h4 className="mb-3">{t('cart.empty')}</h4>
                <p className="text-muted mb-4">{t('cart.emptyMsg')}</p>
                <Button variant="primary" size="lg" onClick={handleContinueShopping} className="px-4">
                  <FiArrowLeft className="me-2" />
                  {t('cart.continueShopping')}
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
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="mb-0">
                  <FiShoppingCart className="me-2" />
                  {t('cart.yourCart')}
                </h2>
                <p className="text-muted mb-0">
                  {items.length} {t('cart.itemsInCart')} ({selectedItems.size} đã chọn)
                </p>
              </div>
              <Button variant="outline-primary" size="sm" onClick={handleSelectAll}>
                {selectedItems.size === items.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </Button>
            </div>
          </div>

          <div className="cart-items">
            {items.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                isSelected={selectedItems.has(item._id)}
                onToggleSelect={() => handleToggleSelect(item._id)}
                onRemove={() => handleRemoveItem(item._id)}
              />
            ))}
          </div>

          <div className="cart-actions mt-4">
            <Button variant="outline-secondary" onClick={handleContinueShopping} className="me-2">
              <FiArrowLeft className="me-2" />
              {t('cart.continueShopping')}
            </Button>
            <Button variant="outline-danger" onClick={handleClearCart}>
              {t('cart.deleteAll')}
            </Button>
          </div>
        </Col>

        <Col lg={4}>
          <Card className="cart-summary sticky-top">
            <Card.Header>
              <h5 className="mb-0">{t('cart.summary')}</h5>
            </Card.Header>
            <Card.Body>
              <div className="summary-row">
                <span>
                  {t('cart.subtotal')} ({totalQuantity} {t('cart.items')}):
                </span>
                <span className="fw-bold">{formatPrice(totalAmount)}</span>
              </div>
              <div className="summary-row">
                <span>{t('cart.shipping')}:</span>
                <span className="text-success">{t('cart.freeShipping')}</span>
              </div>
              <hr />
              <div className="summary-row total-row">
                <span className="fs-5 fw-bold">{t('cart.totalPrice')}:</span>
                <span className="fs-5 fw-bold text-danger">{formatPrice(totalAmount)}</span>
              </div>

              <Alert variant="info" className="mt-3">
                <small>
                  <strong>{t('cart.offers')}:</strong> {t('cart.shippingOffer')}
                </small>
              </Alert>

              <Button
                variant="primary"
                size="lg"
                className="w-100 mt-3 checkout-btn"
                onClick={handleCheckout}
                disabled={selectedItems.size === 0}
              >
                <FiCreditCard className="me-2" />
                {t('cart.payment')} ({selectedItems.size})
              </Button>

              <div className="text-center mt-3">
                <small className="text-muted">{t('cart.paymentMethods')}</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3">
        <Toast bg={toastBg} onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Header>
            <strong className="me-auto">Thông báo</strong>
          </Toast.Header>
          <Toast.Body className={toastBg === 'danger' ? 'text-white' : ''}>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc muốn xóa {selectedItems.size} sản phẩm đã chọn?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmClearCart}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default Cart;
