import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function ChangePassword() {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');

	const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setSuccess('');

		if (form.newPassword !== form.confirmPassword) {
			setError(t('changepass.1'));
			return;
		}

		setLoading(true);
		try {
			const token = localStorage.getItem('token');
			const res = await fetch('/api/auth/change-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token ? `Bearer ${token}` : '',
				},
				body: JSON.stringify({
					oldPassword: form.oldPassword,
					newPassword: form.newPassword,
					confirmPassword: form.confirmPassword,
				}),
			});

			const text = await res.text();
			let data = {};
			try { data = text ? JSON.parse(text) : {}; } catch (e) { data = null; }

			if (!res.ok) {
				const msg = (data && data.message) ? data.message : (text || `Server returned ${res.status}`);
				throw new Error(msg);
			}

			setSuccess(t('changepass.2'));
			setTimeout(() => navigate('/profile'), 1200);
		} catch (err) {
			setError(err.message || t('changepass.3'));
		} finally {
			setLoading(false);
		}
	};

	return (
		<Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
			<Row className="w-100">
				<Col md={{ span: 4, offset: 4 }}>
					<Card className="shadow-lg border-0 rounded-4">
						<Card.Body className="p-4">
							<h3 className="text-center mb-4 fw-bold">{t('changepass.4')}</h3>

							{error && <Alert variant="danger">{error}</Alert>}
							{success && <Alert variant="success">{success}</Alert>}

							<Form onSubmit={handleSubmit}>
								<Form.Group className="mb-3" controlId="formOldPassword">
									<Form.Label>{t('changepass.5')}</Form.Label>
									<Form.Control
										type="password"
										placeholder={t('changepass.6')}
										name="oldPassword"
										value={form.oldPassword}
										onChange={handleChange}
										required
									/>
								</Form.Group>

								<Form.Group className="mb-3" controlId="formNewPassword">
									<Form.Label>{t('changepass.7')}</Form.Label>
									<Form.Control
										type="password"
										placeholder={t('changepass.8')}
										name="newPassword"
										value={form.newPassword}
										onChange={handleChange}
										required
									/>
								</Form.Group>

								<Form.Group className="mb-3" controlId="formConfirmPassword">
									<Form.Label>{t('changepass.9')}</Form.Label>
									<Form.Control
										type="password"
										placeholder={t('changepass.10')}
										name="confirmPassword"
										value={form.confirmPassword}
										onChange={handleChange}
										required
									/>
								</Form.Group>

								<div className="d-grid">
									<Button variant="primary" type="submit" disabled={loading}>
										{loading ? (
											<>
												<Spinner animation="border" size="sm" className="me-2" /> {t('changepass.11')}
											</>
										) : (
											t('changepass.14')
										)}
									</Button>
									<Button
										variant="secondary"
										type="button"
										className="mt-3"
										onClick={() => navigate('/profile')}
										disabled={loading}
									>
										{t('changepass.13')}
									</Button>
								</div>
							</Form>

						</Card.Body>
					</Card>
				</Col>
			</Row>
		</Container>
	);
}

export default ChangePassword;

