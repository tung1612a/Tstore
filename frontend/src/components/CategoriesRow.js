import React from 'react';
import { Card, Spinner, Alert } from 'react-bootstrap';
import { FiGrid, FiWatch } from 'react-icons/fi';
import {
  FaTshirt,
  FaFemale,
  FaMobileAlt,
  FaLaptop,
  FaCamera,
  FaShoePrints,
  FaShoppingBag,
  FaBlender,
  FaRunning,
  FaCar,
  FaBaby,
  FaCouch,
  FaSpa,
  FaHeartbeat,
  FaSuitcaseRolling,
  FaGem,
  FaShoppingBasket,
  FaBookOpen,
  FaPuzzlePiece,
  FaTags,
  FaBoxes,
  FaTv,
  FaGamepad
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import './CategoriesRow.css';

const normalizeName = (name) =>
  (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const iconRules = [
  { icon: FaTshirt, all: ['thoi trang', 'nam'] },
  { icon: FaFemale, all: ['thoi trang', 'nu'] },
  { icon: FaTshirt, all: ['thoi trang'] },
  { icon: FaMobileAlt, all: ['dien thoai'], any: ['phu kien', 'phukien'] },
  { icon: FaTv, all: ['thiet bi dien tu'] },
  { icon: FaTv, all: ['dien tu'] },
  { icon: FaLaptop, any: ['laptop', 'may tinh', 'pc', 'computer'] },
  { icon: FaCamera, any: ['may anh', 'quay phim', 'camera', 'chup anh'] },
  { icon: FaPuzzlePiece, any: ['do choi', 'toy', 'dochoi'] },
  { icon: FaBlender, any: ['gia dung', 'nha bep', 'kitchen'] },
  { icon: FaShoePrints, any: ['giay', 'dep', 'footwear'] },
  { icon: FaRunning, any: ['the thao', 'sport', 'fitness'] },
  { icon: FaSuitcaseRolling, any: ['du lich', 'travel', 'tour'] },
  { icon: FaCar, any: ['o to', 'xe may', 'xe dap', 'xe hoi', 'xe co', 'phuong tien'] },
  { icon: FaBaby, any: ['me be', 'tre em', 'baby', 'kids'] },
  { icon: FaCouch, any: ['nha cua', 'noi that', 'gia dung', 'home'] },
  { icon: FaSpa, any: ['sac dep', 'lam dep', 'beauty', 'cham soc'] },
  { icon: FaHeartbeat, any: ['suc khoe', 'health', 'y te'] },
  { icon: FaShoppingBag, any: ['tui vi', 'tui xach', 'bag', 'thoi trang'] },
  { icon: FaGem, any: ['trang suc', 'jewelry'] },
  { icon: FaShoppingBasket, any: ['bach hoa', 'tieu dung', 'sieu thi'] },
  { icon: FaBookOpen, any: ['nha sach', 'sach', 'book', 'van phong pham'] },
  { icon: FaGamepad, any: ['gaming', 'game', 'do choi'] },
  { icon: FaBoxes, any: ['khac', 'other', 'tong hop'] },
  { icon: FaTags, any: ['phu kien', 'accessory'] },
];

const exactIconMap = new Map([
  ['dong ho', FiWatch],
  ['Đồng Hồ', FiWatch],
  ['watch', FiWatch],
  ['do choi', FaPuzzlePiece],
  ['do choi tre em', FaPuzzlePiece],
  ['toys', FaPuzzlePiece],
  ['children toys', FaPuzzlePiece],
  ['dien thoai phu kien', FaMobileAlt],
  ['dien thoai va phu kien', FaMobileAlt],
  ['dien thoai phu kien accessories', FaMobileAlt],
  ['electronic devices and accessories', FaMobileAlt],
  ['smartphone accessories', FaMobileAlt],
  ['thiet bi dien tu', FaTv],
  ['thiet bi dien tu dien lanh', FaTv],
  ['electronics', FaTv],
  ['consumer electronics', FaTv],
  ['thiet bi gia dung', FaBlender],
  ['home appliances and kitchen items', FaBlender],
  ['may anh may quay phim', FaCamera],
  ['camera equipment', FaCamera],
  ['may tinh laptop', FaLaptop],
  ['may tinh va laptop', FaLaptop],
  ['giay dep', FaShoePrints],
  ['giay dep nam', FaShoePrints],
  ['giay dep nu', FaShoePrints],
  ['thoi trang', FaTshirt],
  ['fashion items and apparel', FaTshirt],
  ['khac', FaBoxes],
  ['categories', FiGrid],
]);

const getCategoryIcon = (category) => {
  const normalizedName = normalizeName(category?.name);
  const normalizedDescription = normalizeName(category?.description);
  const normalizedValues = [normalizedName, normalizedDescription].filter(Boolean);

  if (normalizedValues.length === 0) {
    return FiGrid;
  }

  for (const value of normalizedValues) {
    const exactIcon = exactIconMap.get(value);
    if (exactIcon) {
      return exactIcon;
    }
  }

  const contains = (keyword) => normalizedValues.some((value) => value.includes(keyword));

  for (const rule of iconRules) {
    if (rule.all && ![].concat(rule.all).every(contains)) {
      continue;
    }
    if (rule.any && ![].concat(rule.any).some(contains)) {
      continue;
    }
    if (rule.not && [].concat(rule.not).some(contains)) {
      continue;
    }
    return rule.icon;
  }

  return FiGrid;
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

  if (loading) {
    return (
      <Card className="category-panel">
        <Card.Body className="text-center">
          <Spinner animation="border" size="sm" />
          <div className="mt-2">Đang tải...</div>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="category-panel">
        <Card.Body>
          <Alert variant="warning" className="mb-0">{error}</Alert>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="category-panel">
      <Card.Body>
        <Card.Title className="h5 d-flex align-items-center mb-3">
          <FiGrid className="me-2" />
          {t('categories.1')}
        </Card.Title>
        <div className="category-grid">
          <button
            type="button"
            className={`category-tile ${selectedCategoryId === '' ? 'active' : ''}`}
            onClick={() => onSelectCategory('')}
          >
            <FiGrid size={28} />
            <span>{t('categories.1')}</span>
          </button>
          {categories.map((c) => {
            const IconComponent = getCategoryIcon(c);
            const isActive = selectedCategoryId === c._id;
            return (
              <button
                type="button"
                key={c._id}
                className={`category-tile ${isActive ? 'active' : ''}`}
                onClick={() => onSelectCategory(c._id)}
              >
                <IconComponent size={28} />
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>
      </Card.Body>
    </Card>
  );
}

export default CategoriesRow;
