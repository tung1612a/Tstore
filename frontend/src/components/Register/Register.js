import React, { useState } from 'react';
import axios from 'axios';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
              {success && <Alert variant="success">{t('register.successMsg')}</Alert>}

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
