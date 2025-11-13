import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FiImage, FiSave, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SellerSettings = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  // User (avatar) lives on User
  const [formData, setFormData] = useState({
    avatarUrl: ''
  });

  // Store settings (banner, description, name) live on Store
  const [storeData, setStoreData] = useState({
    storeName: '',
    bannerImageURL: '',
    description: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [storeNameError, setStoreNameError] = useState('');
  const [storeNameTouched, setStoreNameTouched] = useState(false);
  const [descriptionError, setDescriptionError] = useState('');
  const [descriptionTouched, setDescriptionTouched] = useState(false);
  const [avatarFileError, setAvatarFileError] = useState('');
  const [bannerFileError, setBannerFileError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        avatarUrl: user.avatarUrl || ''
      });
    }

    const loadStore = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/seller/store', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const s = await res.json();
          setStoreData({
            storeName: s.storeName || '',
            bannerImageURL: s.bannerImageURL || '',
            description: s.description || ''
          });
          // Clear validation error khi load thành công
          setStoreNameError('');
          setStoreNameTouched(false);
        }
      } catch (e) {
        // ignore
      }
    };

    loadStore();
  }, [user, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateStoreName = (name) => {
    const trimmed = name.trim();
    if (!trimmed) {
      return 'Tên cửa hàng không được để trống';
    }
    if (trimmed.length < 2) {
      return 'Tên cửa hàng phải có ít nhất 2 ký tự';
    }
    if (trimmed.length > 50) {
      return 'Tên cửa hàng không được vượt quá 50 ký tự';
    }
    // Chỉ cho phép chữ cái (bao gồm tiếng Việt), số, khoảng trắng
    // Regex này cho phép: a-z, A-Z, 0-9, khoảng trắng, và các ký tự tiếng Việt có dấu
    const validPattern = /^[a-zA-Z0-9\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđĐÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]+$/;
    if (!validPattern.test(trimmed)) {
      return 'Tên cửa hàng chỉ được chứa chữ cái, số và khoảng trắng';
    }
    return '';
  };

  const validateDescription = (description) => {
    if (!description || !description.trim()) {
      return ''; // Mô tả là optional
    }
    if (description.length > 1000) {
      return 'Mô tả không được vượt quá 1000 ký tự';
    }
    return '';
  };

  const validateImageFile = (file) => {
    if (!file) {
      return 'Vui lòng chọn file';
    }
    
    // Kiểm tra loại file
    if (!file.type.startsWith('image/')) {
      return 'Chỉ chấp nhận file ảnh (JPG, PNG, GIF, ...)';
    }
    
    // Kiểm tra kích thước file (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return 'Kích thước file không được vượt quá 5MB';
    }
    
    return '';
  };

  const handleStoreNameChange = (e) => {
    const value = e.target.value;
    setStoreData(prev => ({ ...prev, storeName: value }));
    setStoreNameTouched(true);
    // Validate khi người dùng nhập (chỉ hiển thị sau khi đã touched)
    const error = validateStoreName(value);
    setStoreNameError(error);
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setStoreData(prev => ({ ...prev, description: value }));
    setDescriptionTouched(true);
    const error = validateDescription(value);
    setDescriptionError(error);
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    setStoreNameError('');
    setDescriptionError('');
    setStoreNameTouched(true); // Set touched để hiển thị lỗi nếu có
    setDescriptionTouched(true);

    // Validate store name trước khi lưu
    const trimmedStoreName = storeData.storeName.trim();
    const nameError = validateStoreName(trimmedStoreName);
    if (nameError) {
      setStoreNameError(nameError);
      setLoading(false);
      return;
    }

    // Validate description
    const descError = validateDescription(storeData.description);
    if (descError) {
      setDescriptionError(descError);
      setLoading(false);
      return;
    }

    try {
      // Save store settings (name, description). Avatar & banner are saved via upload endpoints.
      const res = await fetch('http://localhost:5000/api/seller/store', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          storeName: trimmedStoreName,
          description: storeData.description.trim()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        // Nếu lỗi liên quan đến tên cửa hàng trùng, hiển thị ở field tên cửa hàng
        if (data.message && data.message.includes('Tên cửa hàng đã tồn tại')) {
          setStoreNameError(data.message);
          setMessage('');
        } else {
          throw new Error(data.message || 'Cập nhật cửa hàng thất bại');
        }
        setLoading(false);
        return;
      }

      setMessage('Cập nhật thành công!');
      // Clear error khi thành công
      setStoreNameError('');
      setDescriptionError('');
      setStoreNameTouched(false);
      setDescriptionTouched(false);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    // Validate file trước khi upload
    setAvatarFileError('');
    const fileError = validateImageFile(file);
    if (fileError) {
      setAvatarFileError(fileError);
      e.target.value = '';
      return;
    }

    setUploadingAvatar(true);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('avatar', file);
      const res = await fetch('http://localhost:5000/api/seller/settings/avatar', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Tải ảnh đại diện thất bại');
      setFormData(prev => ({ ...prev, avatarUrl: data.avatarUrl }));
      setMessage('Cập nhật ảnh đại diện thành công');
      setAvatarFileError('');
    } catch (err) {
      setMessage(err.message);
      setAvatarFileError(err.message);
    } finally {
      setUploadingAvatar(false);
      // reset input value so same file can be reselected
      e.target.value = '';
    }
  };

  const handleBannerFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    // Validate file trước khi upload
    setBannerFileError('');
    const fileError = validateImageFile(file);
    if (fileError) {
      setBannerFileError(fileError);
      e.target.value = '';
      return;
    }

    setUploadingBanner(true);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('banner', file);
      const res = await fetch('http://localhost:5000/api/seller/store/banner', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Tải ảnh banner thất bại');
      setStoreData(prev => ({ ...prev, bannerImageURL: data.bannerImageURL }));
      setMessage('Cập nhật banner thành công');
      setBannerFileError('');
    } catch (err) {
      setMessage(err.message);
      setBannerFileError(err.message);
    } finally {
      setUploadingBanner(false);
      e.target.value = '';
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h2 className="mb-1">Cài đặt cửa hàng</h2>
              <p className="text-muted mb-0">Avatar nằm ở tài khoản, Banner và Mô tả nằm ở Cửa hàng</p>
            </div>
            <Button variant="outline-secondary" onClick={() => navigate(-1)} className="d-flex align-items-center">
              <FiArrowLeft className="me-2" /> Quay lại
            </Button>
          </div>
        </Col>
      </Row>

      {message && (
        <Alert variant={message.includes('thành công') ? 'success' : 'danger'}>{message}</Alert>
      )}

      <Row>
        <Col lg={8}>
          {/* User avatar */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Header className="bg-primary text-white">
              <FiImage className="me-2" /> Ảnh đại diện (User)
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Ảnh đại diện</Form.Label>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <input type="file" accept="image/*" id="avatar-file-input" style={{ display: 'none' }} onChange={handleAvatarFile} />
                  <Button variant="secondary" size="sm" onClick={() => document.getElementById('avatar-file-input').click()} disabled={uploadingAvatar}>
                    {uploadingAvatar ? 'Đang tải...' : 'Tải ảnh lên'}
                  </Button>
                </div>
                {avatarFileError && (
                  <div className="text-danger small mt-1">{avatarFileError}</div>
                )}
                {formData.avatarUrl && (
                  <div className="mt-3">
                    <img src={formData.avatarUrl.startsWith('http') ? formData.avatarUrl : `http://localhost:5000${formData.avatarUrl}`} alt="avatar preview" style={{ height: 80, width: 80, borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                )}
                <Form.Text className="text-muted">
                  Chỉ chấp nhận file ảnh (JPG, PNG, GIF), tối đa 5MB
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>

          {/* Store settings */}
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-success text-white">
              Cài đặt Cửa hàng (Store)
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Tên cửa hàng</Form.Label>
                <Form.Control
                  type="text"
                  value={storeData.storeName}
                  onChange={handleStoreNameChange}
                  placeholder="Tên cửa hàng hiển thị"
                  isInvalid={storeNameTouched && !!storeNameError}
                  maxLength={50}
                />
                {storeNameTouched && storeNameError && (
                  <Form.Control.Feedback type="invalid">
                    {storeNameError}
                  </Form.Control.Feedback>
                )}
                <Form.Text className="text-muted">
                  Tên cửa hàng từ 2-50 ký tự, chỉ được chứa chữ cái, số và khoảng trắng
                </Form.Text>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ảnh banner</Form.Label>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <input type="file" accept="image/*" id="banner-file-input" style={{ display: 'none' }} onChange={handleBannerFile} />
                  <Button variant="secondary" size="sm" onClick={() => document.getElementById('banner-file-input').click()} disabled={uploadingBanner}>
                    {uploadingBanner ? 'Đang tải...' : 'Tải banner lên'}
                  </Button>
                </div>
                {bannerFileError && (
                  <div className="text-danger small mt-1">{bannerFileError}</div>
                )}
                {storeData.bannerImageURL && (
                  <div className="mt-3">
                    <img src={storeData.bannerImageURL.startsWith('http') ? storeData.bannerImageURL : `http://localhost:5000${storeData.bannerImageURL}`} alt="banner preview" style={{ height: 120, width: '100%', objectFit: 'cover', borderRadius: 8 }} />
                  </div>
                )}
                <Form.Text className="text-muted">
                  Chỉ chấp nhận file ảnh (JPG, PNG, GIF), tối đa 5MB
                </Form.Text>
              </Form.Group>

              <Form.Group>
                <Form.Label>Mô tả cửa hàng</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={storeData.description}
                  onChange={handleDescriptionChange}
                  placeholder="Giới thiệu cửa hàng, thế mạnh, cam kết..."
                  isInvalid={!!descriptionError}
                  maxLength={1000}
                />
                {descriptionError && (
                  <Form.Control.Feedback type="invalid">
                    {descriptionError}
                  </Form.Control.Feedback>
                )}
                <Form.Text className="text-muted">
                  {storeData.description.length}/1000 ký tự
                </Form.Text>
              </Form.Group>
            </Card.Body>
          </Card>

          <div className="mt-3 d-flex gap-2">
            <Button variant="success" onClick={handleSave} disabled={loading || !!storeNameError || !!descriptionError}>
              <FiSave className="me-2" /> {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </Col>

        <Col lg={4}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-info text-white">Xem trước</Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div style={{ height: 120, width: '100%', background: '#f1f3f5', borderRadius: 8, overflow: 'hidden' }}>
                  {storeData.bannerImageURL ? (
                    <img src={storeData.bannerImageURL} alt="banner" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div className="d-flex h-100 w-100 align-items-center justify-content-center text-muted">Banner preview</div>
                  )}
                </div>
                <div className="d-flex align-items-center mt-n4 ps-3">
                  <div style={{ height: 72, width: 72, borderRadius: '50%', border: '3px solid white', overflow: 'hidden', background: '#e9ecef' }}>
                    {formData.avatarUrl ? (
                       <img src={formData.avatarUrl.startsWith('http') ? formData.avatarUrl : `http://localhost:5000${formData.avatarUrl}`} alt="avatar" style={{ height: '100%', width: '100%', objectFit: 'cover' }} />
                    ) : null}
                  </div>
                  <div className="ms-3">
                    <div className="fw-bold">{storeData.storeName || user?.businessName || user?.fullName || 'Tên cửa hàng'}</div>
                    <div className="text-muted small">{user?.email}</div>
                  </div>
                </div>
              </div>
              <div className="small" style={{ whiteSpace: 'pre-wrap' }}>
                {storeData.description || 'Mô tả cửa hàng sẽ hiện ở đây...'}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SellerSettings;

