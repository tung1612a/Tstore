import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Spinner, Alert, Button } from "react-bootstrap";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  FiDollarSign,
  FiShoppingCart,
  FiTrendingUp,
  FiBarChart2,
} from "react-icons/fi";

const SellerReport = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const COLORS = ["#4E79A7", "#F28E2B", "#E15759", "#76B7B2", "#59A14F"];

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/seller/reports", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Không thể tải dữ liệu báo cáo!");
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

  if (loading)
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 fw-semibold">Đang tải dữ liệu báo cáo...</p>
      </div>
    );

  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!report) return <Alert variant="info">Không có dữ liệu báo cáo.</Alert>;

  return (
    <Container className="mt-4 mb-5">
      {/* TIÊU ĐỀ */}
      <div
        className="p-4 mb-4 text-white rounded-4 shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, rgba(0,123,255,0.9), rgba(0,200,150,0.8))",
        }}
      >
        <h3 className="fw-bold mb-1">
          <FiBarChart2 className="me-2" />
          Báo cáo Doanh thu & Đơn hàng
        </h3>
        <p className="mb-0 opacity-75">
          Tổng quan hiệu suất kinh doanh của cửa hàng
        </p>
      </div>

      {/* THẺ THỐNG KÊ */}
      <Row className="g-4 mb-4">
        {[
          {
            title: "Tổng doanh thu",
            value: `${report.totalRevenue.toLocaleString()} ₫`,
            icon: <FiDollarSign size={40} />,
            color: "primary",
          },
          {
            title: "Tổng đơn hàng",
            value: report.totalOrders,
            icon: <FiShoppingCart size={40} />,
            color: "success",
          },
          {
            title: "Giá trị TB đơn hàng",
            value: `${report.averageOrderValue.toLocaleString()} ₫`,
            icon: <FiTrendingUp size={40} />,
            color: "warning",
          },
        ].map((item, idx) => (
          <Col md={4} key={idx}>
            <Card
              className={`h-100 border-0 shadow-sm text-white bg-${item.color}`}
              style={{
                borderRadius: "18px",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-4px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <Card.Body className="position-relative overflow-hidden">
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    right: "-20px",
                    opacity: 0.15,
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

      {/* BIỂU ĐỒ DOANH THU THEO THÁNG */}
      <Card className="shadow-sm border-0 mb-4 rounded-4">
        <Card.Header className="bg-light fw-bold fs-5 border-0">
          <FiBarChart2 className="me-2 text-primary" />
          Doanh thu theo tháng
        </Card.Header>
        <Card.Body style={{ height: "350px" }}>
          {report.monthlyRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis 
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return `${(value / 1000000).toFixed(1)}M`;
                    } else if (value >= 1000) {
                      return `${(value / 1000).toFixed(1)}K`;
                    }
                    return value.toLocaleString();
                  }}
                  width={90}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => `${value.toLocaleString()} ₫`}
                  contentStyle={{ borderRadius: "10px" }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#007bff"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted">
              Chưa có dữ liệu doanh thu theo tháng.
            </p>
          )}
        </Card.Body>
      </Card>

      {/* BIỂU ĐỒ DOANH THU THEO NGÀY */}
      <Card className="shadow-sm border-0 mb-4 rounded-4">
        <Card.Header className="bg-light fw-bold fs-5 border-0">
          <FiTrendingUp className="me-2 text-success" />
          Doanh thu theo ngày (30 ngày gần nhất)
        </Card.Header>
        <Card.Body style={{ height: "350px" }}>
          {report.dailyRevenue?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  tickFormatter={(value) => {
                    if (value >= 1000000) {
                      return `${(value / 1000000).toFixed(1)}M`;
                    } else if (value >= 1000) {
                      return `${(value / 1000).toFixed(1)}K`;
                    }
                    return value.toLocaleString();
                  }}
                  width={90}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  formatter={(value) => `${value.toLocaleString()} ₫`}
                  contentStyle={{ borderRadius: "10px" }}
                />
                <Bar
                  dataKey="revenue"
                  fill="#28a745"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted">
              Chưa có dữ liệu doanh thu theo ngày.
            </p>
          )}
        </Card.Body>
      </Card>

      {/* BIỂU ĐỒ PHÂN BỔ DOANH THU */}
      {report.topProducts && report.topProducts.length > 0 && (
        <Card className="shadow-sm border-0 rounded-4">
          <Card.Header className="bg-light fw-bold fs-5 border-0">
            Phân bổ doanh thu theo sản phẩm
          </Card.Header>
          <Card.Body style={{ height: "350px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={report.topProducts}
                  dataKey="revenue"
                  nameKey="productName"
                  outerRadius={120}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(1)}%)`
                  }
                >
                  {report.topProducts.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => `${value.toLocaleString()} ₫`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card.Body>
        </Card>
      )}

      <div>
        <Button variant="secondary" href="/seller" className="mt-4">
          Quay lại dashboard
        </Button>
      </div>
    </Container>
  );
};

export default SellerReport;
