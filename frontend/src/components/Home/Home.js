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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      setToastMessage(t("toast.1"));
      setToastBg("success");
      setShowToast(true);
      window.history.replaceState({}, document.title); // xóa state để không lặp lại
    } else if (location.state?.logoutSuccess) {
      setToastMessage(t("toast.2"));
      setToastBg("info");
      setShowToast(true);
      window.history.replaceState({}, document.title);
    }
  }, [location, t]);

  if (loading)
    return (
      <Container className="py-4">
        <Spinner animation="border" /> {t("toast.3")}
      </Container>
    );
  if (error)
    return (
      <Container className="py-4">
        <Alert variant="danger">Lỗi: {error}</Alert>
      </Container>
    );

  const { featuredProducts, stats } = data || {};

  return (
    <>
      <SiteNavbar />
      <div className="home-wrapper">
        {/* Decorative Background Elements */}
        <div className="bg-decoration">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
        </div>

        <Container className="py-5">
          <div className="hero-section mb-5 fade-in-up">
            <HeroCarousel />
          </div>

          {/* Stats Section */}
          {/* {stats && (
            <div className="stats-section mb-5 fade-in-up" style={{ animationDelay: '0.1s' }}>
              <Row className="g-4">
                <Col md={4}>
                  <div className="stat-card-modern">
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">📦</div>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{stats.totalProducts?.toLocaleString() || '0'}</div>
                      <div className="stat-label">Sản phẩm</div>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="stat-card-modern">
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">🏷️</div>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{stats.totalCategories?.toLocaleString() || '0'}</div>
                      <div className="stat-label">Danh mục</div>
                    </div>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="stat-card-modern">
                    <div className="stat-icon-wrapper">
                      <div className="stat-icon">🏪</div>
                    </div>
                    <div className="stat-content">
                      <div className="stat-number">{stats.totalStores?.toLocaleString() || '0'}</div>
                      <div className="stat-label">Cửa hàng</div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
          )} */}

          <div className="welcome-section mb-5 fade-in-up" style={{ animationDelay: stats ? '0.2s' : '0.1s' }}>
            <Row>
              <Col>
                <div className="welcome-content text-center">
                  <div className="welcome-badge">{t('toast.11')}</div>
                  <h1 className="welcome-title mb-3">{t('toast.12')}</h1>
                  <p className="welcome-subtitle">{t('toast.10')}</p>
                </div>
              </Col>
            </Row>
          </div>

          <Row className="g-4">
            <Col lg={3} className="mb-4">
              <div className="category-wrapper fade-in-up" style={{ animationDelay: stats ? '0.3s' : '0.2s' }}>
                <CategoriesRow
                  selectedCategoryId={categoryId}
                  onSelectCategory={setCategoryId}
                />
              </div>
            </Col>
            <Col lg={9}>
              <div className="search-wrapper fade-in-up mb-4" style={{ animationDelay: stats ? '0.4s' : '0.3s' }}>
                <div className="search-container-modern">
                  <div className="search-icon-wrapper">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                  </div>
                  <SearchBar onSearch={setKeyword} />
                </div>
              </div>

              <div className="section-header-modern fade-in-up mb-5" style={{ animationDelay: stats ? '0.5s' : '0.4s' }}>
                <div className="section-title-wrapper">
                  <h2 className="section-title-modern">{t('toast.4')}</h2>
                </div>
                <p className="section-subtitle-modern">
                  {t('toast.5')}
                </p>
              </div>

              <div className="fade-in-up" style={{ animationDelay: stats ? '0.6s' : '0.5s' }}>
                <ProductList keyword={keyword} categoryId={categoryId} />
              </div>

              {featuredProducts && featuredProducts.length > 0 && (
                <>
                  <div className="section-header-modern mt-5 mb-5 fade-in-up" style={{ animationDelay: stats ? '0.7s' : '0.6s' }}>
                    <div className="section-title-wrapper">
                      <h2 className="section-title-modern">{t('toast.6')}</h2>
                    </div>
                    <p className="section-subtitle-modern">
                      {t('toast.7')}
                    </p>
                  </div>
                  <div className="products-grid-modern mb-5 fade-in-up" style={{ animationDelay: stats ? '0.8s' : '0.7s' }}>
                    {(featuredProducts || []).map((p, index) => (
                      <div key={p._id} className="product-card-wrapper" style={{ animationDelay: `${(stats ? 0.9 : 0.8) + index * 0.1}s` }}>
                        <ProductCard product={p} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Col>
          </Row>
        </Container>
      </div>
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
            <strong className="me-auto">{t('toast.8')}</strong>
          </Toast.Header>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}

export default App;
