import React from 'react';
import { Card, Badge } from 'react-bootstrap';

function ProductCard({ product }) {
  const price = product.price?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
  return (
    <Card className="product-card h-100">
      {product.imageURL ? (
        <Card.Img variant="top" src={product.imageURL} alt={product.title} style={{ height: 200, objectFit: 'cover' }} />
      ) : (
        <div style={{ height: 200, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Không có ảnh</div>
      )}
      <Card.Body>
        <Card.Title className="h6 text-truncate" title={product.title}>{product.title}</Card.Title>
        <div className="d-flex align-items-center justify-content-between">
          <span className="text-danger fw-bold">{price}</span>
          <Badge bg="warning" text="dark">Yêu thích</Badge>
        </div>
      </Card.Body>
    </Card>
  );
}

export default ProductCard;


