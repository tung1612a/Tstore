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
  Form,
  Button,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { useLocation } from "react-router-dom";

import SiteNavbar from "../Navbar";
import HeroCarousel from "../HeroCarousel";
import Footer from "../Footer";
import CategoriesRow from "../CategoriesRow";
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
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [priceError, setPriceError] = useState("");

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

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchKeyword = params.get('keyword') || '';
    setKeyword(searchKeyword);
  }, [location.search]);

  const handlePriceChange = (field) => (event) => {
    const rawValue = event.target.value;
    if (rawValue === "") {
      setPriceRange((prev) => ({ ...prev, [field]: "" }));
      return;
    }

    const numericValue = Math.max(0, Number(rawValue));
    setPriceRange((prev) => ({
      ...prev,
      [field]: Number.isNaN(numericValue) ? "" : numericValue,
    }));
  };

  useEffect(() => {
    const min = priceRange.min === "" ? null : Number(priceRange.min);
    const max = priceRange.max === "" ? null : Number(priceRange.max);

    if (min !== null && max !== null && min > max) {
      setPriceError("Giá tối thiểu không được lớn hơn giá tối đa");
    } else {
      setPriceError("");
    }
  }, [priceRange.min, priceRange.max]);

  const handleClearPrice = () => {
    setPriceRange({ min: "", max: "" });
    setPriceError("");
  };

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

          {/* <div className="welcome-section mb-5 fade-in-up" style={{ animationDelay: stats ? '0.2s' : '0.1s' }}>
            <Row>
              <Col>
                <div className="welcome-content text-center">
                  <div className="welcome-badge">{t('toast.11')}</div>
                  <h1 className="welcome-title mb-3">{t('toast.12')}</h1>
                  <p className="welcome-subtitle">{t('toast.10')}</p>
                </div>
              </Col>
            </Row>
          </div> */}

          <Row className="g-4 align-items-stretch filters-row">
            <Col xs={12} lg={9}>
              <div className="category-horizontal-wrapper fade-in-up h-100" style={{ animationDelay: stats ? '0.3s' : '0.2s' }}>
                <CategoriesRow
                  selectedCategoryId={categoryId}
                  onSelectCategory={setCategoryId}
                />
              </div>
            </Col>
            <Col xs={12} lg={3}>
              <div className="price-filter-wrapper fade-in-up" style={{ animationDelay: stats ? '0.4s' : '0.3s' }}>
                <div className="price-filter-bar">
                  <Form className="price-filter-form">
                    <Form.Group controlId="min-price" className="price-filter-group">
                      <Form.Label>{t('toast.13')}</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        placeholder="0"
                        value={priceRange.min}
                        onChange={handlePriceChange("min")}
                      />
                    </Form.Group>
                    <Form.Group controlId="max-price" className="price-filter-group">
                      <Form.Label>{t('toast.14')}</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        placeholder={t('toast.15')}
                        value={priceRange.max}
                        onChange={handlePriceChange("max")}
                      />
                    </Form.Group>
                    <div className="price-filter-actions">
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="tooltip-clear-price">Xóa bộ lọc giá</Tooltip>}
                      >
                        <span>
                          <Button
                            type="button"
                            variant="outline-secondary"
                            onClick={handleClearPrice}
                            disabled={!priceRange.min && !priceRange.max}
                          >
                            {t('toast.16')}
                          </Button>
                        </span>
                      </OverlayTrigger>
                    </div>
                  </Form>
                  {priceError && <div className="price-filter-error">{priceError}</div>}
                </div>
              </div>
            </Col>
          </Row>

          <Row className="g-4 mt-2">
            <Col xs={12}>
              <div className="section-header-modern fade-in-up mb-3" style={{ animationDelay: stats ? '0.5s' : '0.4s' }}>
                  <h2 className="section-title-modern">{t('toast.4')}</h2>
                <p className="section-subtitle-modern">
                  {t('toast.5')}
                </p>
              </div>
            </Col>
            <Col xs={12}>
              <div className="fade-in-up" style={{ animationDelay: stats ? '0.6s' : '0.5s' }}>
                <ProductList
                  keyword={keyword}
                  categoryId={categoryId}
                  priceRange={priceRange}
                />
              </div>
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
