"use client";

import React, { useState, useEffect } from "react";
import "../Home/Home.css";
import {
  Container,
  Row,
  Col,
  Spinner,
  Alert,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import { useLocation } from "react-router-dom";

import SiteNavbar from "../Navbar";
import HeroCarousel from "../HeroCarousel";
import Footer from "../Footer";
import CategoriesRow from "../CategoriesRow";
import SearchBar from "../SearchBar";
import ProductCard from "../Product/ProductCard";
import ProductList from "../Product/ProductList";

// Custom hook để load dữ liệu trang chủ
function useHomeData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch("/api/home")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load home");
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
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState("");

  // 🔔 Nhận thông báo từ trang đăng nhập
  const location = useLocation();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastBg, setToastBg] = useState("success");

  useEffect(() => {
    if (location.state?.loginSuccess) {
      setToastMessage("Đăng nhập thành công");
      setToastBg("success");
      setShowToast(true);
      window.history.replaceState({}, document.title); // xóa state để không lặp lại
    } else if (location.state?.logoutSuccess) {
      setToastMessage("Đăng xuất thành công");
      setToastBg("info");
      setShowToast(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  if (loading)
    return (
      <Container className="py-4">
        <Spinner animation="border" /> Đang tải trang chủ...
      </Container>
    );
  if (error)
    return (
      <Container className="py-4">
        <Alert variant="danger">Lỗi: {error}</Alert>
      </Container>
    );

  const { hero, featuredProducts } = data || {};

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
            <CategoriesRow
              selectedCategoryId={categoryId}
              onSelectCategory={setCategoryId}
            />
          </Col>
          <Col lg={9}>
            <div className="search-container">
              <SearchBar onSearch={setKeyword} />
            </div>
            <div className="section-header">
              <h2 className="section-title">Danh sách sản phẩm</h2>
              <p className="section-subtitle">
                Khám phá các sản phẩm phù hợp với nhu cầu của bạn
              </p>
            </div>

            <ProductList keyword={keyword} categoryId={categoryId} />

            <div className="section-header mt-5">
              <h2 className="section-title">Sản phẩm nổi bật</h2>
              <p className="section-subtitle">
                Khám phá những sản phẩm được yêu thích nhất
              </p>
            </div>
            <div className="products-grid mb-5">
              {(featuredProducts || []).map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </Col>
        </Row>
      </Container>
      <Footer />

      {/* ✅ Toast thông báo đăng nhập/đăng xuất thành công */}
      <ToastContainer position="top-end" className="p-3">
        <Toast
          bg={toastBg}
          onClose={() => setShowToast(false)}
          show={showToast}
          delay={2000}
          autohide
        >
          <Toast.Header>
            <strong className="me-auto">Thông báo</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default App;
