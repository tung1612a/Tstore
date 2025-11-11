import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Button, Card, Badge, Modal } from 'react-bootstrap';
import { FiArrowLeft, FiPackage, FiStar, FiUser, FiMail, FiPhone, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const AdminStoreDetail = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });

  useEffect(() => {
    fetchStoreDetail();
  }, [storeId]);

  const fetchStoreDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/admin/stores/${storeId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStore(data);
        
        // Fetch products of this store
        if (data.seller?._id) {
          fetchStoreProducts(data.seller._id);
        }
      } else {
        setError('Không tìm thấy store');
      }
    } catch (err) {
      console.error('Error fetching store detail:', err);
      setError('Có lỗi xảy ra khi tải chi tiết store');
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreProducts = async (sellerId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products?sellerId=${sellerId}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false }), 3000);
  };

  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    setDeleting(true);
    try {
      const res = await fetch(`http://localhost:5000/api/products/${productToDelete._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        showAlert('Xóa sản phẩm thành công!', 'success');
        setShowDeleteModal(false);
        setProductToDelete(null);
        // Refresh products list
        if (store?.seller?._id) {
          fetchStoreProducts(store.seller._id);
        }
        // Update product count
        setStore(prev => ({
          ...prev,
          productCount: (prev.productCount || 0) - 1
        }));
      } else {
        const data = await res.json();
        showAlert(data.message || 'Không thể xóa sản phẩm', 'danger');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      showAlert('Lỗi kết nối', 'danger');
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Component Admin Product Card
  const AdminProductCard = ({ product }) => {
    const price = product.price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
    const stock = product.stock ?? product.inventoryQuantity ?? 0;
    const isOutOfStock = stock === 0;

    return (
      <Card className="h-100 shadow-sm">
        <div
          className="position-relative"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.image || product.imageURL ? (
            <Card.Img
              variant="top"
              src={product.image || product.imageURL}
              alt={product.title}
              style={{ height: 220, objectFit: "cover" }}
            />
          ) : (
            <div
              style={{
                height: 220,
                background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6c757d",
                fontSize: "14px",
              }}
            >
              Không có hình ảnh
            </div>
          )}
          {isOutOfStock && (
            <Badge bg="danger" className="position-absolute top-0 start-0 m-2" style={{ fontSize: "12px", fontWeight: "600" }}>
              Hết hàng
            </Badge>
          )}
        </div>

        <Card.Body className="d-flex flex-column">
          <Card.Title
            className="h6 text-truncate mb-2"
            title={product.title}
            style={{
              color: "#2c3e50",
              fontSize: "14px",
              lineHeight: "1.4",
              cursor: "pointer",
            }}
            onClick={() => navigate(`/product/${product._id}`)}
          >
            {product.title}
          </Card.Title>

          <div className="d-flex align-items-center mb-2">
            <div className="d-flex align-items-center me-2">
              <FiStar size={14} color="#ffc107" fill="#ffc107" />
              <FiStar size={14} color="#ffc107" fill="#ffc107" />
              <FiStar size={14} color="#ffc107" fill="#ffc107" />
              <FiStar size={14} color="#ffc107" fill="#ffc107" />
              <FiStar size={14} color="#e9ecef" />
              <span className="ms-1 text-muted" style={{ fontSize: "12px" }}>
                (128)
              </span>
            </div>
          </div>

          <div className="d-flex align-items-center justify-content-between mb-3">
            <div>
              <div className="text-danger fw-bold fs-5">{price}</div>
            </div>
            {stock !== undefined && stock !== null && (
              <div className={isOutOfStock ? "text-danger fw-bold" : "text-muted"} style={{ fontSize: "12px" }}>
                {isOutOfStock ? "Hết hàng" : `Còn: ${stock} Sản phẩm`}
              </div>
            )}
          </div>

          <Button
            variant="outline-danger"
            size="sm"
            className="w-100 d-flex align-items-center justify-content-center"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal(product);
            }}
          >
            <FiTrash2 className="me-2" size={16} />
            Xóa sản phẩm
          </Button>
        </Card.Body>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button onClick={() => navigate('/admin/stores')}>Quay lại</Button>
      </Container>
    );
  }

  if (!store) {
    return (
      <Container className="py-4">
        <Alert variant="warning">Không tìm thấy store</Alert>
        <Button onClick={() => navigate('/admin/stores')}>Quay lại</Button>
      </Container>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge bg="success">Được phê duyệt</Badge>;
      case 'pending':
        return <Badge bg="warning">Chờ xử lý</Badge>;
      case 'rejected':
        return <Badge bg="danger">Không được xác minh</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      {/* Header Navigation */}
      <div style={{ backgroundColor: '#f8f9fa', borderBottom: '1px solid #e9ecef', padding: '1rem 0' }}>
        <Container>
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/admin/stores')}
            className="d-flex align-items-center"
          >
            <FiArrowLeft className="me-2" />
            Quay lại Danh sách Store
          </Button>
        </Container>
      </div>

      <Container className="py-5">
        {/* Alert */}
        {alert.show && (
          <Alert 
            variant={alert.variant} 
            dismissible 
            onClose={() => setAlert({ show: false })}
            className="mb-3"
          >
            {alert.message}
          </Alert>
        )}

        {/* Store Header */}
        <Card className="mb-5 border-0 shadow-sm">
          <Card.Body className="p-4">
            <Row>
              <Col md={8}>
                <h2 className="mb-3" style={{ color: '#2c3e50', fontWeight: 'bold' }}>
                  {store.storeName}
                </h2>
                
                {store.description && (
                  <p className="text-muted mb-3">{store.description}</p>
                )}

                <div className="mb-3">
                  <h6 className="text-muted mb-2">Trạng thái:</h6>
                  {getStatusBadge(store.status)}
                </div>

                <div className="mb-3">
                  <h6 className="text-muted mb-2">Ngày tạo:</h6>
                  <span>{new Date(store.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </Col>

              <Col md={4}>
                <Card className="bg-light border-0">
                  <Card.Body>
                    <h5 className="mb-3">Thông tin chủ cửa hàng</h5>
                    
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <FiUser className="me-2 text-primary" size={18} />
                        <span className="fw-bold">{store.seller?.fullName}</span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <FiMail className="me-2 text-primary" size={18} />
                        <a href={`mailto:${store.seller?.email}`} style={{ textDecoration: 'none' }}>
                          {store.seller?.email}
                        </a>
                      </div>
                    </div>

                    <hr />

                    <div className="text-center">
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ee4d2d' }}>
                        {store.productCount || 0}
                      </div>
                      <small className="text-muted">Sản phẩm</small>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Products Section */}
        <div className="mb-5">
          <div className="d-flex align-items-center mb-4">
            <FiPackage className="me-2" size={24} style={{ color: '#ee4d2d' }} />
            <h3 style={{ color: '#2c3e50', fontWeight: 'bold', marginBottom: 0 }}>
              Sản phẩm của cửa hàng
            </h3>
            <Badge bg="info" className="ms-3">{products.length}</Badge>
          </div>

          {products.length > 0 ? (
            <Row>
              {products.map(product => (
                <Col key={product._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                  <AdminProductCard product={product} />
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              <FiPackage className="me-2" />
              Cửa hàng này chưa có sản phẩm nào
            </Alert>
          )}
        </div>
      </Container>

      {/* Delete Product Confirmation Modal */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => !deleting && setShowDeleteModal(false)} 
        centered
      >
        <Modal.Header closeButton={!deleting}>
          <Modal.Title>Xác nhận xóa sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {productToDelete && (
            <>
              <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>"{productToDelete.title}"</strong>?</p>
              <Alert variant="warning" className="mb-0">
                <strong>Lưu ý:</strong> Hành động này không thể hoàn tác. Sản phẩm sẽ bị xóa vĩnh viễn khỏi hệ thống.
              </Alert>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Hủy
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteProduct}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Đang xóa...
              </>
            ) : (
              <>
                <FiTrash2 className="me-2" />
                Xóa sản phẩm
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default AdminStoreDetail;
