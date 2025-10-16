import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi';

function ProductCard({ product }) {
  const price = product.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  const [isLiked, setIsLiked] = React.useState(false);
  
  return (
    <Card className="product-card h-100">
      <div className="position-relative">
        {product.imageURL ? (
          <Card.Img 
            variant="top" 
            src={product.imageURL} 
            alt={product.title} 
            style={{ height: 220, objectFit: 'cover' }} 
          />
        ) : (
          <div 
            style={{ 
              height: 220, 
              background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: '#6c757d',
              fontSize: '14px'
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
            background: 'rgba(255,255,255,0.9)', 
            border: 'none',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onClick={() => setIsLiked(!isLiked)}
        >
          <FiHeart 
            size={16} 
            color={isLiked ? '#ee4d2d' : '#6c757d'} 
            fill={isLiked ? '#ee4d2d' : 'none'}
          />
        </Button>
        <Badge 
          bg="danger" 
          className="position-absolute top-0 start-0 m-2"
          style={{ fontSize: '10px' }}
        >
          -20%
        </Badge>
      </div>
      
      <Card.Body className="d-flex flex-column">
        <Card.Title 
          className="h6 text-truncate mb-2" 
          title={product.title}
          style={{ color: '#2c3e50', fontSize: '14px', lineHeight: '1.4' }}
        >
          {product.title}
        </Card.Title>
        
        <div className="d-flex align-items-center mb-2">
          <div className="d-flex align-items-center me-2">
            <FiStar size={14} color="#ffc107" fill="#ffc107" />
            <FiStar size={14} color="#ffc107" fill="#ffc107" />
            <FiStar size={14} color="#ffc107" fill="#ffc107" />
            <FiStar size={14} color="#ffc107" fill="#ffc107" />
            <FiStar size={14} color="#e9ecef" />
            <span className="ms-1 text-muted" style={{ fontSize: '12px' }}>(128)</span>
          </div>
        </div>
        
        <div className="d-flex align-items-center justify-content-between mb-3">
          <div>
            <div className="text-danger fw-bold fs-5">{price}</div>
            <div className="text-muted text-decoration-line-through" style={{ fontSize: '12px' }}>
              {product.price && (product.price * 1.25).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
            </div>
          </div>
        </div>
        
        <Button 
          variant="primary" 
          size="sm" 
          className="w-100 d-flex align-items-center justify-content-center"
          style={{ 
            background: 'linear-gradient(135deg, #ee4d2d 0%, #ff6b35 100%)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '600'
          }}
        >
          <FiShoppingCart className="me-2" size={16} />
          Thêm vào giỏ
        </Button>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;


