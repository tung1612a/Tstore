    import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Badge, Spinner, Tabs, Tab } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiFilter, FiPackage, FiArrowLeft, FiImage, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const SellerProducts = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [alert, setAlert] = useState({ show: false, message: '', variant: 'success' });
  const [activeTab, setActiveTab] = useState('products');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    stock: '',
    maxPurchaseQuantity: '',
    image: '',
    categoryId: ''
  });
  const [productImage, setProductImage] = useState(null); // File object
  const [imagePreview, setImagePreview] = useState(null); // Preview URL
  
  // Validation errors state
  const [errors, setErrors] = useState({
    title: '',
    price: '',
    stock: '',
    maxPurchaseQuantity: '',
    description: '',
    image: ''
  });
  const [touched, setTouched] = useState({
    title: false,
    price: false,
    stock: false,
    maxPurchaseQuantity: false,
    description: false,
    image: false
  });


  useEffect(() => {
    fetchProducts();
    fetchCategories();

    // Kiểm tra nếu có sản phẩm cần edit từ state
    const state = location.state;
    if (state?.editProduct) {
      setEditingProduct(state.editProduct);
      const imageUrl = state.editProduct.image || state.editProduct.imageURL || '';
      setFormData({
        title: state.editProduct.title,
        price: state.editProduct.price.toString(),
        description: state.editProduct.description || '',
        stock: state.editProduct.stock.toString(),
        maxPurchaseQuantity: state.editProduct.maxPurchaseQuantity ? state.editProduct.maxPurchaseQuantity.toString() : '',
        image: imageUrl,
        categoryId: state.editProduct.categoryId || ''
      });
      setProductImage(null);
      setImagePreview(imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`) : null);
      setShowModal(true);
      // Xóa state để tránh hiển thị lại modal khi refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/seller/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        showAlert('Lỗi khi tải danh sách sản phẩm', 'danger');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      showAlert('Lỗi khi tải danh sách sản phẩm', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };


  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  // Validation functions
  const validateTitle = (title) => {
    const trimmed = title.trim();
    if (!trimmed) {
      return 'Tên sản phẩm không được để trống';
    }
    if (trimmed.length < 2) {
      return 'Tên sản phẩm phải có ít nhất 2 ký tự';
    }
    if (trimmed.length > 20) {
      return 'Tên sản phẩm không được vượt quá 20 ký tự';
    }
    return '';
  };

  const validatePrice = (price) => {
    if (!price || price === '') {
      return 'Giá không được để trống';
    }
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) {
      return 'Giá phải là số hợp lệ';
    }
    if (numPrice <= 0) {
      return 'Giá phải lớn hơn 0';
    }
    if (numPrice > 100000000) {
      return 'Giá không được vượt quá 100 triệu';
    }
    return '';
  };

  const validateStock = (stock) => {
    if (!stock || stock === '') {
      return 'Số lượng tồn kho không được để trống';
    }
    const numStock = parseInt(stock);
    if (isNaN(numStock)) {
      return 'Số lượng tồn kho phải là số nguyên';
    }
    if (numStock < 0) {
      return 'Số lượng tồn kho không được nhỏ hơn 0';
    }
    if (numStock > 500) {
      return 'Số lượng tồn kho không được vượt quá 500';
    }
    return '';
  };

  const validateMaxPurchaseQuantity = (maxPurchaseQuantity, stock) => {
    if (maxPurchaseQuantity === '' || maxPurchaseQuantity === null || maxPurchaseQuantity === undefined) {
      return ''; // Optional field
    }
    const numMaxPurchaseQuantity = parseInt(maxPurchaseQuantity);
    if (isNaN(numMaxPurchaseQuantity)) {
      return 'Số lượng mua tối đa phải là số nguyên';
    }
    if (numMaxPurchaseQuantity < 1) {
      return 'Số lượng mua tối đa phải lớn hơn 0';
    }
    const numStock = parseInt(stock);
    if (!isNaN(numStock) && numMaxPurchaseQuantity > numStock) {
      return 'Số lượng mua tối đa không được vượt quá số lượng tồn kho';
    }
    return '';
  };

  const validateDescription = (description) => {
    if (description && description.length > 1000) {
      return 'Mô tả không được vượt quá 1000 ký tự';
    }
    return '';
  };

  const validateImage = (hasImage, isEditing, hasExistingImage) => {
    if (!isEditing && !hasImage) {
      return 'Vui lòng chọn hình ảnh cho sản phẩm';
    }
    if (isEditing && !hasImage && !hasExistingImage) {
      return 'Vui lòng chọn hình ảnh cho sản phẩm';
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {
      title: validateTitle(formData.title),
      price: validatePrice(formData.price),
      stock: validateStock(formData.stock),
      maxPurchaseQuantity: validateMaxPurchaseQuantity(formData.maxPurchaseQuantity, formData.stock),
      description: validateDescription(formData.description),
      image: validateImage(!!productImage, !!editingProduct, !!imagePreview && !productImage)
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Set all fields as touched
    setTouched({
      title: true,
      price: true,
      stock: true,
      maxPurchaseQuantity: true,
      description: true,
      image: true
    });

    // Validate form
    if (!validateForm()) {
      showAlert('Vui lòng điền đầy đủ và chính xác thông tin', 'danger');
      return;
    }

    try {
      const url = editingProduct 
        ? `http://localhost:5000/api/seller/products/${editingProduct._id}`
        : 'http://localhost:5000/api/seller/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      // Tạo FormData để gửi file
      const submitData = new FormData();
      submitData.append('title', formData.title.trim());
      submitData.append('price', parseFloat(formData.price));
      submitData.append('description', formData.description.trim());
      submitData.append('stock', parseInt(formData.stock));
      if (formData.maxPurchaseQuantity && formData.maxPurchaseQuantity !== '') {
        submitData.append('maxPurchaseQuantity', parseInt(formData.maxPurchaseQuantity));
      }
      submitData.append('categoryId', formData.categoryId);
      
      // Chỉ append file nếu có file mới được chọn
      if (productImage) {
        submitData.append('image', productImage);
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
          // Không set Content-Type, browser sẽ tự động set với boundary cho FormData
        },
        body: submitData
      });

      if (response.ok) {
        showAlert(editingProduct ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
        setShowModal(false);
        setEditingProduct(null);
        setFormData({ title: '', price: '', description: '', stock: '', maxPurchaseQuantity: '', image: '', categoryId: '' });
        setProductImage(null);
        setImagePreview(null);
        setErrors({ title: '', price: '', stock: '', maxPurchaseQuantity: '', description: '', image: '' });
        setTouched({ title: false, price: false, stock: false, maxPurchaseQuantity: false, description: false, image: false });
        fetchProducts();
      } else {
        const error = await response.json();
        showAlert(error.message || 'Có lỗi xảy ra', 'danger');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      showAlert('Có lỗi xảy ra khi lưu sản phẩm', 'danger');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    const imageUrl = product.image || product.imageURL || '';
    setFormData({
      title: product.title,
      price: product.price.toString(),
      description: product.description || '',
      stock: product.stock.toString(),
      maxPurchaseQuantity: product.maxPurchaseQuantity ? product.maxPurchaseQuantity.toString() : '',
      image: imageUrl,
      categoryId: product.categoryId || ''
    });
    setProductImage(null);
    setImagePreview(imageUrl ? (imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`) : null);
    setErrors({ title: '', price: '', stock: '', maxPurchaseQuantity: '', description: '', image: '' });
    setTouched({ title: false, price: false, stock: false, maxPurchaseQuantity: false, description: false, image: false });
    setShowModal(true);
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field
    let error = '';
    switch (field) {
      case 'title':
        error = validateTitle(value);
        break;
      case 'price':
        error = validatePrice(value);
        break;
      case 'stock':
        error = validateStock(value);
        // Re-validate maxPurchaseQuantity when stock changes
        if (formData.maxPurchaseQuantity) {
          const maxPurchaseError = validateMaxPurchaseQuantity(formData.maxPurchaseQuantity, value);
          setErrors(prev => ({ ...prev, maxPurchaseQuantity: maxPurchaseError }));
        }
        break;
      case 'maxPurchaseQuantity':
        error = validateMaxPurchaseQuantity(value, formData.stock);
        break;
      case 'description':
        error = validateDescription(value);
        break;
      default:
        break;
    }
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        const response = await fetch(`http://localhost:5000/api/seller/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          showAlert('Xóa sản phẩm thành công!');
          fetchProducts();
        } else {
          showAlert('Có lỗi xảy ra khi xóa sản phẩm', 'danger');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        showAlert('Có lỗi xảy ra khi xóa sản phẩm', 'danger');
      }
    }
  };

  const handleAddNew = () => {
    setEditingProduct(null);
    setFormData({ title: '', price: '', description: '', stock: '', maxPurchaseQuantity: '', image: '', categoryId: '' });
    setProductImage(null);
    setImagePreview(null);
    setErrors({ title: '', price: '', stock: '', maxPurchaseQuantity: '', description: '', image: '' });
    setTouched({ title: false, price: false, stock: false, maxPurchaseQuantity: false, description: false, image: false });
    setShowModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setTouched(prev => ({ ...prev, image: true }));
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Kích thước file không được vượt quá 5MB' }));
        return;
      }
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Chỉ chấp nhận file ảnh' }));
        return;
      }
      setProductImage(file);
      setErrors(prev => ({ ...prev, image: '' }));
      // Tạo preview URL
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setProductImage(null);
    setImagePreview(null);
    // Reset file input
    const fileInput = document.getElementById('product-image-input');
    if (fileInput) fileInput.value = '';
  };


  // Filter products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStock = true;
    if (filterStock === 'low') {
      matchesStock = product.stock <= 10;
    } else if (filterStock === 'out') {
      matchesStock = product.stock === 0;
    } else if (filterStock === 'in-stock') {
      matchesStock = product.stock > 0;
    }

    let matchesCategory = true;
    if (filterCategory !== 'all') {
      matchesCategory = product.categoryId === filterCategory;
    }
    
    return matchesSearch && matchesStock && matchesCategory;
  });

  const getStockBadge = (stock) => {
    if (stock === 0) return <Badge bg="danger">Hết hàng</Badge>;
    if (stock <= 10) return <Badge bg="warning">Sắp hết</Badge>;
    return <Badge bg="success">Còn hàng</Badge>;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row>
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/seller')}
                className="me-3"
                title="Quay lại Dashboard"
              >
                <FiArrowLeft className="me-2" />
                Dashboard
              </Button>
              <h2 className="mb-0">Quản lý sản phẩm</h2>
            </div>
            <Button variant="primary" onClick={handleAddNew}>
              <FiPlus className="me-2" />
              Thêm sản phẩm mới
            </Button>
          </div>

          {alert.show && (
            <Alert variant={alert.variant} dismissible onClose={() => setAlert({ show: false, message: '', variant: 'success' })}>
              {alert.message}
            </Alert>
          )}

          {/* Tabs */}
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-4"
          >
            <Tab eventKey="products" title={
              <span>
                <FiPackage className="me-2" />
                Sản phẩm
              </span>
            }>
              {/* Search and Filter */}
              <Card className="mb-4">
                <Card.Body>
                  <Row>
                    <Col md={4}>
                      <div className="position-relative">
                        <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                        <Form.Control
                          type="text"
                          placeholder="Tìm kiếm sản phẩm..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="ps-5"
                        />
                      </div>
                    </Col>
                    <Col md={2}>
                      <Form.Select
                        value={filterStock}
                        onChange={(e) => setFilterStock(e.target.value)}
                      >
                        <option value="all">Tất cả</option>
                        <option value="in-stock">Còn hàng</option>
                        <option value="low">Sắp hết hàng</option>
                        <option value="out">Hết hàng</option>
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <Form.Select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                      >
                        <option value="all">Tất cả danh mục</option>
                        {categories.map(category => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                    <Col md={3}>
                      <div className="d-flex align-items-center">
                        <FiFilter className="me-2" />
                        <span className="text-muted">Tìm thấy {filteredProducts.length} sản phẩm</span>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>

          {/* Products Table */}
          {activeTab === 'products' && (
            <Card>
              <Card.Body>
                {filteredProducts.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Hình ảnh</th>
                          <th>Tên sản phẩm</th>
                          <th>Danh mục</th>
                          <th>Giá</th>
                          <th>Tồn kho</th>
                          <th>Trạng thái</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map(product => {
                          const category = categories.find(cat => cat._id === product.categoryId);
                          return (
                            <tr key={product._id}>
                              <td>
                                <img
                                  src={
                                    product.image || product.imageURL
                                      ? (product.image || product.imageURL).startsWith('http')
                                        ? (product.image || product.imageURL)
                                        : `http://localhost:5000${product.image || product.imageURL}`
                                      : '/placeholder-image.jpg'
                                  }
                                  alt={product.title}
                                  style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                  className="rounded"
                                />
                              </td>
                              <td>
                                <div>
                                  <strong>{product.title}</strong>
                                  {product.description && (
                                    <div className="text-muted small">{product.description.substring(0, 50)}...</div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <Badge bg="secondary">
                                  {category ? category.name : 'Chưa phân loại'}
                                </Badge>
                              </td>
                              <td>${product.price}</td>
                              <td>{product.stock}</td>
                              <td>{getStockBadge(product.stock)}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button
                                    variant="outline-primary"
                                    size="sm"
                                    onClick={() => handleEdit(product)}
                                    title="Chỉnh sửa"
                                  >
                                    <FiEdit />
                                  </Button>
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleDelete(product._id)}
                                    title="Xóa"
                                  >
                                    <FiTrash2 />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <FiSearch size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">Không tìm thấy sản phẩm nào</h5>
                    <p className="text-muted">Thử thay đổi từ khóa tìm kiếm hoặc thêm sản phẩm mới</p>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

        </Col>
      </Row>

      {/* Product Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên sản phẩm *</Form.Label>
                  <Form.Control
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleFieldChange('title', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, title: true }))}
                    isInvalid={touched.title && !!errors.title}
                    maxLength={20}
                  />
                  {touched.title && errors.title && (
                    <Form.Control.Feedback type="invalid">
                      {errors.title}
                    </Form.Control.Feedback>
                  )}
                  <Form.Text className="text-muted">
                    Tên sản phẩm từ 2-20 ký tự
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    min="0.01"
                    max="50000000"
                    value={formData.price}
                    onChange={(e) => handleFieldChange('price', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, price: true }))}
                    isInvalid={touched.price && !!errors.price}
                  />
                  {touched.price && errors.price && (
                    <Form.Control.Feedback type="invalid">
                      {errors.price}
                    </Form.Control.Feedback>
                  )}
                  <Form.Text className="text-muted">
                    Giá phải lớn hơn 0
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lượng tồn kho *</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="500"
                    value={formData.stock}
                    onChange={(e) => handleFieldChange('stock', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, stock: true }))}
                    isInvalid={touched.stock && !!errors.stock}
                  />
                  {touched.stock && errors.stock && (
                    <Form.Control.Feedback type="invalid">
                      {errors.stock}
                    </Form.Control.Feedback>
                  )}
                  <Form.Text className="text-muted">
                    Số lượng phải là số nguyên không âm
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lượng mua tối đa/đơn hàng</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    placeholder="Không giới hạn"
                    value={formData.maxPurchaseQuantity}
                    onChange={(e) => handleFieldChange('maxPurchaseQuantity', e.target.value)}
                    onBlur={() => setTouched(prev => ({ ...prev, maxPurchaseQuantity: true }))}
                    isInvalid={touched.maxPurchaseQuantity && !!errors.maxPurchaseQuantity}
                  />
                  {touched.maxPurchaseQuantity && errors.maxPurchaseQuantity && (
                    <Form.Control.Feedback type="invalid">
                      {errors.maxPurchaseQuantity}
                    </Form.Control.Feedback>
                  )}
                  <Form.Text className="text-muted">
                    Để trống nếu không giới hạn. Tối đa không được vượt quá số lượng tồn kho.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Danh mục</Form.Label>
                  <Form.Select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(category => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Hình ảnh sản phẩm {!editingProduct && '*'}</Form.Label>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id="product-image-input"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                    <label htmlFor="product-image-input">
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        as="span"
                        style={{ cursor: 'pointer' }}
                      >
                        <FiImage className="me-2" />
                        Chọn ảnh
                      </Button>
                    </label>
                    {imagePreview && (
                      <div className="mt-3 position-relative" style={{ display: 'inline-block' }}>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          style={{
                            width: '150px',
                            height: '150px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #e0e0e0'
                          }}
                        />
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={handleRemoveImage}
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <FiX size={16} />
                        </Button>
                      </div>
                    )}
                    {touched.image && errors.image && (
                      <div className="text-danger small mt-2">
                        {errors.image}
                      </div>
                    )}
                    <Form.Text className="text-muted d-block mt-2">
                      {editingProduct ? 'Chọn ảnh mới để thay thế (không bắt buộc)' : 'Kích thước tối đa 5MB'}
                    </Form.Text>
                  </div>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả sản phẩm</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                maxLength={1000}
                value={formData.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, description: true }))}
                isInvalid={touched.description && !!errors.description}
              />
              {touched.description && errors.description && (
                <Form.Control.Feedback type="invalid">
                  {errors.description}
                </Form.Control.Feedback>
              )}
              <Form.Text className="text-muted">
                {formData.description.length}/1000 ký tự
              </Form.Text>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => {
              setShowModal(false);
              setProductImage(null);
              setImagePreview(null);
              setErrors({ title: '', price: '', stock: '', description: '', image: '' });
              setTouched({ title: false, price: false, stock: false, description: false, image: false });
            }}>
              Hủy
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={Object.values(errors).some(error => error !== '')}
            >
              {editingProduct ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

    </Container>
  );
};

export default SellerProducts;
