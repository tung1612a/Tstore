import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Register() {
  const navigate = useNavigate();
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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate password
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
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
      active: true,       // mặc định active
      avatarURL: ""       // để rỗng nếu chưa upload avatar
    })
      .then(res => {
        setLoading(false);
        setSuccess(true);
        setTimeout(() => navigate('/login', { state: { registerSuccess: true } }), 1500);
      })
      .catch(err => {
        setLoading(false);
        const msg = err?.response?.data?.message || 'Đăng ký thất bại';
        setError(msg);
      });
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Row className="w-100">
        <Col md={{ span: 6, offset: 3 }}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4 fw-bold">Đăng ký tài khoản</h3>

              {error && <Alert variant="danger">{error}</Alert>}
              {success && <Alert variant="success">Đăng ký thành công! Đang chuyển hướng...</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formFullname">
                  <Form.Label>Họ và tên</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập họ tên"
                    name="fullname"
                    value={form.fullname}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Nhập email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPhone">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập số điện thoại"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formPassword">
                  <Form.Label>Mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập mật khẩu"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="formConfirmPassword">
                  <Form.Label>Nhập lại mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Nhập lại mật khẩu"
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
                        <Spinner animation="border" size="sm" className="me-2" /> Đang xử lý...
                      </>
                    ) : (
                      "Đăng ký"
                    )}
                  </Button>
                </div>
              </Form>

              <div className="text-center mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
                Đã có tài khoản?{' '}
                <Button variant="link" className="p-0" onClick={() => navigate('/login')}>
                  Đăng nhập ngay
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
