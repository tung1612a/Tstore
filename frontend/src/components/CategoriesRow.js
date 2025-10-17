import React from 'react';
import { Card, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { FiGrid, FiSmartphone, FiMonitor, FiHeadphones, FiWatch, FiCamera, FiHome } from 'react-icons/fi';
import { FaGamepad } from 'react-icons/fa';

const categoryIcons = {
  'Điện thoại': FiSmartphone,
  'Laptop': FiMonitor,
  'Tai nghe': FiHeadphones,
  'Đồng hồ': FiWatch,
  'Máy ảnh': FiCamera,
  'Gaming': FaGamepad,
  'Nhà cửa': FiHome,
  'default': FiGrid
};

function CategoriesRow({ selectedCategoryId, onSelectCategory }) {
  const [categories, setCategories] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetch('/api/categories')
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load categories');
        const json = await res.json();
        if (isMounted) setCategories(json);
      })
      .catch((err) => isMounted && setError(err.message))
      .finally(() => isMounted && setLoading(false));
    return () => { isMounted = false; };
  }, []);

  if (loading) return (
    <Card className="category-sidebar">
      <Card.Body className="text-center">
        <Spinner animation="border" size="sm" />
        <div className="mt-2">Đang tải...</div>
      </Card.Body>
    </Card>
  );
  
  if (error) return (
    <Card className="category-sidebar">
      <Card.Body>
        <Alert variant="warning" className="mb-0">{error}</Alert>
      </Card.Body>
    </Card>
  );

  return (
    <Card className="category-sidebar">
      <Card.Body>
        <Card.Title className="h5 d-flex align-items-center">
          <FiGrid className="me-2" />
          Danh mục sản phẩm
        </Card.Title>
        <ListGroup variant="flush">
          <ListGroup.Item
            key="all"
            action
            href="#"
            className={`category-item d-flex align-items-center ${!selectedCategoryId ? 'active' : ''}`}
            onClick={(e) => { e.preventDefault(); onSelectCategory?.(''); }}
          >
            Tất cả
          </ListGroup.Item>
          {categories.map((c) => {
            const IconComponent = categoryIcons[c.name] || categoryIcons.default;
            return (
              <ListGroup.Item 
                key={c._id} 
                action 
                href="#" 
                className={`category-item d-flex align-items-center ${selectedCategoryId === c._id ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); onSelectCategory?.(c._id); }}
              >
                <IconComponent className="me-2" size={18} />
                {c.name}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}

export default CategoriesRow;


