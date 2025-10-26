"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Container, Row, Col, Button, Badge, Spinner, Alert, Breadcrumb } from "react-bootstrap"
import { useAuth } from "../../contexts/AuthContext"
import { useSelector, useDispatch } from "react-redux"
import { addToCart, addToCartLocal } from "../../store/cartSlice"
import {
    FiHeart,
    FiShoppingCart,
    FiStar,
    FiMinus,
    FiPlus,
    FiArrowLeft,
    FiTruck,
    FiShield,
    FiRefreshCw,
    FiHome,
    FiChevronLeft,
} from "react-icons/fi"
import "./ProductDetail.css"
import Footer from "../Footer"
function ProductDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user, isAuthenticated } = useAuth()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [isLiked, setIsLiked] = useState(false)
    const [selectedImage, setSelectedImage] = useState(0)
    const [isAddingToCart, setIsAddingToCart] = useState(false)

    // Redux state
    const cartItems = useSelector(state => state.cart.items)
    const dispatch = useDispatch()

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`/api/products/${id}`)
                if (!response.ok) {
                    throw new Error(`Lỗi HTTP: ${response.status}`)
                }
                const data = await response.json()
                setProduct(data)
            } catch (err) {
                setError(err.message)
            } finally {
                setLoading(false)
            }
        }

        fetchProduct()
    }, [id])

    const handleQuantityChange = (delta) => {
        setQuantity(Math.max(1, quantity + delta))
    }

    // Kiểm tra xem user hiện tại có phải là seller của sản phẩm này không
    const isOwnProduct = user && user.role === 'seller' && (
        product?.sellerId?._id === user._id ||
        product?.sellerId === user._id ||
        product?.seller?._id === user._id ||
        product?.seller === user._id
    )

    const handleAddToCart = async () => {
        // Kiểm tra nếu chưa đăng nhập
        if (!isAuthenticated) {
            alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!')
            navigate('/login')
            return
        }

        // Kiểm tra nếu seller cố mua sản phẩm của chính mình
        if (isOwnProduct) {
            alert('Bạn không thể mua sản phẩm của chính mình!')
            return
        }

        if (isAddingToCart) return

        setIsAddingToCart(true)

        try {
            // Tạo payload với đầy đủ thông tin sản phẩm
            const cartPayload = {
                productId: product._id,
                quantity: quantity,
                product: {
                    _id: product._id,
                    title: product.title,
                    price: product.price,
                    image: product.image || product.imageURL,
                    imageURL: product.imageURL || product.image
                }
            }

            try {
                await dispatch(addToCart(cartPayload)).unwrap()
            } catch (apiError) {
                console.warn('API failed, using local cart:', apiError)
                // Fallback to local cart if API fails
                dispatch(addToCartLocal(cartPayload))
            }

            alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`)
        } catch (error) {
            console.error('Error adding to cart:', error)
            alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng')
        } finally {
            setIsAddingToCart(false)
        }
    }

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
                <p className="mt-3 text-muted">Đang tải thông tin sản phẩm...</p>
            </Container>
        )
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">
                    <Alert.Heading>Không thể tải sản phẩm</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={() => navigate("/")}>
                        <FiArrowLeft className="me-2" />
                        Quay về trang chủ
                    </Button>
                </Alert>
            </Container>
        )
    }

    if (!product) {
        return (
            <Container className="py-5">
                <Alert variant="warning">
                    <Alert.Heading>Không tìm thấy sản phẩm</Alert.Heading>
                    <Button variant="outline-warning" onClick={() => navigate("/")}>
                        <FiArrowLeft className="me-2" />
                        Quay về trang chủ
                    </Button>
                </Alert>
            </Container>
        )
    }

    const price = product.price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
    const originalPrice =
        product.price && (product.price * 1.25).toLocaleString("vi-VN", { style: "currency", currency: "VND" })

    // Mock images array - in real app, product would have multiple images
    const mainImage = product.image || product.imageURL
    const images = mainImage ? [mainImage, mainImage, mainImage] : []

    return (
        <div className="product-detail-page">
            {/* Sticky Navigation Bar */}
            <div
                className="bg-white border-bottom shadow-sm sticky-top"
                style={{ zIndex: 1000 }}
            >
                <Container className="py-3">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <Button
                                variant="outline-secondary"
                                onClick={() => navigate(-1)}
                                className="d-flex align-items-center me-3"
                                size="sm"
                            >
                                <FiChevronLeft className="me-1" />
                                Quay lại
                            </Button>
                            <Button
                                variant="outline-primary"
                                onClick={() => navigate("/")}
                                className="d-flex align-items-center"
                                size="sm"
                            >
                                <FiHome className="me-1" />
                                Trang chủ
                            </Button>
                        </div>
                        <div className="d-flex align-items-center">
                            <h5 className="mb-0 text-muted">{product.title}</h5>
                        </div>
                        <div className="d-flex align-items-center">
                            <Button
                                variant="outline-danger"
                                size="sm"
                                className="me-2"
                                onClick={() => setIsLiked(!isLiked)}
                            >
                                <FiHeart size={16} fill={isLiked ? "#ee4d2d" : "none"} />
                            </Button>
                            <Button
                                variant="outline-info"
                                size="sm"
                                className="me-2 position-relative"
                                onClick={() => navigate('/cart')}
                            >
                                <FiShoppingCart size={16} />
                                {cartItems.length > 0 && (
                                    <Badge
                                        bg="danger"
                                        className="position-absolute top-0 start-100 translate-middle rounded-pill"
                                        style={{ fontSize: '8px', minWidth: '16px', height: '16px' }}
                                    >
                                        {cartItems.length}
                                    </Badge>
                                )}
                            </Button>
                            <Button
                                variant={!isAuthenticated ? "outline-primary" : isOwnProduct ? "secondary" : "primary"}
                                size="sm"
                                onClick={handleAddToCart}
                                disabled={isOwnProduct || isAddingToCart}
                                style={{
                                    background: !isAuthenticated
                                        ? "transparent"
                                        : isOwnProduct
                                            ? "#6c757d"
                                            : isAddingToCart
                                                ? "#6c757d"
                                                : "linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%)",
                                    border: !isAuthenticated ? "2px solid #007bff" : "none",
                                }}
                            >
                                <FiShoppingCart className="me-1" size={16} />
                                {!isAuthenticated
                                    ? 'Đăng nhập'
                                    : isOwnProduct
                                        ? 'Sản phẩm của bạn'
                                        : isAddingToCart
                                            ? 'Đang thêm...'
                                            : 'Thêm vào giỏ'
                                }
                            </Button>
                        </div>
                    </div>
                </Container>
            </div>

            <Container className="py-4">

                {/* Breadcrumb */}
                <Breadcrumb className="mb-4">
                    <Breadcrumb.Item onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                        Trang chủ
                    </Breadcrumb.Item>
                    <Breadcrumb.Item onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
                        Danh sách sản phẩm
                    </Breadcrumb.Item>
                    <Breadcrumb.Item active>{product.title}</Breadcrumb.Item>
                </Breadcrumb>

                <Row className="g-4">
                    {/* Product Images */}
                    <Col lg={6}>
                        <div className="product-images">
                            <div className="main-image-container mb-3">
                                {images.length > 0 ? (
                                    <img src={images[selectedImage] || "/placeholder.svg"} alt={product.title} className="main-image" />
                                ) : (
                                    <div className="no-image-placeholder">
                                        <span>Không có ảnh</span>
                                    </div>
                                )}
                                <Badge bg="danger" className="discount-badge">
                                    -20%
                                </Badge>
                            </div>

                            {images.length > 1 && (
                                <div className="thumbnail-container">
                                    {images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            className={`thumbnail ${selectedImage === idx ? "active" : ""}`}
                                            onClick={() => setSelectedImage(idx)}
                                        >
                                            <img src={img || "/placeholder.svg"} alt={`${product.title} ${idx + 1}`} />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </Col>

                    {/* Product Info */}
                    <Col lg={6}>
                        <div className="product-info">
                            <h1 className="product-title">{product.title}</h1>

                            {/* Rating */}
                            <div className="rating-section mb-3">
                                <div className="d-flex align-items-center">
                                    <div className="stars me-2">
                                        {[...Array(5)].map((_, i) => (
                                            <FiStar key={i} size={18} color="#ffc107" fill={i < 4 ? "#ffc107" : "none"} />
                                        ))}
                                    </div>
                                    <span className="rating-text">4.0</span>
                                    <span className="text-muted ms-2">(128 đánh giá)</span>
                                    <span className="text-muted ms-3">| Đã bán: 1.2k</span>
                                </div>
                            </div>

                            {/* Price */}
                            <div className="price-section mb-4">
                                <div className="d-flex align-items-center">
                                    <span className="current-price">{price}</span>
                                    <span className="original-price ms-3">{originalPrice}</span>
                                    <Badge bg="danger" className="ms-3">
                                        Giảm 20%
                                    </Badge>
                                    {typeof product.inventoryQuantity === 'number' && (
                                        <span className="ms-3 text-muted" style={{ fontSize: '14px' }}>
                                            Còn {product.inventoryQuantity} sản phẩm
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="description-section mb-4">
                                <h5 className="section-title">Mô tả sản phẩm</h5>
                                <p className="text-muted">
                                    {product.description ||
                                        "Sản phẩm chất lượng cao, được nhiều khách hàng tin dùng. Đảm bảo chính hãng 100%, giao hàng nhanh chóng trên toàn quốc."}
                                </p>
                                {product.storeInfo?.storeName ? (
                                    <div className="mt-2 text-muted" style={{ fontSize: "14px" }}>
                                        Cửa hàng: <strong>{product.storeInfo.storeName}</strong>
                                    </div>
                                ) : ((product.sellerId?.fullName || product.seller?.fullName) && (
                                    <div className="mt-2 text-muted" style={{ fontSize: "14px" }}>
                                        Người bán: <strong>{product.sellerId?.fullName || product.seller?.fullName}</strong>
                                    </div>
                                ))}
                            </div>

                            {/* Quantity Selector */}
                            <div className="quantity-section mb-4">
                                <h5 className="section-title mb-3">Số lượng</h5>
                                <div className="quantity-selector">
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={() => handleQuantityChange(-1)}
                                        disabled={quantity <= 1}
                                    >
                                        <FiMinus />
                                    </Button>
                                    <input type="text" value={quantity} readOnly className="quantity-input" />
                                    <Button variant="outline-secondary" size="sm" onClick={() => handleQuantityChange(1)}>
                                        <FiPlus />
                                    </Button>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="action-buttons mb-4">
                                <div className="d-flex gap-2">
                                    <Button
                                        variant={!isAuthenticated ? "outline-primary" : isOwnProduct ? "secondary" : "primary"}
                                        size="lg"
                                        className="add-to-cart-btn flex-grow-1"
                                        onClick={handleAddToCart}
                                        disabled={isOwnProduct || isAddingToCart}
                                        style={{
                                            background: !isAuthenticated
                                                ? "transparent"
                                                : isOwnProduct
                                                    ? "#6c757d"
                                                    : isAddingToCart
                                                        ? "#6c757d"
                                                        : "linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%)",
                                            border: !isAuthenticated ? "2px solid #007bff" : "none",
                                        }}
                                    >
                                        <FiShoppingCart className="me-2" size={20} />
                                        {!isAuthenticated
                                            ? 'Đăng nhập để mua'
                                            : isOwnProduct
                                                ? 'Sản phẩm của bạn'
                                                : isAddingToCart
                                                    ? 'Đang thêm...'
                                                    : 'Thêm vào giỏ hàng'
                                        }
                                    </Button>
                                    {(product.sellerId?._id || product.sellerId) && (
                                        <Button
                                            variant="outline-secondary"
                                            size="lg"
                                            onClick={() => navigate(`/store/${product.sellerId?._id || product.sellerId}`)}
                                        >
                                            Xem cửa hàng
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* Features */}
                            <div className="features-section">
                                <div className="feature-item">
                                    <FiTruck size={24} className="feature-icon" />
                                    <div>
                                        <div className="feature-title">Miễn phí vận chuyển</div>
                                        <div className="feature-desc">Cho đơn hàng từ 500.000đ</div>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <FiShield size={24} className="feature-icon" />
                                    <div>
                                        <div className="feature-title">Bảo hành chính hãng</div>
                                        <div className="feature-desc">12 tháng bảo hành</div>
                                    </div>
                                </div>
                                <div className="feature-item">
                                    <FiRefreshCw size={24} className="feature-icon" />
                                    <div>
                                        <div className="feature-title">Đổi trả dễ dàng</div>
                                        <div className="feature-desc">Trong vòng 7 ngày</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>

                {/* Product Details Section */}
                <Row className="mt-5">
                    <Col>
                        <div className="product-details-section">
                            <h3 className="mb-4">Chi tiết sản phẩm</h3>
                            <div className="details-grid">
                                <div className="detail-row">
                                    <span className="detail-label">Danh mục:</span>
                                    <span className="detail-value">{product.category || "Chưa phân loại"}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Thương hiệu:</span>
                                    <span className="detail-value">Chính hãng</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Xuất xứ:</span>
                                    <span className="detail-value">Việt Nam</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Tình trạng:</span>
                                    <span className="detail-value">
                                        <Badge bg="success">Còn hàng</Badge>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
            <Footer />
        </div>
    )
}

export default ProductDetail
