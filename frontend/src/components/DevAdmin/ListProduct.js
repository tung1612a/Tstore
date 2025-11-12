import React, { useEffect, useState, useMemo } from "react";
import { Button, Modal, Form, Image, Pagination, Spinner } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContext";

const ListProduct = () => {
    const { token } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [form, setForm] = useState({
        title: "",
        stock: "",
        description: "",
        price: "",
        image: "",
        sellerId: "",
    });
    const [selectedProductId, setSelectedProductId] = useState(null);

    const PAGE_SIZE = 10;               // đổi số này nếu muốn
    const [page, setPage] = useState(1);

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
            setPage(1);
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
        setForm({ title: "", stock: "", description: "", price: "", image: "", sellerId: "" });
        setShowModal(true);
    };

    const handleEdit = (product) => {
        setEditMode(true);
        setSelectedProductId(product._id);
        setForm({
            title: product.title,
            stock: product.stock,
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
                setProducts((prev) => {
                    const next = prev.filter((p) => p._id !== id);
                    // nếu xóa làm trang hiện tại rỗng, lùi 1 trang
                    const totalAfter = next.length;
                    const totalPagesAfter = Math.max(1, Math.ceil(totalAfter / PAGE_SIZE));
                    setPage((p) => Math.min(p, totalPagesAfter));
                    return next;
                });
                // setProducts(products.filter((p) => p._id !== id));
            } else {
                alert("Không thể xóa sản phẩm!");
            }
        } catch (err) {
            console.error("Error deleting product:", err);
        }
    };

    // ====== TÍNH TOÁN PHÂN TRANG (trước return để không vi phạm rules-of-hooks) ======
    const total = products.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const startIdx = (currentPage - 1) * PAGE_SIZE;
    const endIdx = Math.min(startIdx + PAGE_SIZE, total);

    const pagedProducts = useMemo(
        () => products.slice(startIdx, endIdx),
        [products, startIdx, endIdx]
    );

    const buildPageNumbers = () => {
        const pages = [];
        if (totalPages <= 7) {
            for (let p = 1; p <= totalPages; p++) pages.push(p);
            return pages;
        }
        pages.push(1);
        const left = Math.max(2, currentPage - 2);
        const right = Math.min(totalPages - 1, currentPage + 2);
        if (left > 2) pages.push("ellipsis-left");
        for (let p = left; p <= right; p++) pages.push(p);
        if (right < totalPages - 1) pages.push("ellipsis-right");
        pages.push(totalPages);
        return pages;
    };

    const pageNumbers = buildPageNumbers();
    const goTo = (p) => setPage(Math.min(Math.max(1, p), totalPages));

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
                {/* <Button style={styles.addButton} onClick={handleAdd}>
                    + Thêm sản phẩm
                </Button> */}

                <Button
                    variant="secondary"
                    style={styles.backButton}
                    onClick={() => window.location.replace("/admin")}
                >
                    Quay lại Dashboard
                </Button>
            </div>

            <div style={styles.cardGrid}>
                {pagedProducts.map((p) => (
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
                        <p style={styles.seller}>Số lượng: {p.stock}</p>
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

            {/* ✅ Thanh phân trang + thông tin hiển thị */}
            {total > 0 && (
                <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                        Hiển thị {total === 0 ? 0 : startIdx + 1}–{endIdx} / {total} sản phẩm
                    </div>
                    <Pagination className="mb-0">
                        <Pagination.First onClick={() => goTo(1)} disabled={currentPage === 1} />
                        <Pagination.Prev onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1} />
                        {pageNumbers.map((p, i) =>
                            typeof p === "number" ? (
                                <Pagination.Item key={p} active={p === currentPage} onClick={() => goTo(p)}>
                                    {p}
                                </Pagination.Item>
                            ) : (
                                <Pagination.Ellipsis key={`e-${i}`} disabled />
                            )
                        )}
                        <Pagination.Next onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages} />
                        <Pagination.Last onClick={() => goTo(totalPages)} disabled={currentPage === totalPages} />
                    </Pagination>
                </div>
            )}

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
                            <Form.Label>Tên sản phẩm</Form.Label>
                            <Form.Control
                                name="title"
                                value={form.title}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Số lượng tồn kho</Form.Label>
                            <Form.Control
                                disabled
                                name="stock"
                                value={form.stock}
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
                                disabled
                                type="number"
                                name="price"
                                value={form.price}
                                onChange={handleChange}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Ảnh (URL)</Form.Label>
                            <Form.Control
                                disabled
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
