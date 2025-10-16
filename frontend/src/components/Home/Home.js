import React from 'react';
import '../Home/Home.css';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import SiteNavbar from '../Navbar';
import HeroCarousel from '../HeroCarousel';
import Footer from '../Footer';
import ProductCard from '../ProductCard';
import CategoriesRow from '../CategoriesRow';
import SearchBar from '../SearchBar';

function useHomeData() {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch('/api/home')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load home');
        const json = await res.json();
        if (isMounted) setData(json);
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading, error };
}

function App() {
  const { data, loading, error } = useHomeData();
  const [allProducts, setAllProducts] = React.useState([]);
  const [loadingProducts, setLoadingProducts] = React.useState(true);
  const [errorProducts, setErrorProducts] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;
    setLoadingProducts(true);
    fetch('/api/products')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load products');
        const json = await res.json();
        if (isMounted) setAllProducts(json);
      })
      .catch((err) => {
        if (isMounted) setErrorProducts(err.message);
      })
      .finally(() => {
        if (isMounted) setLoadingProducts(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) return <Container className="py-4"><Spinner animation="border" /> Đang tải trang chủ...</Container>;
  if (error) return <Container className="py-4"><Alert variant="danger">Lỗi: {error}</Alert></Container>;

  const { hero, stats, featuredProducts } = data || {};

  return (
    <>
      <SiteNavbar />
      <Container className="py-4">
        <HeroCarousel />
      <Row className="mb-3">
        <Col>
          <h1 className="mb-1">{hero?.title || 'Trang chủ'}</h1>
          <div className="text-muted">{hero?.subtitle}</div>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={3} className="mb-4">
          <CategoriesRow />
        </Col>
        <Col lg={9}>
          <div className="search-container">
            <SearchBar onSearch={() => {}} />
          </div>
          
          {/* <Row className="mb-5">
            <Col md={4} className="mb-3">
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="stats-icon">🛒</div>
                  <div className="stats-number">{stats?.totalProducts ?? 0}</div>
                  <div className="stats-label">Sản phẩm</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="stats-icon">📂</div>
                  <div className="stats-number">{stats?.totalCategories ?? 0}</div>
                  <div className="stats-label">Danh mục</div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-3">
              <Card className="stats-card h-100">
                <Card.Body>
                  <div className="stats-icon">🏬</div>
                  <div className="stats-number">{stats?.totalStores ?? 0}</div>
                  <div className="stats-label">Cửa hàng</div>
                </Card.Body>
              </Card>
            </Col>
          </Row> */}

          <div className="section-header">
            <h2 className="section-title">Sản phẩm nổi bật</h2>
            <p className="section-subtitle">Khám phá những sản phẩm được yêu thích nhất</p>
          </div>
          <div className="products-grid mb-5">
            {(featuredProducts || []).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          <div className="section-header">
            <h2 className="section-title">Tất cả sản phẩm</h2>
            <p className="section-subtitle">Bộ sưu tập đầy đủ các sản phẩm chất lượng</p>
          </div>
          {loadingProducts && (
            <div className="loading-container">
              <Spinner animation="border" size="lg" />
              <div className="mt-3">Đang tải sản phẩm...</div>
            </div>
          )}
          {errorProducts && <Alert variant="warning">{errorProducts}</Alert>}
          <div className="products-grid">
            {allProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </Col>
      </Row>
      </Container>
      <Footer />
    </>
  );
}

export default App;
