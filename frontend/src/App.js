import React from 'react';
import './App.css';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import SiteNavbar from './components/Navbar';
import HeroCarousel from './components/HeroCarousel';
import Footer from './components/Footer';
import ProductCard from './components/ProductCard';
import CategoriesRow from './components/CategoriesRow';
import SearchBar from './components/SearchBar';

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
        <Col md={3} lg={3}>
          <CategoriesRow />
        </Col>
        <Col md={9} lg={9}>
          <SearchBar onSearch={() => {}} />
          <Row className="mb-4">
            <Col md={4}><Card className="mb-2"><Card.Body>🛒 Sản phẩm: <strong>{stats?.totalProducts ?? 0}</strong></Card.Body></Card></Col>
            <Col md={4}><Card className="mb-2"><Card.Body>📂 Danh mục: <strong>{stats?.totalCategories ?? 0}</strong></Card.Body></Card></Col>
            <Col md={4}><Card className="mb-2"><Card.Body>🏬 Cửa hàng: <strong>{stats?.totalStores ?? 0}</strong></Card.Body></Card></Col>
          </Row>

          <Row className="mb-3">
            <Col><h2>Sản phẩm nổi bật</h2></Col>
          </Row>
          <Row xs={1} sm={2} md={3} lg={3} className="g-3 mb-4">
            {(featuredProducts || []).map((p) => (
              <Col key={p._id}>
                <ProductCard product={p} />
              </Col>
            ))}
          </Row>

          <Row className="mb-3">
            <Col><h2>Tất cả sản phẩm</h2></Col>
          </Row>
          {loadingProducts && <Spinner animation="border" />}
          {errorProducts && <Alert variant="warning">{errorProducts}</Alert>}
          <Row xs={1} sm={2} md={3} lg={3} className="g-3">
            {allProducts.map((p) => (
              <Col key={p._id}>
                <ProductCard product={p} />
              </Col>
            ))}
          </Row>
        </Col>
      </Row>
      </Container>
      <Footer />
    </>
  );
}

export default App;
