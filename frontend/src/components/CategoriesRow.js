import React from 'react';
import { Card, Spinner, Alert, ListGroup } from 'react-bootstrap';
import { FiGrid, FiSmartphone, FiMonitor, FiHeadphones, FiWatch, FiCamera, FiHome } from 'react-icons/fi';
import { FaGamepad } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  

  React.useEffect(() => {
    let isMounted = true;
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
        <Card.Title className="h5 d-flex align-items-center mb-3">
          <FiGrid className="me-2" />
          {t('categories.1')}
        </Card.Title>
        <ListGroup variant="flush">
          {/* Nút Tất cả */}
          <ListGroup.Item
            key="all"
            action
            className={`category-item d-flex align-items-center ${selectedCategoryId === '' ? 'active' : ''}`}
            onClick={() => onSelectCategory('')}
          >
            <FiGrid className="me-2" size={18} />
            {t('categories.1')}
          </ListGroup.Item>

          {/* Danh sách động */}
          {categories.map((c) => {
            const IconComponent = categoryIcons[c.name] || categoryIcons.default;
            const isActive = selectedCategoryId === c._id; // chỉ xanh nút được chọn
            return (
              <ListGroup.Item
                key={c._id}
                action
                className={`category-item d-flex align-items-center ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(c._id)}
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
