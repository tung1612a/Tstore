import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Spinner, Alert, Button, Card, Badge } from 'react-bootstrap'
import { FiArrowLeft, FiHome, FiStar, FiUsers, FiPackage, FiShield, FiShoppingCart } from 'react-icons/fi'
import { useSelector, useDispatch } from 'react-redux'
import ProductCard from '../Product/ProductCard'
import './StorePage.css';
import { useTranslation } from 'react-i18next';

function StorePage() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation();
  
  // Redux state
  const cartItems = useSelector(state => state.cart.items)
  const dispatch = useDispatch()

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError(null)
    fetch(`/api/products?sellerId=${sellerId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = await res.json()
        if (mounted) setProducts(json)
      })
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false))
    return () => { mounted = false }
  }, [sellerId])

  const header = useMemo(() => {
    const first = products?.[0]
    return first?.storeInfo || null
  }, [products])

  return (
    <Container className="py-4">
      {/* Navigation Header */}
      <div className="mb-4 d-flex align-items-center justify-content-between">
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate(-1)}
          className="d-flex align-items-center"
        >
          <FiArrowLeft className="me-2" />
          {t('storePage.1')}
        </Button>
        <div className="d-flex align-items-center">
          <div className="d-flex align-items-center text-muted me-4">
            <FiHome className="me-2" />
            <span>{t('storePage.2')}</span>
          </div>
          <Button 
            variant="outline-primary" 
            onClick={() => navigate('/cart')}
            className="d-flex align-items-center position-relative"
          >
            <FiShoppingCart className="me-2" />
            {t('storePage.3')}
            {cartItems.length > 0 && (
              <Badge 
                bg="danger" 
                className="position-absolute top-0 start-100 translate-middle rounded-pill"
                style={{ fontSize: '10px', minWidth: '18px', height: '18px' }}
              >
                {cartItems.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Store Header */}
      {header && (
        <Card className="mb-5 overflow-hidden border-0 shadow-lg store-header-card">
          <div className="store-hero position-relative">
            {header.bannerImageURL ? (
              <div 
                className="store-hero-banner" 
                style={{ 
                  backgroundImage: `url(${header.bannerImageURL.startsWith('http') ? header.bannerImageURL : `http://localhost:5000${header.bannerImageURL}`})`,
                  height: '200px',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }} 
              />
            ) : (
              <div 
                className="store-hero-banner" 
                style={{ 
                  height: '200px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }} 
              />
            )}
            <div className="store-hero-overlay" />
          </div>
          <Card.Body className="p-4">
            <div className="store-meta d-flex align-items-start">
              <div className="store-avatar me-4">
                {header.avatarUrl ? (
                  <img 
                    src={header.avatarUrl.startsWith('http') ? header.avatarUrl : `http://localhost:5000${header.avatarUrl}`}
                    alt="avatar"
                    className="rounded-circle"
                    style={{ width: '80px', height: '80px', objectFit: 'cover', border: '3px solid #fff' }}
                  />
                ) : (
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center"
                    style={{ 
                      width: '80px', 
                      height: '80px', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: 'bold'
                    }}
                  >
                    {(header.storeName || 'Store').slice(0,1).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="flex-grow-1">
                <div className="d-flex align-items-center mb-2">
                  <h3 className="store-name mb-0 me-3">{header.storeName}</h3>
                  <Badge 
                    bg={header.status === 'approved' ? 'success' : 'warning'}
                    className="d-flex align-items-center"
                  >
                    <FiShield className="me-1" size={12} />
                    {header.status === 'approved' ? 'Đã xác thực' : 'Chờ xác thực'}
                  </Badge>
                </div>
                <div className="d-flex align-items-center text-muted mb-2">
                  <FiStar className="me-1" size={16} color="#ffc107" fill="#ffc107" />
                  <span className="me-3">4.8 (128 đánh giá)</span>
                  <FiUsers className="me-1" size={16} />
                  <span className="me-3">1.2k người theo dõi</span>
                  <FiPackage className="me-1" size={16} />
                  <span>{products.length} sản phẩm</span>
                </div>
                <p className="text-muted mb-0">
                  Cửa hàng chuyên cung cấp các sản phẩm công nghệ chất lượng cao với giá cả hợp lý
                </p>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Products Section */}
      <div className="products-section">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h4 className="mb-0 d-flex align-items-center">
            <FiPackage className="me-2" />
            {t('storePage.5')}
          </h4>
          <div className="d-flex align-items-center text-muted">
            <span className="me-3">{t('storePage.6')} {products.length} {t('storePage.7')}</span>
          </div>
        </div>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">{t('storePage.8')}</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className="text-center">
            <Alert.Heading>{t('storePage.9')}</Alert.Heading>
            <p>{error}</p>
            <Button variant="outline-danger" onClick={() => window.location.reload()}>
              {t('storePage.10')}
            </Button>
          </Alert>
        )}

        {!loading && !error && (
          <>
            {products.length === 0 ? (
              <Card className="text-center py-5">
                <Card.Body>
                  <FiPackage size={64} className="text-muted mb-3" />
                  <h5 className="text-muted">{t('storePage.11')}</h5>
                  <p className="text-muted">{t('storePage.12')}</p>
                </Card.Body>
              </Card>
            ) : (
              <Row className="g-4">
                {products.map((p) => (
                  <Col key={p._id} xs={12} sm={6} md={4} lg={3}>
                    <ProductCard product={p} hideStoreButton={true} />
                  </Col>
                ))}
              </Row>
            )}
          </>
        )}
      </div>

    </Container>
  )
}

export default StorePage
