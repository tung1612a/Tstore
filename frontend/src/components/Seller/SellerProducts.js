    import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Table, Modal, Form, Alert, Badge, Spinner, Tabs, Tab } from 'react-bootstrap';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiFilter, FiPackage, FiTrendingUp, FiSettings, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const SellerProducts = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
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
    image: '',
    categoryId: ''
  });

  // Inventory form state
  const [inventoryFormData, setInventoryFormData] = useState({
    productId: '',
    quantity: '',
    operation: 'add' // 'add' or 'subtract'
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchInventories();

    // Kiểm tra nếu có sản phẩm cần edit từ state
    const state = location.state;
    if (state?.editProduct) {
      setEditingProduct(state.editProduct);
      setFormData({
        title: state.editProduct.title,
        price: state.editProduct.price.toString(),
        description: state.editProduct.description || '',
        stock: state.editProduct.stock.toString(),
        image: state.editProduct.image || state.editProduct.imageURL || '',
        categoryId: state.editProduct.categoryId || ''
      });
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

  const fetchInventories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/seller/inventories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setInventories(data);
      }
    } catch (error) {
      console.error('Error fetching inventories:', error);
    }
  };

  const showAlert = (message, variant = 'success') => {
    setAlert({ show: true, message, variant });
    setTimeout(() => setAlert({ show: false, message: '', variant: 'success' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingProduct 
        ? `http://localhost:5000/api/seller/products/${editingProduct._id}`
        : 'http://localhost:5000/api/seller/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        showAlert(editingProduct ? 'Cập nhật sản phẩm thành công!' : 'Thêm sản phẩm thành công!');
        setShowModal(false);
        setEditingProduct(null);
        setFormData({ title: '', price: '', description: '', stock: '', image: '', categoryId: '' });
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
    setFormData({
      title: product.title,
      price: product.price.toString(),
      description: product.description || '',
      stock: product.stock.toString(),
      image: product.image || product.imageURL || '',
      categoryId: product.categoryId || ''
    });
    setShowModal(true);
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
    setFormData({ title: '', price: '', description: '', stock: '', image: '', categoryId: '' });
    setShowModal(true);
  };

  const handleInventoryUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/seller/inventories/${inventoryFormData.productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quantity: parseInt(inventoryFormData.quantity),
          operation: inventoryFormData.operation
        })
      });

      if (response.ok) {
        showAlert('Cập nhật tồn kho thành công!');
        setShowInventoryModal(false);
        setInventoryFormData({ productId: '', quantity: '', operation: 'add' });
        fetchProducts();
        fetchInventories();
      } else {
        const error = await response.json();
        showAlert(error.message || 'Có lỗi xảy ra', 'danger');
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      showAlert('Có lỗi xảy ra khi cập nhật tồn kho', 'danger');
    }
  };

  const handleInventoryModal = (product) => {
    setInventoryFormData({
      productId: product._id,
      quantity: '',
      operation: 'add'
    });
    setShowInventoryModal(true);
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
              <h2 className="mb-0">Quản lý sản phẩm & Tồn kho</h2>
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
            
            <Tab eventKey="inventory" title={
              <span>
                <FiTrendingUp className="me-2" />
                Quản lý tồn kho
              </span>
            }>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Quản lý tồn kho sản phẩm</h5>
                </Card.Header>
                <Card.Body>
                  <p className="text-muted">Cập nhật số lượng tồn kho cho các sản phẩm</p>
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
                                  src={product.image || product.imageURL || '/placeholder-image.jpg'}
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
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => handleInventoryModal(product)}
                                    title="Quản lý tồn kho"
                                  >
                                    <FiSettings />
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

          {/* Inventory Management */}
          {activeTab === 'inventory' && (
            <Card>
              <Card.Header>
                <h5 className="mb-0">Danh sách tồn kho</h5>
              </Card.Header>
              <Card.Body>
                {products.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover>
                      <thead>
                        <tr>
                          <th>Sản phẩm</th>
                          <th>Tồn kho hiện tại</th>
                          <th>Trạng thái</th>
                          <th>Hành động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map(product => (
                          <tr key={product._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={product.image || product.imageURL || '/placeholder-image.jpg'}
                                  alt={product.title}
                                  style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                  className="rounded me-3"
                                />
                                <div>
                                  <strong>{product.title}</strong>
                                  <div className="text-muted small">${product.price}</div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span className="fw-bold">{product.stock}</span>
                            </td>
                            <td>{getStockBadge(product.stock)}</td>
                            <td>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleInventoryModal(product)}
                              >
                                <FiSettings className="me-1" />
                                Cập nhật
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <FiPackage size={48} className="text-muted mb-3" />
                    <h5 className="text-muted">Chưa có sản phẩm nào</h5>
                    <p className="text-muted">Thêm sản phẩm để bắt đầu quản lý tồn kho</p>
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
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá *</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lượng tồn kho *</Form.Label>
                  <Form.Control
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
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
                  <Form.Label>URL hình ảnh</Form.Label>
                  <Form.Control
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Mô tả sản phẩm</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              {editingProduct ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Inventory Management Modal */}
      <Modal show={showInventoryModal} onHide={() => setShowInventoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật tồn kho</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleInventoryUpdate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Sản phẩm</Form.Label>
              <Form.Control
                type="text"
                value={products.find(p => p._id === inventoryFormData.productId)?.title || ''}
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tồn kho hiện tại</Form.Label>
              <Form.Control
                type="text"
                value={products.find(p => p._id === inventoryFormData.productId)?.stock || 0}
                disabled
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Thao tác</Form.Label>
              <Form.Select
                value={inventoryFormData.operation}
                onChange={(e) => setInventoryFormData({ ...inventoryFormData, operation: e.target.value })}
              >
                <option value="add">Thêm vào kho</option>
                <option value="subtract">Trừ khỏi kho</option>
                <option value="set">Đặt số lượng mới</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Số lượng</Form.Label>
              <Form.Control
                type="number"
                value={inventoryFormData.quantity}
                onChange={(e) => setInventoryFormData({ ...inventoryFormData, quantity: e.target.value })}
                required
                min="0"
              />
            </Form.Group>
            {inventoryFormData.operation === 'add' && (
              <Alert variant="info">
                Số lượng mới sẽ là: {products.find(p => p._id === inventoryFormData.productId)?.stock || 0} + {inventoryFormData.quantity || 0} = {(products.find(p => p._id === inventoryFormData.productId)?.stock || 0) + parseInt(inventoryFormData.quantity || 0)}
              </Alert>
            )}
            {inventoryFormData.operation === 'subtract' && (
              <Alert variant="warning">
                Số lượng mới sẽ là: {products.find(p => p._id === inventoryFormData.productId)?.stock || 0} - {inventoryFormData.quantity || 0} = {Math.max(0, (products.find(p => p._id === inventoryFormData.productId)?.stock || 0) - parseInt(inventoryFormData.quantity || 0))}
              </Alert>
            )}
            {inventoryFormData.operation === 'set' && (
              <Alert variant="primary">
                Số lượng sẽ được đặt thành: {inventoryFormData.quantity || 0}
              </Alert>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInventoryModal(false)}>
              Hủy
            </Button>
            <Button variant="primary" type="submit">
              Cập nhật tồn kho
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default SellerProducts;
