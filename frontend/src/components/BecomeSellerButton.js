import React, { useState, useEffect } from 'react';
import { Button, Modal, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const BecomeSellerButton = ({ compact = false }) => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    businessName: '',
    businessDescription: '',
    taxCode: '',
    cccd: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Kiểm tra trạng thái đơn đăng ký khi component mount
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'seller') {
      checkApplicationStatus();
    }
  }, [isAuthenticated, user]);

  const checkApplicationStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/my-seller-application', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplicationStatus(data);
      }
    } catch (error) {
      // Không có đơn đăng ký hoặc lỗi
      setApplicationStatus(null);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBecomeSellerClick = () => {
    // Nếu chưa đăng nhập, redirect đến trang login
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    // Nếu đã đăng nhập, mở modal đăng ký seller
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!formData.phone.trim()) {
      setMessage('Vui lòng nhập số điện thoại');
      setLoading(false);
      return;
    }

    if (!formData.businessName.trim()) {
      setMessage('Vui lòng nhập tên cửa hàng');
      setLoading(false);
      return;
    }

    if (!formData.taxCode.trim()) {
      setMessage('Vui lòng nhập mã số thuế');
      setLoading(false);
      return;
    }

    if (!formData.cccd.trim()) {
      setMessage('Vui lòng nhập số CCCD');
      setLoading(false);
      return;
    }

    // Validation cho mã số thuế (10-13 số)
    if (!/^\d{10,13}$/.test(formData.taxCode.trim())) {
      setMessage('Mã số thuế phải có từ 10-13 chữ số');
      setLoading(false);
      return;
    }

    // Validation cho CCCD (12 số)
    if (!/^\d{12}$/.test(formData.cccd.trim())) {
      setMessage('Số CCCD phải có đúng 12 chữ số');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/become-seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          phone: formData.phone,
          businessName: formData.businessName,
          businessDescription: formData.businessDescription,
          taxCode: formData.taxCode,
          cccd: formData.cccd
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Đơn đăng ký seller đã được gửi thành công! Vui lòng chờ admin duyệt.');
        setFormData({
          phone: '',
          businessName: '',
          businessDescription: '',
          taxCode: '',
          cccd: ''
        });
        setTimeout(() => {
          setShowModal(false);
          setMessage('');
          checkApplicationStatus(); // Kiểm tra lại trạng thái
        }, 2000);
      } else {
        setMessage(data.message || 'Có lỗi xảy ra khi đăng ký seller');
      }
    } catch (error) {
      setMessage('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Nếu user đã đăng nhập và là seller, không hiển thị nút
  if (isAuthenticated && user?.role === 'seller') {
    return null;
  }

  // Nếu có đơn đăng ký pending, hiển thị trạng thái
  if (applicationStatus?.status === 'pending') {
    return (
      <Button 
        variant="warning" 
        size={compact ? "sm" : "lg"}
        className={compact ? "" : "mb-3"}
        disabled
        style={{
          background: 'linear-gradient(45deg, #ffc107, #ff8c00)',
          border: 'none',
          borderRadius: compact ? '20px' : '25px',
          padding: compact ? '8px 16px' : '12px 30px',
          fontWeight: 'bold',
          fontSize: compact ? '14px' : '16px',
          boxShadow: '0 2px 8px rgba(255, 193, 7, 0.3)',
          whiteSpace: 'nowrap',
          minWidth: compact ? '40px' : 'auto'
        }}
      >
        {compact ? '⏳ Pending' : '⏳ Đang chờ duyệt'}
      </Button>
    );
  }

  // Nếu đơn đăng ký bị từ chối, cho phép đăng ký lại
  if (applicationStatus?.status === 'rejected') {
    return (
      <Button 
        variant="danger" 
        size={compact ? "sm" : "lg"}
        className={compact ? "" : "mb-3"}
        onClick={() => setShowModal(true)}
        style={{
          background: 'linear-gradient(45deg, #dc3545, #c82333)',
          border: 'none',
          borderRadius: compact ? '20px' : '25px',
          padding: compact ? '8px 16px' : '12px 30px',
          fontWeight: 'bold',
          fontSize: compact ? '14px' : '16px',
          boxShadow: '0 2px 8px rgba(220, 53, 69, 0.3)',
          whiteSpace: 'nowrap',
          minWidth: compact ? '40px' : 'auto'
        }}
      >
        {compact ? '❌ Rejected' : '❌ Đăng ký lại'}
      </Button>
    );
  }

  const buttonStyle = compact ? {
    background: 'linear-gradient(45deg, #28a745, #20c997)',
    border: 'none',
    borderRadius: '20px',
    padding: '8px 16px',
    fontWeight: 'bold',
    fontSize: '14px',
    boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    minWidth: '40px'
  } : {
    background: 'linear-gradient(45deg, #28a745, #20c997)',
    border: 'none',
    borderRadius: '25px',
    padding: '12px 30px',
    fontWeight: 'bold',
    boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)',
    transition: 'all 0.3s ease'
  };

  return (
    <>
      <Button 
        variant="success" 
        size={compact ? "sm" : "lg"}
        className={compact ? "" : "mb-3"}
        onClick={handleBecomeSellerClick}
        style={buttonStyle}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-2px)';
          e.target.style.boxShadow = compact 
            ? '0 4px 12px rgba(40, 167, 69, 0.4)' 
            : '0 6px 20px rgba(40, 167, 69, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = compact 
            ? '0 2px 8px rgba(40, 167, 69, 0.3)' 
            : '0 4px 15px rgba(40, 167, 69, 0.3)';
        }}
      >
        {compact ? (
          <>
            <span className="d-none d-sm-inline">🛍️ Seller</span>
            <span className="d-sm-none">🛍️</span>
          </>
        ) : '🛍️ Trở thành Seller'}
      </Button>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>🛍️ Đăng ký tài khoản Seller</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {applicationStatus?.status === 'rejected' && (
            <Alert variant="danger" className="mb-4">
              <h6>❌ Đơn đăng ký trước đó bị từ chối</h6>
              <p><strong>Lý do từ chối:</strong> {applicationStatus.rejectionReason}</p>
              <p><strong>Ngày từ chối:</strong> {new Date(applicationStatus.reviewedAt).toLocaleDateString('vi-VN')}</p>
              <p className="mb-0">Bạn có thể đăng ký lại với thông tin mới.</p>
            </Alert>
          )}

          <div className="mb-4 p-3" style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            borderRadius: '10px',
            color: 'white'
          }}>
            <h5 className="mb-2">✨ Lợi ích khi trở thành Seller:</h5>
            <ul className="mb-0" style={{ fontSize: '14px' }}>
              <li>Quản lý sản phẩm và đơn hàng dễ dàng</li>
              <li>Dashboard thống kê chi tiết</li>
              <li>Hỗ trợ khách hàng 24/7</li>
              <li>Phí hoa hồng cạnh tranh</li>
            </ul>
          </div>

          {message && (
            <Alert variant={message.includes('thành công') ? 'success' : 'danger'}>
              {message}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <div className="mb-3 p-2" style={{
              background: '#f8f9fa',
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <small className="text-muted">
                <strong>Thông tin tài khoản:</strong><br/>
                Họ tên: {user?.fullName}<br/>
                Email: {user?.email}
              </small>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Số điện thoại *</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                placeholder="Nhập số điện thoại liên hệ"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Tên cửa hàng *</Form.Label>
              <Form.Control
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                required
                placeholder="Nhập tên cửa hàng của bạn"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả cửa hàng</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="businessDescription"
                value={formData.businessDescription}
                onChange={handleInputChange}
                placeholder="Mô tả ngắn về cửa hàng của bạn (tùy chọn)"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Mã số thuế *</Form.Label>
              <Form.Control
                type="text"
                name="taxCode"
                value={formData.taxCode}
                onChange={handleInputChange}
                required
                placeholder="Nhập mã số thuế (10-13 chữ số)"
                maxLength="13"
              />
              <Form.Text className="text-muted">
                Mã số thuế phải có từ 10-13 chữ số
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Số CCCD *</Form.Label>
              <Form.Control
                type="text"
                name="cccd"
                value={formData.cccd}
                onChange={handleInputChange}
                required
                placeholder="Nhập số CCCD (12 chữ số)"
                maxLength="12"
              />
              <Form.Text className="text-muted">
                Số CCCD phải có đúng 12 chữ số
              </Form.Text>
            </Form.Group>

            <div className="d-grid gap-2">
              <Button 
                type="submit" 
                variant="success" 
                disabled={loading}
                size="lg"
              >
                {loading ? 'Đang đăng ký...' : 'Trở thành Seller'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default BecomeSellerButton;
