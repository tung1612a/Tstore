"use client"

import React from "react"
import { Card, Badge, Button } from "react-bootstrap"
import { FiHeart, FiShoppingCart, FiStar, FiEdit } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import { addToCart, addToCartLocal } from "../../store/cartSlice"
import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import { useToast } from '../../contexts/ToastContext';

function ProductCard({ product, hideStoreButton = false }) {
  const price = product.price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
  const [isLiked, setIsLiked] = React.useState(false)
  const [isAddingToCart, setIsAddingToCart] = React.useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useAuth()
  const { t } = useTranslation();
  const { showWarning, showError } = useToast();

  // Kiểm tra xem user hiện tại có phải là seller của sản phẩm này không
  const isOwnProduct = React.useMemo(() => {
    if (!user || !isAuthenticated || user.role !== 'seller') {
      return false
    }
    
    const userId = user._id || user.id
    const sellerId = product.sellerId?._id || product.sellerId || product.seller?._id || product.seller
    
    // So sánh dạng string để đảm bảo chính xác
    return userId && sellerId && String(userId) === String(sellerId)
  }, [user, isAuthenticated, product.sellerId, product.seller])

  // Lấy stock từ product (ưu tiên stock, sau đó inventoryQuantity)
  const stock = product.stock ?? product.inventoryQuantity ?? 0;
  const isOutOfStock = stock === 0;

  // Helper function for adding to cart
  const handleAddToCart = async (e) => {
    e.stopPropagation()

    if (isAddingToCart) return

    // Kiểm tra nếu hết hàng
    if (isOutOfStock) {
      showWarning('Sản phẩm đã hết hàng!')
      return
    }

    // Kiểm tra nếu chưa đăng nhập
    if (!isAuthenticated) {
      // alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!')
      navigate('/login', { state: { loginRequired: true } })
      return
    }

    // Kiểm tra nếu seller cố mua sản phẩm của chính mình
    if (isOwnProduct) {
      showWarning('Bạn không thể mua sản phẩm của chính mình!')
      return
    }

    setIsAddingToCart(true)

    try {
      // Tạo payload với đầy đủ thông tin sản phẩm
      const cartPayload = {
        productId: product._id,
        quantity: 1,
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
    } catch (error) {
      console.error('Error adding to cart:', error)
      showError('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng')
    } finally {
      setIsAddingToCart(false)
    }
  }

  return (
    <Card className="product-card h-100">
      <div
        className="position-relative"
        style={{ cursor: "pointer" }}
        onClick={() => navigate(`/product/${product._id}`)}
      >
        {product.image || product.imageURL ? (
          <Card.Img
            variant="top"
            src={product.image || product.imageURL}
            alt={product.title}
            style={{ height: 220, objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              height: 220,
              background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6c757d",
              fontSize: "14px",
            }}
          >
            {t('productCard.1')}
          </div>
        )}
        <Button
          variant="light"
          size="sm"
          className="position-absolute top-0 end-0 m-2 rounded-circle p-2"
          style={{
            background: "rgba(255,255,255,0.9)",
            border: "none",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={(e) => {
            e.stopPropagation()
            setIsLiked(!isLiked)
          }}
        >
          <FiHeart size={16} color={isLiked ? "#ee4d2d" : "#6c757d"} fill={isLiked ? "#ee4d2d" : "none"} />
        </Button>
        {/* Badge hết hàng */}
        {isOutOfStock && (
          <Badge bg="danger" className="position-absolute top-0 start-0 m-2" style={{ fontSize: "12px", fontWeight: "600" }}>
            Hết hàng
          </Badge>
        )}
      </div>

      <Card.Body className="d-flex flex-column">
        <Card.Title
          className="h6 text-truncate mb-2"
          title={product.title}
          style={{
            color: "#2c3e50",
            fontSize: "14px",
            lineHeight: "1.4",
            cursor: "pointer",
          }}
          onClick={() => navigate(`/product/${product._id}`)}
        >
          {product.title}
        </Card.Title>

        {product.storeInfo?.storeName ? (
          <div className="text-muted mb-2" style={{ fontSize: "12px" }}>
            {t('productCard.2')} {product.storeInfo.storeName}
          </div>
        ) : ((product.sellerId?.fullName || product.seller?.fullName) && (
          <div className="text-muted mb-2" style={{ fontSize: "12px" }}>
            {t('productCard.3')} {product.sellerId?.fullName || product.seller?.fullName}
          </div>
        ))}

        <div className="d-flex align-items-center mb-2">
          <div className="d-flex align-items-center me-2">
            <FiStar size={14} color="#ffc107" fill="#ffc107" />
            <FiStar size={14} color="#ffc107" fill="#ffc107" />
            <FiStar size={14} color="#ffc107" fill="#ffc107" />
            <FiStar size={14} color="#ffc107" fill="#ffc107" />
            <FiStar size={14} color="#e9ecef" />
            <span className="ms-1 text-muted" style={{ fontSize: "12px" }}>
              (128)
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <div className="text-danger fw-bold fs-5">{price}</div>
            {/* <div className="text-muted text-decoration-line-through" style={{ fontSize: "12px" }}>
              {product.price && (product.price * 1.25).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
            </div> */}
          </div>
          {stock !== undefined && stock !== null && (
            <div className={isOutOfStock ? "text-danger fw-bold" : "text-muted"} style={{ fontSize: "12px" }}>
              {isOutOfStock ? "Hết hàng" : `${t('productCard.4')} ${stock} ${t('productCard.5')}`}
            </div>
          )}
        </div>

        {isOwnProduct ? (
          <Button
            variant="primary"
            size="sm"
            className="w-100 d-flex align-items-center justify-content-center"
            onClick={(e) => {
              e.stopPropagation();
              navigate('/seller/products', { state: { editProduct: product } });
            }}
            style={{
              background: "linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%)",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            <FiEdit className="me-2" size={16} />
            Chỉnh sửa sản phẩm
          </Button>
        ) : (
          <Button
            variant={!isAuthenticated ? "outline-primary" : isOutOfStock ? "secondary" : "primary"}
            size="sm"
            className="w-100 d-flex align-items-center justify-content-center"
            disabled={isAddingToCart || isOutOfStock}
            style={{
              background: !isAuthenticated
                ? "transparent"
                : isOutOfStock
                  ? "#6c757d"
                  : isAddingToCart
                    ? "#6c757d"
                    : "linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%)",
              border: !isAuthenticated ? "2px solid #007bff" : "none",
              borderRadius: "8px",
              fontWeight: "600",
              opacity: isOutOfStock ? 0.6 : 1,
              cursor: isOutOfStock ? "not-allowed" : "pointer",
            }}
            onClick={handleAddToCart}
          >
            <FiShoppingCart className="me-2" size={16} />
            {isOutOfStock
              ? "Hết hàng"
              : !isAuthenticated
                ? (t('productCard.7'))
                : isAddingToCart
                  ? (t('productCard.8'))
                  : (t('productCard.9'))
            }
          </Button>
        )}
        {(product.sellerId?._id || product.sellerId) && !hideStoreButton && !isOwnProduct && (
          <Button
            variant="outline-secondary"
            size="sm"
            className="w-100 mt-2"
            onClick={(e) => { e.stopPropagation(); navigate(`/store/${product.sellerId?._id || product.sellerId}`) }}
          >
            {t('productCard.10')}
          </Button>
        )}
      </Card.Body>
    </Card>
  )
}

export default ProductCard
