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

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Save store settings (name, description). Avatar & banner are saved via upload endpoints.
      const res = await fetch('http://localhost:5000/api/seller/store', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          storeName: storeData.storeName,
          description: storeData.description
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Cập nhật cửa hàng thất bại');

      setMessage('Cập nhật thành công!');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
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
    } catch (err) {
      setMessage(err.message);
    } finally {
      setUploadingAvatar(false);
      // reset input value so same file can be reselected
      e.target.value = '';
    }
  };

  const handleBannerFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
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
    } catch (err) {
      setMessage(err.message);
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
                {formData.avatarUrl && (
                  <div className="mt-3">
                    <img src={formData.avatarUrl.startsWith('http') ? formData.avatarUrl : `http://localhost:5000${formData.avatarUrl}`} alt="avatar preview" style={{ height: 80, width: 80, borderRadius: '50%', objectFit: 'cover' }} />
                  </div>
                )}
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
                  onChange={(e)=>setStoreData(prev=>({...prev, storeName: e.target.value}))}
                  placeholder="Tên cửa hàng hiển thị"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Ảnh banner</Form.Label>
                <div className="d-flex align-items-center gap-2 mt-1">
                  <input type="file" accept="image/*" id="banner-file-input" style={{ display: 'none' }} onChange={handleBannerFile} />
                  <Button variant="secondary" size="sm" onClick={() => document.getElementById('banner-file-input').click()} disabled={uploadingBanner}>
                    {uploadingBanner ? 'Đang tải...' : 'Tải banner lên'}
                  </Button>
                </div>
                {storeData.bannerImageURL && (
                  <div className="mt-3">
                    <img src={storeData.bannerImageURL.startsWith('http') ? storeData.bannerImageURL : `http://localhost:5000${storeData.bannerImageURL}`} alt="banner preview" style={{ height: 120, width: '100%', objectFit: 'cover', borderRadius: 8 }} />
                  </div>
                )}
              </Form.Group>

              <Form.Group>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={storeData.description}
                  onChange={(e)=>setStoreData(prev=>({...prev, description: e.target.value}))}
                  placeholder="Giới thiệu cửa hàng, thế mạnh, cam kết..."
                />
              </Form.Group>
            </Card.Body>
          </Card>

          <div className="mt-3 d-flex gap-2">
            <Button variant="success" onClick={handleSave} disabled={loading}>
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

