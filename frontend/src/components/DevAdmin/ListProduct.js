import React, { useEffect, useState } from "react";
import { Button, Modal, Form, Image, Spinner } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";

const ListProduct = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        price: "",
        image: "",
        sellerId: "",
    });
    const [selectedProductId, setSelectedProductId] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/products", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            console.error("Error fetching products:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAdd = () => {
        setEditMode(false);
        setForm({ title: "", description: "", price: "", image: "", sellerId: "" });
        setShowModal(true);
    };

    const handleEdit = (product) => {
        setEditMode(true);
        setSelectedProductId(product._id);
        setForm({
            title: product.title,
            description: product.description,
            price: product.price,
            image: product.image,
            sellerId: product.sellerId?._id || "",
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        const url = editMode
            ? `http://localhost:5000/api/products/${selectedProductId}`
            : "http://localhost:5000/api/products";

        const method = editMode ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                setShowModal(false);
                fetchProducts();
            } else {
                alert("Lỗi khi lưu sản phẩm");
            }
        } catch (err) {
            console.error("Error saving product:", err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa sản phẩm này không?")) return;

        try {
            const res = await fetch(`http://localhost:5000/api/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                setProducts(products.filter((p) => p._id !== id));
            } else {
                alert("Không thể xóa sản phẩm!");
            }
        } catch (err) {
            console.error("Error deleting product:", err);
        }
    };

    if (loading)
        return (
            <div className="text-center py-5">
                <Spinner animation="border" /> Đang tải sản phẩm...
            </div>
        );

    return (
        <div style={styles.container}>
            <h2 style={styles.heading}> Danh sách sản phẩm</h2>

            <div style={styles.buttonRow}>
                <Button style={styles.addButton} onClick={handleAdd}>
                    + Thêm sản phẩm
                </Button>

                <Button
                    variant="secondary"
                    style={styles.backButton}
                    onClick={() => window.location.replace("/admin/dashboard")}
                >
                    Quay lại Dashboard
                </Button>
            </div>

            <div style={styles.cardGrid}>
                {products.map((p) => (
                    <div key={p._id} style={styles.card}>
                        <Image
                            src={p.image}
                            alt={p.title}
                            style={styles.image}
                            rounded
                            onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
                        />
                        <h5 style={styles.title}>{p.title}</h5>
                        <p style={styles.desc}>
                            {p.description?.length > 80
                                ? p.description.substring(0, 80) + "..."
                                : p.description}
                        </p>
                        <p style={styles.price}>Giá: {p.price} VND</p>
                        <p style={styles.seller}>
                            Người bán: {p.sellerId?.fullName || "Không xác định"}
                        </p>
                        <div style={styles.actions}>
                            <Button
                                variant="primary"
                                size="sm"
                                style={styles.buttonEdit}
                                onClick={() => handleEdit(p)}
                            >
                                Sửa
                            </Button>
                            <Button
                                variant="danger"
                                size="sm"
                                style={styles.buttonDelete}
                                onClick={() => handleDelete(p._id)}
                            >
                                Xóa
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editMode ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tiêu đề</Form.Label>
                            <Form.Control
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Mô tả</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Giá</Form.Label>
                            <Form.Control
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Ảnh (URL)</Form.Label>
                            <Form.Control
                                name="image"
                                value={form.image}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        {/* <Form.Group className="mb-3">
                            <Form.Label>ID người bán</Form.Label>
                            <Form.Control
                                name="sellerId"
                                value={form.sellerId}
                                onChange={handleChange}
                            />
                        </Form.Group> */}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Hủy
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        Lưu
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

/* 🎨 Inline CSS cho đẹp và hiện đại */
const styles = {
    container: {
        padding: "30px",
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
    },
    heading: {
        fontWeight: "bold",
        color: "#2c3e50",
        marginBottom: "20px",
    },
    addButton: {
        marginBottom: "25px",
        backgroundColor: "#28a745",
        border: "none",
        fontWeight: "600",
    },
    cardGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
        gap: "20px",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: "12px",
        boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
        padding: "15px",
        transition: "all 0.3s ease",
    },
    image: {
        width: "100%",
        height: "180px",
        objectFit: "cover",
        borderRadius: "10px",
        marginBottom: "10px",
    },
    title: {
        fontSize: "1.1rem",
        fontWeight: "bold",
        color: "#34495e",
    },
    desc: {
        fontSize: "0.9rem",
        color: "#7f8c8d",
        minHeight: "50px",
    },
    price: {
        fontWeight: "bold",
        color: "#e74c3c",
    },
    seller: {
        fontSize: "0.9rem",
        color: "#2c3e50",
    },
    actions: {
        display: "flex",
        justifyContent: "space-between",
        marginTop: "10px",
    },
    buttonEdit: {
        flex: 1,
        marginRight: "5px",
        backgroundColor: "#3498db",
        border: "none",
    },
    buttonDelete: {
        flex: 1,
        marginLeft: "5px",
        backgroundColor: "#e74c3c",
        border: "none",
    },
    buttonRow: {
        display: "flex",
        gap: "75%",
        marginBottom: "20px",
    },
    addButton: {
        backgroundColor: "#28a745",
        border: "none",
        fontWeight: "600",
        padding: "8px 18px",
        borderRadius: "8px",
    },
    backButton: {
        backgroundColor: "#6c757d",
        border: "none",
        fontWeight: "600",
        padding: "8px 18px",
        borderRadius: "8px",
    },
};

export default ListProduct;
