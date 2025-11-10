import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Alert, Button, Spinner } from 'react-bootstrap';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiMail } from 'react-icons/fi';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setLoading(false);
      setError('Token xác nhận không hợp lệ');
      return;
    }

    // Gọi API xác nhận email
    axios.get(`/api/auth/verify-email?token=${token}`)
      .then(res => {
        setLoading(false);
        setSuccess(true);
        setMessage(res.data.message);
        // Tự động chuyển đến trang login sau 3 giây
        setTimeout(() => {
          navigate('/login', { state: { emailVerified: true } });
        }, 3000);
      })
      .catch(err => {
        setLoading(false);
        setSuccess(false);
        const msg = err?.response?.data?.message || 'Không thể xác nhận email. Vui lòng thử lại.';
        setError(msg);
      });
  }, [searchParams, navigate]);

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-5 text-center">
              {loading && (
                <>
                  <Spinner animation="border" variant="primary" className="mb-3" size="lg" />
                  <h4>Đang xác nhận email...</h4>
                  <p className="text-muted">Vui lòng đợi trong giây lát</p>
                </>
              )}

              {success && !loading && (
                <>
                  <FiCheckCircle size={64} className="text-success mb-3" />
                  <h3 className="text-success mb-3">Xác nhận email thành công!</h3>
                  <p className="text-muted mb-4">{message}</p>
                  <Alert variant="info">
                    Bạn sẽ được chuyển đến trang đăng nhập trong vài giây...
                  </Alert>
                  <Button variant="primary" onClick={() => navigate('/login')}>
                    Đăng nhập ngay
                  </Button>
                </>
              )}

              {error && !loading && (
                <>
                  <FiXCircle size={64} className="text-danger mb-3" />
                  <h3 className="text-danger mb-3">Xác nhận email thất bại</h3>
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                  <div className="d-flex flex-column gap-2">
                    <Button variant="primary" onClick={() => navigate('/login')}>
                      Đi đến trang đăng nhập
                    </Button>
                    <Button variant="outline-secondary" onClick={() => navigate('/register')}>
                      Đăng ký lại
                    </Button>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default VerifyEmail;

