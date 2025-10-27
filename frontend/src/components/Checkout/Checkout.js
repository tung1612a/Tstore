import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCart, clearCart } from '../../store/cartSlice';
import { FiMapPin, FiCreditCard, FiTruck, FiCheck, FiPlus, FiEdit3, FiTrash2 } from 'react-icons/fi';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart.items);
  const totalAmount = items.reduce((t, i) => t + i.quantity * i.price, 0);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    country: 'Vietnam',
    isDefault: false,
  });
  const [currentStep, setCurrentStep] = useState(1);

  // Lấy danh sách địa chỉ
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/address', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data);
        // Tự động chọn địa chỉ mặc định
        const defaultAddress = data.find((addr) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddress),
      });

      if (response.ok) {
        const address = await response.json();
        setAddresses([...addresses, address]);
        setSelectedAddress(address._id);
        setShowAddressForm(false);
        setNewAddress({
          fullName: '',
          phone: '',
          street: '',
          city: '',
          state: '',
          country: 'Vietnam',
          isDefault: false,
        });
      }
    } catch (error) {
      console.error('Error creating address:', error);
    }
  };

  const handleCheckout = async () => {
    if (!selectedAddress) {
      alert('Vui lòng chọn địa chỉ giao hàng');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      // Tạo đơn hàng
      const orderData = {
        items: items.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
        })),
        addressId: selectedAddress,
        storeId: items[0]?.storeId || 'default',
        notes,
        paymentMethod,
      };

      const orderResponse = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (orderResponse.ok) {
        const order = await orderResponse.json();

        // Chỉ tạo payment cho các phương thức khác COD
        if (paymentMethod !== 'cod') {
          const paymentData = {
            orderId: order._id,
            method: paymentMethod,
          };

          const paymentResponse = await fetch('http://localhost:5000/api/payments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(paymentData),
          });

          if (paymentResponse.ok) {
            const payment = await paymentResponse.json();

            // Xử lý thanh toán
            const processResponse = await fetch(`http://localhost:5000/api/payments/${payment._id}/process`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                status: 'paid',
                transactionId: `TXN_${Date.now()}`,
              }),
            });

            if (processResponse.ok) {
              try {
                await dispatch(clearCart()).unwrap();
              } catch (error) {
                console.error('Error clearing cart:', error);
              }
              navigate('/');
            }
          }
        } else {
          // Đối với COD, chỉ cần clear cart và chuyển hướng
          try {
            await dispatch(clearCart()).unwrap();
          } catch (error) {
            console.error('Error clearing cart:', error);
          }
          navigate('/');
        }
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Có lỗi xảy ra khi thanh toán');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <div className="empty-cart-icon">
          <FiTruck size={80} />
        </div>
        <h2>Giỏ hàng trống</h2>
        <p>Bạn chưa có sản phẩm nào trong giỏ hàng</p>
        <button onClick={() => navigate('/')} className="btn-primary">
          Tiếp tục mua sắm
        </button>
      </div>
    );
  }

  const steps = [
    { id: 1, title: 'Địa chỉ giao hàng', icon: <FiMapPin /> },
    { id: 2, title: 'Phương thức thanh toán', icon: <FiCreditCard /> },
    { id: 3, title: 'Xác nhận đơn hàng', icon: <FiCheck /> },
  ];

  return (
    <div className="checkout">
      <div className="checkout-container">
        {/* Header */}
        <div className="checkout-header">
          <h1>Thanh toán</h1>
          <div className="checkout-steps">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`step ${currentStep >= step.id ? 'active' : ''} ${currentStep === step.id ? 'current' : ''}`}
              >
                <div className="step-icon">{step.icon}</div>
                <span>{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="checkout-content">
          <div className="checkout-main">
            {/* Step 1: Địa chỉ giao hàng */}
            {currentStep === 1 && (
              <div className="checkout-section">
                <div className="section-header">
                  <h2>
                    <FiMapPin className="section-icon" />
                    Địa chỉ giao hàng
                  </h2>
                  <button className="btn-add-address" onClick={() => setShowAddressForm(!showAddressForm)}>
                    <FiPlus size={16} />
                    Thêm địa chỉ mới
                  </button>
                </div>

                {addresses.length > 0 ? (
                  <div className="address-grid">
                    {addresses.map((address) => (
                      <div
                        key={address._id}
                        className={`address-card ${selectedAddress === address._id ? 'selected' : ''}`}
                        onClick={() => setSelectedAddress(address._id)}
                      >
                        <div className="address-header">
                          <h4>{address.fullName}</h4>
                          {address.isDefault && <span className="default-badge">Mặc định</span>}
                        </div>
                        <div className="address-details">
                          <p>
                            <strong>SĐT:</strong> {address.phone}
                          </p>
                          <p>{address.street}</p>
                          <p>
                            {address.city}, {address.state}, {address.country}
                          </p>
                        </div>
                        <div className="address-actions">
                          <button className="btn-edit">
                            <FiEdit3 size={14} />
                          </button>
                          <button className="btn-delete">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-address">
                    <p>Chưa có địa chỉ nào</p>
                  </div>
                )}

                {showAddressForm && (
                  <div className="address-form-container">
                    <form onSubmit={handleAddressSubmit} className="address-form">
                      <h3>Thêm địa chỉ mới</h3>
                      <div className="form-row">
                        <input
                          type="text"
                          placeholder="Họ và tên *"
                          value={newAddress.fullName}
                          onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                          required
                        />
                        <input
                          type="tel"
                          placeholder="Số điện thoại *"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          required
                        />
                      </div>
                      <input
                        className="form-row"
                        type="text"
                        placeholder="Địa chỉ cụ thể *"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        required
                      />
                      <div className="form-row">
                        <input
                          type="text"
                          placeholder="Thành phố *"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                          required
                        />
                        <input
                          type="text"
                          placeholder="Tỉnh/Thành phố *"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                          required
                        />
                      </div>
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={newAddress.isDefault}
                          onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                        />
                        <span>Đặt làm địa chỉ mặc định</span>
                      </label>
                      <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={() => setShowAddressForm(false)}>
                          Hủy
                        </button>
                        <button type="submit" className="btn-primary">
                          Thêm địa chỉ
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="step-actions">
                  <button className="btn-primary" onClick={() => setCurrentStep(2)} disabled={!selectedAddress}>
                    Tiếp tục
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Phương thức thanh toán */}
            {currentStep === 2 && (
              <div className="checkout-section">
                <div className="section-header">
                  <h2>
                    <FiCreditCard className="section-icon" />
                    Phương thức thanh toán
                  </h2>
                </div>

                <div className="payment-methods">
                  <div className="payment-method">
                    <input
                      type="radio"
                      id="cod"
                      name="paymentMethod"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="cod" className="payment-option">
                      <div className="payment-icon">💰</div>
                      <div className="payment-info">
                        <h4>Thanh toán khi nhận hàng (COD)</h4>
                        <p>Thanh toán bằng tiền mặt khi nhận hàng</p>
                      </div>
                    </label>
                  </div>

                  <div className="payment-method">
                    <input
                      type="radio"
                      id="bank_transfer"
                      name="paymentMethod"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="bank_transfer" className="payment-option">
                      <div className="payment-icon">🏦</div>
                      <div className="payment-info">
                        <h4>Chuyển khoản ngân hàng</h4>
                        <p>Chuyển khoản qua ngân hàng</p>
                      </div>
                    </label>
                  </div>

                  <div className="payment-method">
                    <input
                      type="radio"
                      id="momo"
                      name="paymentMethod"
                      value="momo"
                      checked={paymentMethod === 'momo'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="momo" className="payment-option">
                      <div className="payment-icon">💜</div>
                      <div className="payment-info">
                        <h4>Ví MoMo</h4>
                        <p>Thanh toán qua ví điện tử MoMo</p>
                      </div>
                    </label>
                  </div>

                  <div className="payment-method">
                    <input
                      type="radio"
                      id="zalopay"
                      name="paymentMethod"
                      value="zalopay"
                      checked={paymentMethod === 'zalopay'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <label htmlFor="zalopay" className="payment-option">
                      <div className="payment-icon">💙</div>
                      <div className="payment-info">
                        <h4>ZaloPay</h4>
                        <p>Thanh toán qua ZaloPay</p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="notes-section">
                  <label htmlFor="notes">Ghi chú đơn hàng</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ghi chú cho người bán..."
                    rows="3"
                  />
                </div>

                <div className="step-actions">
                  <button className="btn-secondary" onClick={() => setCurrentStep(1)}>
                    Quay lại
                  </button>
                  <button className="btn-primary" onClick={() => setCurrentStep(3)}>
                    Tiếp tục
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Xác nhận đơn hàng */}
            {currentStep === 3 && (
              <div className="checkout-section">
                <div className="section-header">
                  <h2>
                    <FiCheck className="section-icon" />
                    Xác nhận đơn hàng
                  </h2>
                </div>

                <div className="order-summary">
                  <h3>Thông tin đơn hàng</h3>
                  <div className="summary-items">
                    {items.map((item) => (
                      <div key={item._id} className="summary-item">
                        <img src={item.image || item.imageURL || '/placeholder.jpg'} alt={item.title} />
                        <div className="item-details">
                          <h4>{item.title}</h4>
                          <p>Số lượng: {item.quantity}</p>
                          <p className="item-price">{item.price.toLocaleString()}đ</p>
                        </div>
                        <div className="item-total">{(item.price * item.quantity).toLocaleString()}đ</div>
                      </div>
                    ))}
                  </div>

                  <div className="summary-totals">
                    <div className="total-row">
                      <span>Tạm tính:</span>
                      <span>{totalAmount.toLocaleString()}đ</span>
                    </div>
                    <div className="total-row">
                      <span>Phí vận chuyển:</span>
                      <span className="free">Miễn phí</span>
                    </div>
                    <div className="total-row final">
                      <span>Tổng cộng:</span>
                      <span>{totalAmount.toLocaleString()}đ</span>
                    </div>
                  </div>
                </div>

                <div className="step-actions">
                  <button className="btn-secondary" onClick={() => setCurrentStep(2)}>
                    Quay lại
                  </button>
                  <button className="btn-primary btn-checkout" onClick={handleCheckout} disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Đặt hàng ngay'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="checkout-sidebar">
            <div className="sidebar-card">
              <h3>Tóm tắt đơn hàng</h3>
              <div className="sidebar-items">
                {items.map((item) => (
                  <div key={item._id} className="sidebar-item">
                    <img src={item.image || item.imageURL || '/placeholder.jpg'} alt={item.title} />
                    <div className="item-info">
                      <h5>{item.title}</h5>
                      <p>
                        {item.quantity} x {item.price.toLocaleString()}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="sidebar-total">
                <div className="total-row">
                  <span>Tạm tính:</span>
                  <span>{totalAmount.toLocaleString()}đ</span>
                </div>
                <div className="total-row">
                  <span>Phí vận chuyển:</span>
                  <span className="free">Miễn phí</span>
                </div>
                <div className="total-row final">
                  <span>Tổng cộng:</span>
                  <span>{totalAmount.toLocaleString()}đ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
