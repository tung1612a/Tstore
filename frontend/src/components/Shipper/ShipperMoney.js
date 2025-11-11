import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert, Button } from 'react-bootstrap';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts';
import { FiDollarSign, FiShoppingCart, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';

const ShipperMoney = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/shipper/reports', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Không thể tải dữ liệu báo cáo!');
        const data = await res.json();
        setReport(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 fw-semibold">Đang tải dữ liệu báo cáo...</p>
      </div>
    );
  }

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!report) return <Alert variant="info">Không có dữ liệu báo cáo.</Alert>;

  return (
    <Container className="mt-4 mb-5">
      <div
        className="p-4 mb-4 text-white rounded-4 shadow-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(0,123,255,0.9), rgba(0,200,150,0.8))'
        }}
      >
        <h3 className="fw-bold mb-1">
          <FiBarChart2 className="me-2" />
          Thống kê giao hàng - Doanh thu
        </h3>
        <p className="mb-0 opacity-75">Tổng quan hiệu suất giao hàng của bạn</p>
      </div>

      <Row className="g-4 mb-4">
        {[
          {
            title: 'Tổng doanh thu',
            value: `${(report.totalRevenue || 0).toLocaleString()} ₫`,
            icon: <FiDollarSign size={40} />,
            color: 'primary'
          },
          {
            title: 'Tổng đơn đã giao',
            value: report.totalOrders || 0,
            icon: <FiShoppingCart size={40} />,
            color: 'success'
          },
          {
            title: 'Giá trị TB đơn hàng',
            value: `${(report.averageOrderValue || 0).toLocaleString()} ₫`,
            icon: <FiTrendingUp size={40} />,
            color: 'warning'
          }
        ].map((item, idx) => (
          <Col md={4} key={idx}>
            <Card
              className={`h-100 border-0 shadow-sm text-white bg-${item.color}`}
              style={{
                borderRadius: '18px',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-4px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Card.Body className="position-relative overflow-hidden">
                <div
                  style={{
                    position: 'absolute',
                    top: '-20px',
                    right: '-20px',
                    opacity: 0.15
                  }}
                >
                  {item.icon}
                </div>
                <Card.Title className="fw-semibold">{item.title}</Card.Title>
                <h3 className="fw-bold mt-2">{item.value}</h3>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Card className="shadow-sm border-0 mb-4 rounded-4">
        <Card.Header className="bg-light fw-bold fs-5 border-0">
          Doanh thu theo tháng
        </Card.Header>
        <Card.Body style={{ height: '350px' }}>
          {report.monthlyRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${Number(value).toLocaleString()} ₫`} />
                <Line type="monotone" dataKey="revenue" stroke="#007bff" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted">Chưa có dữ liệu doanh thu theo tháng.</p>
          )}
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0 rounded-4">
        <Card.Header className="bg-light fw-bold fs-5 border-0">
          Số đơn hàng theo tháng
        </Card.Header>
        <Card.Body style={{ height: '350px' }}>
          {report.monthlyOrders?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.monthlyOrders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="orders" stroke="#28a745" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted">Chưa có dữ liệu đơn hàng theo tháng.</p>
          )}
        </Card.Body>
      </Card>

    <Card className="shadow-sm border-0 mb-4 rounded-4">
      <Card.Header className="bg-light fw-bold fs-5 border-0">
        Doanh thu theo ngày (30 ngày gần nhất)
      </Card.Header>
      <Card.Body style={{ height: '350px' }}>
        {report.dailyRevenue?.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={report.dailyRevenue}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `${Number(value).toLocaleString()} ₫`} />
              <Line type="monotone" dataKey="revenue" stroke="#17a2b8" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted">Chưa có dữ liệu doanh thu theo ngày.</p>
        )}
      </Card.Body>
    </Card>

    <Card className="shadow-sm border-0 rounded-4">
      <Card.Header className="bg-light fw-bold fs-5 border-0">
        Số đơn hàng theo ngày (30 ngày gần nhất)
      </Card.Header>
      <Card.Body style={{ height: '350px' }}>
        {report.dailyOrders?.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={report.dailyOrders}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="orders" stroke="#6f42c1" strokeWidth={3} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted">Chưa có dữ liệu đơn hàng theo ngày.</p>
        )}
      </Card.Body>
    </Card>

      <div>
        <Button variant="secondary" href="/shipper" className="mt-4">
          Quay lại dashboard
        </Button>
      </div>
    </Container>
  );
};

export default ShipperMoney;

