import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Container, Row, Col, Spinner, Alert, Button, Card } from 'react-bootstrap'
import ProductCard from '../Product/ProductCard'
import './StorePage.css'

function StorePage() {
  const { sellerId } = useParams()
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      <div className="mb-3 d-flex align-items-center justify-content-between">
        <Button variant="link" onClick={() => navigate(-1)}>&larr; Quay lại</Button>
      </div>

      {header && (
        <Card className="mb-4 overflow-hidden border-0 shadow-sm store-header-card">
          <div className="store-hero">
            {header.bannerImageURL && (
              <div className="store-hero-banner" style={{ backgroundImage: `url(${header.bannerImageURL})` }} />
            )}
            <div className="store-hero-overlay" />
          </div>
          <Card.Body>
            <div className="store-meta">
              <div className="store-avatar">
                <span className="fw-bold" style={{ color: '#6c757d' }}>
                  {(header.storeName || 'Store').slice(0,1).toUpperCase()}
                </span>
              </div>
              <div>
                <h4 className="store-name">{header.storeName}</h4>
                <div className="text-muted store-status">Trạng thái: {header.status || 'approved'}</div>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      )}
      {error && (
        <Alert variant="danger">{error}</Alert>
      )}
      {!loading && !error && (
        <Row className="g-3 store-grid">
          {products.length === 0 ? (
            <Col xs={12}>
              <Alert variant="warning">Chưa có sản phẩm nào</Alert>
            </Col>
          ) : products.map((p) => (
            <Col key={p._id} xs={12} sm={6} md={4} lg={3}>
              <ProductCard product={p} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  )
}

export default StorePage
