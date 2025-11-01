import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function ChangePassword() {
	const navigate = useNavigate();
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
			setError('Mật khẩu mới và xác nhận không khớp');
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

			setSuccess('Đổi mật khẩu thành công');
			setTimeout(() => navigate('/profile'), 1200);
		} catch (err) {
			setError(err.message || 'Lỗi khi đổi mật khẩu');
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
							<h3 className="text-center mb-4 fw-bold">Đổi mật khẩu</h3>

							{error && <Alert variant="danger">{error}</Alert>}
							{success && <Alert variant="success">{success}</Alert>}

							<Form onSubmit={handleSubmit}>
								<Form.Group className="mb-3" controlId="formOldPassword">
									<Form.Label>Mật khẩu cũ</Form.Label>
									<Form.Control
										type="password"
										placeholder="Nhập mật khẩu cũ"
										name="oldPassword"
										value={form.oldPassword}
										onChange={handleChange}
										required
									/>
								</Form.Group>

								<Form.Group className="mb-3" controlId="formNewPassword">
									<Form.Label>Mật khẩu mới</Form.Label>
									<Form.Control
										type="password"
										placeholder="Nhập mật khẩu mới"
										name="newPassword"
										value={form.newPassword}
										onChange={handleChange}
										required
									/>
								</Form.Group>

								<Form.Group className="mb-3" controlId="formConfirmPassword">
									<Form.Label>Xác nhận mật khẩu mới</Form.Label>
									<Form.Control
										type="password"
										placeholder="Xác nhận mật khẩu mới"
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
												<Spinner animation="border" size="sm" className="me-2" /> Đang xử lý...
											</>
										) : (
											'Đổi mật khẩu'
										)}
									</Button>
									<Button
										variant="secondary"
										type="button"
										className="mt-3"
										onClick={() => navigate('/profile')}
										disabled={loading}
									>
										Hủy
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

