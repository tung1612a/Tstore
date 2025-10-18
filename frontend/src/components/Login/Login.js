import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Send credentials to backend. The backend accepts either `email` or `username`.
    axios.post('/api/auth/login', {
      email: form.username, // if your frontend uses username as email field, send as email
      username: form.username,
      password: form.password,
    })
      .then(res => {
        setLoading(false);
        const { token, user } = res.data;
        // Save token and user to localStorage for later use
        if (token) localStorage.setItem('token', token);
        if (user) localStorage.setItem('user', JSON.stringify(user));
        alert('Đăng nhập thành công!');
        // Redirect to home page after successful login
        window.location.href = '/';
      })
      .catch(err => {
        setLoading(false);
        const msg = err?.response?.data?.message || 'Tên đăng nhập hoặc mật khẩu không đúng!';
        setError(msg);
      });
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Row className="w-100">
        <Col md={{ span: 4, offset: 4 }}>
          <Card className="shadow-lg border-0 rounded-4">
            <Card.Body className="p-4">
              <h3 className="text-center mb-4 fw-bold">Đăng nhập</h3>

              {error && <Alert variant="danger">{error}</Alert>}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="formUsername">
                  <Form.Label>Tên đăng nhập</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên đăng nhập"
                    name="username"
                    value={form.username}
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

                <Row className="g-2">
                  <Col xs={12}>
                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner animation="border" size="sm" className="me-2" /> Đang đăng nhập...
                        </>
                      ) : (
                        "Đăng nhập"
                      )}
                    </Button>
                  </Col>

                  <Col xs={12}>
                    <Button
                      variant="outline-primary"
                      type="button"
                      className="w-100"
                      onClick={handleRegister} 
                    >
                      Đăng ký
                    </Button>
                  </Col>
                </Row>
              </Form>

              <div className="text-center mt-3 text-muted" style={{ fontSize: "0.9rem" }}>
                Quên mật khẩu? <a href="/forgetPass">Khôi phục tại đây</a>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;