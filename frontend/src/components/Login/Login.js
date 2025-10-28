import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert, Toast, ToastContainer } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

function Login() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ username: "", password: "" });
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVariant, setToastVariant] = useState("success");

  useEffect(() => {
    if (location.state?.logoutSuccess) {
      setToastMessage("Đăng xuất thành công");
      setToastVariant("success");
      setShowToast(true);
    } else if (location.state?.registerSuccess) {
      setToastMessage("Đăng ký thành công! Hãy đăng nhập để tiếp tục");
      setToastVariant("success");
      setShowToast(true);
    } else if (location.state?.loginRequired) {
      setToastMessage("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!");
      setToastVariant("warning");
      setShowToast(true);
    }

    if (location.state) {
      const timer = setTimeout(() => {
        window.history.replaceState({}, document.title);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [location]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(form.username, form.password);

      if (result.success) {
        // Giả sử role nằm trong result.user.role
        const userRole = result.user?.role;

        if (userRole === "devadmin") {
          navigate("/admin/dashboard", { state: { loginSuccess: true } });
        } else {
          navigate("/", { state: { loginSuccess: true } });
        }
      } else {
        setError(result.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      console.error(err);
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <>
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
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toastVariant}
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={2000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Thông báo</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default Login;