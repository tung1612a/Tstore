"use client"

import React from "react"
import { Card, Badge, Button } from "react-bootstrap"
import { FiHeart, FiShoppingCart, FiStar } from "react-icons/fi"
import { useNavigate } from "react-router-dom"
import { useCart } from "../../hooks/useCart"

function ProductCard({ product }) {
  const price = product.price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })
  const [isLiked, setIsLiked] = React.useState(false)
  const [isAddingToCart, setIsAddingToCart] = React.useState(false)
  const navigate = useNavigate()
  const { addItem } = useCart()

  // Helper function for adding to cart
  const handleAddToCart = async (e) => {
    e.stopPropagation()
    
    if (isAddingToCart) return
    
    setIsAddingToCart(true)
    
    try {
      addItem(product, 1)
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng')
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
            Không có ảnh
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
        <Badge bg="danger" className="position-absolute top-0 start-0 m-2" style={{ fontSize: "10px" }}>
          -20%
        </Badge>
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
            Cửa hàng: {product.storeInfo.storeName}
          </div>
        ) : ( (product.sellerId?.fullName || product.seller?.fullName) && (
          <div className="text-muted mb-2" style={{ fontSize: "12px" }}>
            Người bán: {product.sellerId?.fullName || product.seller?.fullName}
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
            <div className="text-muted text-decoration-line-through" style={{ fontSize: "12px" }}>
              {product.price && (product.price * 1.25).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
            </div>
          </div>
          {typeof product.inventoryQuantity === 'number' && (
            <div className="text-muted" style={{ fontSize: "12px" }}>
              Còn {product.inventoryQuantity} sản phẩm
            </div>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          className="w-100 d-flex align-items-center justify-content-center"
          disabled={isAddingToCart}
          style={{
            background: isAddingToCart 
              ? "#6c757d" 
              : "linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%)",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
          }}
          onClick={handleAddToCart}
        >
          <FiShoppingCart className="me-2" size={16} />
          {isAddingToCart ? 'Đang thêm...' : 'Thêm vào giỏ'}
        </Button>
        {(product.sellerId?._id || product.sellerId) && (
          <Button
            variant="outline-secondary"
            size="sm"
            className="w-100 mt-2"
            onClick={(e) => { e.stopPropagation(); navigate(`/store/${product.sellerId?._id || product.sellerId}`) }}
          >
            Xem cửa hàng
          </Button>
        )}
      </Card.Body>
    </Card>
  )
}

export default ProductCard
