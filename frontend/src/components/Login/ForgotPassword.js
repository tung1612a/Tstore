import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email.includes('@')) { 
      setError('Vui lòng nhập email hợp lệ!');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Lỗi không xác định");
      }

      setSuccess(true);

      // Sau 2s chuyển hướng về login
      setTimeout(() => navigate('/login'), 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Row className="w-100">
        <Col md={{ span: 4, offset: 4 }}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4 fw-bold">Quên mật khẩu</h3>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">Email khôi phục đã được xác nhận! Vui lòng kiểm tra hộp thư.</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Nhập email của bạn</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Email đã đăng ký"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" /> Đang kiểm tra...
                      </>
                    ) : (
                      'Gửi yêu cầu'
                    )}
                  </Button>
                </div>
              </Form>

              <div className="text-center mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
                <Button variant="link" className="p-0" onClick={() => navigate('/login')}>
                  ← Quay lại đăng nhập
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default ForgotPassword;
