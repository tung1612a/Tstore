"use client"

import React from "react"
import "../Home/Home.css"
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap"
import SiteNavbar from "../Navbar"
import HeroCarousel from "../HeroCarousel"
import Footer from "../Footer"
import CategoriesRow from "../CategoriesRow"
import SearchBar from "../SearchBar"
import SellerFeatures from "../SellerFeatures"

// QUAN TRỌNG: Cập nhật đường dẫn import cho các component Product
import ProductCard from "../Product/ProductCard"
import ProductList from "../Product/ProductList"

// Custom hook này chỉ dùng để lấy dữ liệu chung cho trang chủ (hero, stats, etc.)
// Dữ liệu sản phẩm sẽ do ProductList tự quản lý.
function useHomeData() {
  const [data, setData] = React.useState(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    let isMounted = true
    setLoading(true)
    fetch("/api/home")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load home")
        const json = await res.json()
        if (isMounted) setData(json)
      })
      .catch((err) => {
        if (isMounted) setError(err.message)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  return { data, loading, error }
}

function App() {
  const { data, loading, error } = useHomeData()
  const [keyword, setKeyword] = React.useState("")
  const [categoryId, setCategoryId] = React.useState("")

  // --- ĐÃ XÓA ---
  // Toàn bộ state và useEffect để fetch '/api/products' đã được chuyển vào trong ProductList.js
  // const [allProducts, setAllProducts] = React.useState([]);
  // const [loadingProducts, setLoadingProducts] = React.useState(true);
  // const [errorProducts, setErrorProducts] = React.useState(null);
  // React.useEffect(() => { ... });

  if (loading)
    return (
      <Container className="py-4">
        <Spinner animation="border" /> Đang tải trang chủ...
      </Container>
    )
  if (error)
    return (
      <Container className="py-4">
        <Alert variant="danger">Lỗi: {error}</Alert>
      </Container>
    )

  const { hero, featuredProducts } = data || {}

  return (
    <>
      <SiteNavbar />
      <Container className="py-4">
        <HeroCarousel />
        <Row className="mb-3">
          <Col>
            <h1 className="mb-1">{hero?.title || "Trang chủ"}</h1>
            <div className="text-muted">{hero?.subtitle}</div>
          </Col>
        </Row>

        <Row className="g-4">
          <Col lg={3} className="mb-4">
            <CategoriesRow selectedCategoryId={categoryId} onSelectCategory={setCategoryId} />
          </Col>
          <Col lg={9}>
            <div className="search-container">
              <SearchBar onSearch={setKeyword} />
            </div>

            <div className="section-header">
              <h2 className="section-title">Sản phẩm nổi bật</h2>
              <p className="section-subtitle">Khám phá những sản phẩm được yêu thích nhất</p>
            </div>
            <div className="products-grid mb-5">
              {(featuredProducts || []).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
            <ProductList keyword={keyword} categoryId={categoryId} />
            
            <SellerFeatures />
            
            <div className="section-header">
              <h2 className="section-title">Tất cả sản phẩm</h2>
              <p className="section-subtitle">Bộ sưu tập đầy đủ các sản phẩm chất lượng</p>
            </div>
            <ProductList keyword={keyword} categoryId={categoryId} />
            {/* --- THAY ĐỔI CHÍNH --- */}
            {/* Toàn bộ logic hiển thị loading, error, và map qua sản phẩm... */}
            {/* ...giờ được thay thế bằng một dòng duy nhất này. */}
          </Col>
        </Row>
      </Container>
      <Footer />
    </>
  )
}

export default App
