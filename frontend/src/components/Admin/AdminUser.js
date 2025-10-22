import React, { useEffect, useState } from "react";
import {
  Container,
  Card,
  Table,
  Button,
  Spinner,
  Alert,
  Modal,
  Form,
} from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FiEdit, FiTrash2, FiArrowLeft } from "react-icons/fi";

const AdminUser = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  // ================== LẤY DANH SÁCH USER ==================
  const fetchUsers = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  };

  // ================== XOÁ USER ==================
  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Xóa thất bại");

      alert("✅ " + data.message);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      alert("❌ " + err.message);
    }
  };

  // ================== MỞ MODAL SỬA ==================
  const handleEdit = (user) => {
    setSelectedUser({ ...user });
    setShowModal(true);
  };

  // ================== CẬP NHẬT USER ==================
  const handleUpdate = async () => {
    if (!selectedUser) return;
    setUpdating(true);
    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/users/${selectedUser._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            fullName: selectedUser.fullName,
            email: selectedUser.email,
            phone: selectedUser.phone,
            role: selectedUser.role,
            active: selectedUser.active,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");

      alert("✅ Cập nhật thành công!");
      setShowModal(false);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === selectedUser._id
            ? { ...u, ...(data.user || selectedUser) } // đảm bảo luôn có dữ liệu đầy đủ
            : u
        )
      );
    } catch (err) {
      alert("❌ " + err.message);
    } finally {
      setUpdating(false);
    }
  };
  // ================== CHUYỂN ĐỔI TRẠNG THÁI KÍCH HOẠT ==================
  const handleToggleActive = async (id, currentActive) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/admin/users/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ active: !currentActive }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Cập nhật thất bại");

      const updatedUser = data.user || { active: !currentActive };

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, ...updatedUser } : u))
      );
    } catch (err) {
      console.error("Error updating user:", err);
      alert("Không thể cập nhật trạng thái người dùng.");
    }
  };

  // ================== LOADING / ERROR ==================
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

  // ================== UI CHÍNH ==================
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
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 style={{ fontWeight: "bold", color: "#1565c0" }}>
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
              onClick={() => navigate("/admin/dashboard")}
              style={{ borderRadius: "10px", fontWeight: "500" }}
            >
              <FiArrowLeft className="me-2" />
              Quay lại Dashboard
            </Button>
          </div>
        </div>

        {/* Bảng danh sách */}
        <Card className="shadow-lg border-0" style={{ borderRadius: "16px" }}>
          <Card.Body style={{ padding: "0" }}>
            <Table hover responsive className="mb-0">
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
                  <th className="p-3">SĐT</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3 text-center">Vai trò</th>
                  <th className="p-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user, index) => (
                    <tr key={user._id}>
                      <td className="text-center fw-bold">{index + 1}</td>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.phone || "—"}</td>
                      <td className="text-center">
                        <Form.Check
                          type="switch"
                          id={`active-${user._id}`}
                          checked={!!user.active}
                          onChange={() =>
                            handleToggleActive(user._id, user.active)
                          }
                          label={user.active ? "Hoạt động" : "Khóa"}
                        />
                      </td>
                      <td className="text-center">
                        <span
                          style={{
                            padding: "4px 10px",
                            borderRadius: "8px",
                            color: "white",
                            background:
                              user.role === "admin"
                                ? "#f44336"
                                : user.role === "seller"
                                  ? "#42a5f5"
                                  : "#66bb6a",
                          }}
                        >
                          {user.role?.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          style={{ borderRadius: "8px" }}
                          onClick={() => handleEdit(user)}
                        >
                          <FiEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          style={{ borderRadius: "8px" }}
                          onClick={() => handleDelete(user._id)}
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

      {/* ================== MODAL SỬA USER ================== */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật người dùng</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedUser && (
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Họ tên</Form.Label>
                <Form.Control
                  type="text"
                  value={selectedUser.fullName || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      fullName: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={selectedUser.email || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      email: e.target.value,
                    })
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Vai trò</Form.Label>
                <Form.Select
                  value={selectedUser.role || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      role: e.target.value,
                    })
                  }
                >
                  <option value="admin">Admin</option>
                  <option value="seller">Seller</option>
                  <option value="customer">Customer</option>
                  <option value="devadmin">DevAdmin</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="primary" onClick={handleUpdate} disabled={updating}>
            {updating ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminUser;