import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Button, Card, Badge } from 'react-bootstrap';
import { FiArrowLeft, FiPackage, FiStar, FiUser, FiMail, FiPhone } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import ProductCard from '../Product/ProductCard';

const AdminStoreDetail = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      const response = await fetch(`/api/products?sellerId=${sellerId}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data || []);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
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
        return <Badge bg="danger">Bị từ chối</Badge>;
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

                    <div className="row text-center">
                      <div className="col-6">
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ee4d2d' }}>
                          {store.productCount || 0}
                        </div>
                        <small className="text-muted">Sản phẩm</small>
                      </div>
                      <div className="col-6">
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ee4d2d' }}>
                          {store.reviewCount || 0}
                        </div>
                        <small className="text-muted">Đánh giá</small>
                      </div>
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
                  <ProductCard product={product} hideStoreButton={true} />
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

        {/* Recent Reviews */}
        {store.recentReviews && store.recentReviews.length > 0 && (
          <div>
            <h4 className="mb-3" style={{ color: '#2c3e50', fontWeight: 'bold' }}>
              Đánh giá gần đây
            </h4>
            {store.recentReviews.map(review => (
              <Card key={review._id} className="mb-3 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="mb-1">{review.buyerId?.fullName || 'Ẩn danh'}</h6>
                      <div className="text-warning mb-2">
                        {'⭐'.repeat(review.rating)}
                      </div>
                    </div>
                    <small className="text-muted">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </small>
                  </div>
                  <p className="text-muted mb-0">{review.comment}</p>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </>
  );
};

export default AdminStoreDetail;
