import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Spinner, Alert } from "react-bootstrap";
import { FiBarChart, FiDollarSign, FiShoppingCart, FiUsers } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
// import { getAllSellerReports } from "../../../../backend/controllers/adminController";
// router.get("/admin/seller-reports", protect, getAllSellerReports);

const ReportAdmin = () => {
    const { token } = useAuth();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/admin/seller-reports", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setReports(data);
            } catch (err) {
                console.error("Fetch reports error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [token]);

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Đang tải báo cáo...</p>
            </Container>
        );
    }

    if (!reports.length) {
        return (
            <Container className="py-5">
                <Alert variant="info">
                    <FiUsers className="me-2" />
                    Chưa có dữ liệu doanh số nào.
                </Alert>
            </Container>
        );
    }

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

    return (
        <Container className="py-4">
            <Row className="mb-4">
                <Col>
                    <h3 className="fw-bold d-flex align-items-center text-primary">
                        <FiBarChart className="me-2" /> Báo cáo & Thống kê doanh số người bán
                    </h3>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <Card className="shadow-sm mb-4">
                        <Card.Header className="bg-primary text-white fw-semibold">
                            Bảng doanh thu từng người bán
                        </Card.Header>
                        <Card.Body>
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr className="text-center align-middle">
                                        <th>#</th>
                                        <th>Tên người bán</th>
                                        <th>Email</th>
                                        <th>Tổng đơn hàng</th>
                                        <th>Doanh thu</th>
                                        <th>Giá trị TB/đơn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reports.map((r, index) => (
                                        <tr key={r.sellerId} className="text-center align-middle">
                                            <td>{index + 1}</td>
                                            <td>{r.sellerName}</td>
                                            <td>{r.email}</td>
                                            <td>
                                                <FiShoppingCart className="text-primary me-1" />
                                                {r.totalOrders}
                                            </td>
                                            <td>
                                                <FiDollarSign className="text-success me-1" />
                                                {formatCurrency(r.totalRevenue)}
                                            </td>
                                            <td>{formatCurrency(r.avgOrderValue)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                <Col md={12}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-success text-white fw-semibold">
                            Biểu đồ doanh thu theo người bán
                        </Card.Header>
                        <Card.Body style={{ height: 400 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={reports} margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="sellerName" />
                                    <YAxis />
                                    <Tooltip formatter={(v) => formatCurrency(v)} />
                                    <Legend />
                                    <Bar dataKey="totalRevenue" name="Doanh thu" fill="#0d6efd" />
                                    <Bar dataKey="avgOrderValue" name="Giá trị TB/đơn" fill="#198754" />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ReportAdmin;
