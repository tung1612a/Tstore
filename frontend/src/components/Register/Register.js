import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';

function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { showSuccess, showError } = useToast();
  const [form, setForm] = useState({
    fullname: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showOTPForm, setShowOTPForm] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifyingOTP, setVerifyingOTP] = useState(false);
  const [resendingOTP, setResendingOTP] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const countdownIntervalRef = useRef(null);

  // Hàm bắt đầu đếm ngược
  const startCountdown = () => {
    setCountdown(60);
    
    // Xóa interval cũ nếu có
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }
    
    // Tạo interval mới
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Cleanup interval khi component unmount
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.length !== 6) {
      setError('Vui lòng nhập mã xác nhận 6 số');
      return;
    }

    setVerifyingOTP(true);

    try {
      const res = await axios.post('/api/auth/verify-otp', {
        email: registeredEmail,
        code: otpCode
      });

      setVerifyingOTP(false);
      showSuccess(res.data.message || 'Xác nhận email thành công!');
      setTimeout(() => {
        navigate('/login', { state: { emailVerified: true } });
      }, 1500);
    } catch (err) {
      setVerifyingOTP(false);
      const msg = err?.response?.data?.message || 'Mã xác nhận không đúng';
      setError(msg);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return; // Không cho phép gửi lại nếu đang đếm ngược
    
    setResendingOTP(true);
    setError('');

    try {
      const res = await axios.post('/api/auth/resend-verification-email', {
        email: registeredEmail
      });
      showSuccess(res.data.message || 'Mã xác nhận đã được gửi lại!');
      setOtpCode(''); // Xóa mã cũ
      startCountdown(); // Bắt đầu đếm ngược 60 giây
    } catch (err) {
      const msg = err?.response?.data?.message || 'Không thể gửi lại mã';
      setError(msg);
    } finally {
      setResendingOTP(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate password
    if (form.password !== form.confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    setLoading(true);

    // Call backend register endpoint
    axios.post('/api/auth/register', {
      fullName: form.fullname,
      email: form.email,
      password: form.password,
      phone: form.phone,
      role: "customer",   // mặc định
      active: false,       // Chưa active cho đến khi xác nhận email
      avatarURL: ""       // để rỗng nếu chưa upload avatar
    })
      .then(res => {
        setLoading(false);
        setSuccess(true);
        setEmailSent(res.data.emailSent || false);
        setRegisteredEmail(form.email);
        setShowOTPForm(true); // Hiển thị form nhập mã OTP
        if (res.data.emailSent) {
          startCountdown(); // Bắt đầu đếm ngược 60 giây sau khi gửi mã lần đầu
        }
      })
      .catch(err => {
        setLoading(false);
        const msg = err?.response?.data?.message || t('register.failed');
        setError(msg);
      });
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4 fw-bold">{t('register.titleFull')}</h3>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && !showOTPForm && (
                <Alert variant="success">
                  <Alert.Heading>Đăng ký thành công!</Alert.Heading>
                  {emailSent ? (
                    <p>Chúng tôi đã gửi mã xác nhận đến <strong>{registeredEmail}</strong>. Vui lòng kiểm tra email.</p>
                  ) : (
                    <p>Vui lòng liên hệ quản trị viên để kích hoạt tài khoản của bạn.</p>
                  )}
                </Alert>
              )}

              {showOTPForm && emailSent && (
                <Alert variant="info" className="mb-4">
                  <Alert.Heading>Nhập mã xác nhận</Alert.Heading>
                  <p>Chúng tôi đã gửi mã xác nhận 6 số đến <strong>{registeredEmail}</strong>.</p>
                  <p className="mb-0">Vui lòng nhập mã xác nhận bên dưới để hoàn tất đăng ký.</p>
                </Alert>
              )}

              {!showOTPForm ? (
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="formFullname">
                    <Form.Label>{t('register.fullName')}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t('register.fullName')}
                      name="fullname"
                      value={form.fullname}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>{t('register.email')}</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder={t('register.email')}
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPhone">
                    <Form.Label>{t('register.phone')}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t('register.phone')}
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formPassword">
                    <Form.Label>{t('register.password')}</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder={t('register.password')}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="formConfirmPassword">
                    <Form.Label>{t('register.confirmPassword')}</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder={t('register.confirmPassword')}
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <div className="d-grid">
                    <Button variant="success" type="submit" disabled={loading}>
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" /> {t('register.processing')}
                        </>
                      ) : (
                        t('register.title')
                      )}
                    </Button>
                  </div>
                </Form>
              ) : (
                <Form onSubmit={handleVerifyOTP}>
                  <Form.Group className="mb-3" controlId="formOTP">
                    <Form.Label>Mã xác nhận (6 số)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập mã xác nhận"
                      value={otpCode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtpCode(value);
                        setError('');
                      }}
                      maxLength={6}
                      required
                      style={{ 
                        fontSize: '24px', 
                        textAlign: 'center', 
                        letterSpacing: '8px',
                        fontWeight: 'bold'
                      }}
                    />
                    <Form.Text className="text-muted">
                      Mã xác nhận đã được gửi đến email của bạn. Mã sẽ hết hạn sau 10 phút.
                    </Form.Text>
                  </Form.Group>

                  <div className="d-grid gap-2">
                    <Button variant="success" type="submit" disabled={verifyingOTP || otpCode.length !== 6}>
                      {verifyingOTP ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" /> Đang xác nhận...
                        </>
                      ) : (
                        'Xác nhận'
                      )}
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      type="button"
                      onClick={handleResendOTP}
                      disabled={resendingOTP || countdown > 0}
                    >
                      {resendingOTP ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" /> Đang gửi...
                        </>
                      ) : countdown > 0 ? (
                        `Gửi lại mã (${countdown}s)`
                      ) : (
                        'Gửi lại mã'
                      )}
                    </Button>
                  </div>
                </Form>
              )}

              <div className="text-center mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
                {t('register.hasAccount')}{' '}
                <Button variant="link" className="p-0" onClick={() => navigate('/login')}>
                  {t('register.login')}
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;
