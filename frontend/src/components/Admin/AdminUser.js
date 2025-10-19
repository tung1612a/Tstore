import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiUserPlus, FiEdit, FiTrash2, FiArrowLeft } from "react-icons/fi";

const AdminUser = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={fetchUsers}>
          Thử lại
        </Button>
      </Container>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3f2fd, #e8f5e9)",
        paddingTop: "40px",
        paddingBottom: "40px",
      }}
    >
      <Container>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2
              style={{
                fontWeight: "bold",
                color: "#1565c0",
                textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
              }}
            >
              Quản lý người dùng
            </h2>
            <p style={{ color: "#555" }}>
              Danh sách tất cả tài khoản trong hệ thống
            </p>
          </div>
          <div>
            <Button
              variant="outline-secondary"
              className="me-2"
              onClick={() => navigate("/admin")}
              style={{
                borderRadius: "10px",
                fontWeight: "500",
              }}
            >
              <FiArrowLeft className="me-2" />
              Quay lại Dashboard
            </Button>
            {/* <Button
              variant="success"
              style={{
                borderRadius: "10px",
                fontWeight: "500",
              }}
            >
              <FiUserPlus className="me-2" /> Thêm người dùng
            </Button> */}
          </div>
        </div>

        <Card
          className="shadow-lg border-0"
          style={{
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <Card.Body style={{ padding: "0" }}>
            <Table
              hover
              responsive
              className="mb-0"
              style={{
                borderCollapse: "separate",
                borderSpacing: "0",
              }}
            >
              <thead
                style={{
                  background: "linear-gradient(90deg, #42a5f5, #66bb6a)",
                  color: "white",
                }}
              >
                <tr>
                  <th className="text-center p-3">#</th>
                  <th className="p-3">Tên người dùng</th>
                  <th className="p-3">Email</th>
                  <th className="p-3 text-center">Vai trò</th>
                  <th className="p-3 text-center">Trạng thái</th>
                  <th className="p-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr
                      key={user._id || index}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#fafafa" : "#ffffff",
                        transition: "all 0.2s ease-in-out",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor = "#e3f2fd")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          index % 2 === 0 ? "#fafafa" : "#ffffff")
                      }
                    >
                      <td className="text-center fw-bold">{index + 1}</td>
                      <td>{user.fullName || user.username || "Không rõ"}</td>
                      <td>{user.email}</td>
                      <td className="text-center">
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontWeight: "500",
                            color: "white",
                            background:
                              user.role === "admin"
                                ? "#f44336"
                                : user.role === "seller"
                                ? "#42a5f5"
                                : "#66bb6a",
                          }}
                        >
                          {user.role?.toUpperCase() || "N/A"}
                        </span>
                      </td>
                      <td className="text-center">
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "8px",
                            fontWeight: "500",
                            color: "white",
                            background: user.isActive ? "#4caf50" : "#9e9e9e",
                          }}
                        >
                          {user.isActive ? "Hoạt động" : "Khóa"}
                        </span>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          style={{ borderRadius: "8px" }}
                        >
                          <FiEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          style={{ borderRadius: "8px" }}
                        >
                          <FiTrash2 />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      Không có người dùng nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default AdminUser;
