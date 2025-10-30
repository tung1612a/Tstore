import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Spinner, Alert, Badge, Button } from "react-bootstrap";
import { FiBarChart, FiDollarSign, FiShoppingCart, FiUsers, FiPackage, FiTrendingUp } from "react-icons/fi";
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";

const ReportAdmin = () => {
    const { token } = useAuth();
    const { t } = useTranslation();
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/admin/seller-reports", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!res.ok) {
                    throw new Error("Không thể tải báo cáo");
                }

                const data = await res.json();
                setReports(data);
                setError(null);
            } catch (err) {
                console.error("Fetch reports error:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, [token]);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);

    // Tính tổng thống kê
    const totalStats = reports.reduce((acc, report) => ({
        totalRevenue: acc.totalRevenue + report.totalRevenue,
        totalOrders: acc.totalOrders + report.totalOrders,
        totalSellers: acc.totalSellers + 1,
        totalProducts: acc.totalProducts + (report.totalProducts || 0)
    }), { totalRevenue: 0, totalOrders: 0, totalSellers: 0, totalProducts: 0 });

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">{t('common.loading')}</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <FiUsers className="me-2" />
                    {t('common.error')}: {error}
                </Alert>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <h2 className="fw-bold d-flex align-items-center text-primary">
                        <FiBarChart className="me-2" /> {t('reports.sellerReports')}
                    </h2>
                    <p className="text-muted">{t('reports.overview')}</p>
                </Col>
            </Row>

            <Row>
                <Col>
                    <Button variant="secondary" href="/admin/dashboard">
                        {t('common.back')}
                    </Button>
                </Col>
            </Row>

            {/* Summary Cards */}
            <Row className="mb-4">
                <Col md={3}>
                    <Card className="text-center shadow-sm border-0 h-100">
                        <Card.Body>
                            <FiDollarSign className="display-4 text-success mb-2" />
                            <h5 className="text-muted">{t('reports.totalRevenue')}</h5>
                            <h3 className="fw-bold text-success">{formatCurrency(totalStats.totalRevenue)}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm border-0 h-100">
                        <Card.Body>
                            <FiShoppingCart className="display-4 text-primary mb-2" />
                            <h5 className="text-muted">{t('reports.totalOrders')}</h5>
                            <h3 className="fw-bold text-primary">{totalStats.totalOrders}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm border-0 h-100">
                        <Card.Body>
                            <FiUsers className="display-4 text-info mb-2" />
                            <h5 className="text-muted">{t('reports.sellerCount')}</h5>
                            <h3 className="fw-bold text-info">{totalStats.totalSellers}</h3>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={3}>
                    <Card className="text-center shadow-sm border-0 h-100">
                        <Card.Body>
                            <FiPackage className="display-4 text-warning mb-2" />
                            <h5 className="text-muted">{t('reports.totalProducts')}</h5>
                            <h3 className="fw-bold text-warning">{totalStats.totalProducts}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {!reports.length ? (
                <Row>
                    <Col md={12}>
                        <Alert variant="info">
                            <FiUsers className="me-2" />
                            {t('reports.noData')}
                        </Alert>
                    </Col>
                </Row>
            ) : (
                <>
                    {/* Detailed Table */}
                    <Row className="mb-4">
                        <Col md={12}>
                            <Card className="shadow-sm border-0">
                                <Card.Header className="bg-primary text-white fw-semibold d-flex align-items-center">
                                    <FiBarChart className="me-2" /> {t('reports.sellerRevenue')}
                                </Card.Header>
                                <Card.Body className="p-0">
                                    <Table striped bordered hover responsive className="mb-0">
                                        <thead className="table-light">
                                            <tr className="text-center align-middle">
                                                <th style={{ width: "60px" }}>#</th>
                                                <th>{t('reports.sellerName')}</th>
                                                <th>{t('reports.email')}</th>
                                                <th>{t('reports.productCount')}</th>
                                                <th>{t('reports.orders')}</th>
                                                <th>{t('reports.revenue')}</th>
                                                <th>{t('reports.avgOrder')}</th>
                                                <th>{t('reports.rank')}</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reports.map((r, index) => (
                                                <tr key={r.sellerId} className="align-middle">
                                                    <td className="text-center fw-bold">{index + 1}</td>
                                                    <td>
                                                        <strong>{r.sellerName}</strong>
                                                    </td>
                                                    <td>{r.email}</td>
                                                    <td className="text-center">
                                                        <Badge bg="secondary">{r.totalProducts || 0}</Badge>
                                                    </td>
                                                    <td className="text-center">
                                                        <FiShoppingCart className="text-primary me-1" />
                                                        <strong>{r.totalOrders}</strong>
                                                    </td>
                                                    <td className="text-end">
                                                        <FiDollarSign className="text-success me-1" />
                                                        <strong className="text-success">{formatCurrency(r.totalRevenue)}</strong>
                                                    </td>
                                                    <td className="text-end">{formatCurrency(r.avgOrderValue)}</td>
                                                    <td className="text-center">
                                                        {index === 0 ? (
                                                            <Badge bg="success">🥇 #1</Badge>
                                                        ) : index === 1 ? (
                                                            <Badge bg="warning text-dark">🥈 #2</Badge>
                                                        ) : index === 2 ? (
                                                            <Badge bg="secondary">🥉 #3</Badge>
                                                        ) : (
                                                            <Badge bg="light text-dark">#{index + 1}</Badge>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Charts */}
                    <Row>
                        <Col md={12}>
                            <Card className="shadow-sm border-0">
                                <Card.Header className="bg-success text-white fw-semibold d-flex align-items-center">
                                    <FiTrendingUp className="me-2" /> {t('reports.revenueChart')}
                                </Card.Header>
                                <Card.Body style={{ height: 450 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={reports.slice(0, 10)}
                                            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis
                                                dataKey="sellerName"
                                                angle={-45}
                                                textAnchor="end"
                                                height={100}
                                                interval={0}
                                            />
                                            <YAxis />
                                            <Tooltip
                                                formatter={(value) => formatCurrency(value)}
                                                contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)' }}
                                            />
                                            <Legend />
                                            <Bar dataKey="totalRevenue" name={t('reports.revenue')} fill="#0d6efd" radius={[8, 8, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}
        </Container>
    );
};

export default ReportAdmin;
