import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiArrowLeft,
  FiRefreshCw,
  FiMessageSquare,
  FiEye,
  FiArrowUp,
} from 'react-icons/fi';
import { Container, Row, Col, Card, Badge, Button, Modal, Alert } from 'react-bootstrap';

const complaintTypeLabels = {
  quality: 'Chất lượng sản phẩm',
  wrong_item: 'Sai sản phẩm',
  damaged: 'Sản phẩm bị hỏng',
  missing: 'Thiếu sản phẩm',
  late_delivery: 'Giao hàng chậm',
  other: 'Khác',
};

const statusMeta = {
  pending: { label: 'Chờ xử lý', color: '#856404', bg: '#fff3cd', icon: <FiClock /> },
  in_progress: { label: 'Đang xử lý', color: '#0c5460', bg: '#d1ecf1', icon: <FiMessageSquare /> },
  resolved: { label: 'Đã giải quyết', color: '#28a745', bg: '#d4edda', icon: <FiCheckCircle /> },
  rejected: { label: 'Từ chối', color: '#721c24', bg: '#f8d7da', icon: <FiXCircle /> },
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const BuyerComplaints = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter]);

  const fetchComplaints = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`http://localhost:5000/api/complaints/buyer?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setComplaints(data.complaints || []);
      }
    } catch (error) {
      console.error('Error fetching complaints:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (complaint) => {
    try {
      // Fetch full details
      const response = await fetch(`http://localhost:5000/api/complaints/${complaint._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedComplaint(data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching complaint details:', error);
    }
  };

  const handleEscalateToAdmin = async () => {
    if (!selectedComplaint) return;

    if (!window.confirm('Bạn có chắc chắn muốn gửi khiếu nại này lên admin để giải quyết?')) {
      return;
    }

    setIsEscalating(true);
    try {
      const response = await fetch(`http://localhost:5000/api/complaints/${selectedComplaint._id}/escalate`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        await fetchComplaints();
        setSelectedComplaint(data.complaint);
        alert('Đã gửi khiếu nại lên admin thành công! Admin sẽ xem xét và giải quyết.');
      } else {
        const error = await response.json();
        alert(error.message || 'Có lỗi xảy ra khi nâng cấp khiếu nại');
      }
    } catch (error) {
      console.error('Error escalating complaint:', error);
      alert('Có lỗi xảy ra khi nâng cấp khiếu nại');
    } finally {
      setIsEscalating(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      {/* Header */}
      <div className="bg-danger text-white py-4">
        <Container>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <Button variant="light" className="mb-2" onClick={() => navigate('/')}>
                <FiArrowLeft className="me-2" />
                Quay lại
              </Button>
              <h1 className="mb-0">Khiếu nại của tôi</h1>
              <p className="mb-0">Theo dõi tình trạng khiếu nại của bạn</p>
            </div>
            <Button variant="light" onClick={fetchComplaints}>
              <FiRefreshCw className="me-2" />
              Làm mới
            </Button>
          </div>
        </Container>
      </div>

      <Container className="py-4">
        {/* Stats */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiClock className="text-warning mb-2" size={32} />
                <h4 className="text-warning mb-0">{complaints.filter(c => c.status === 'pending').length}</h4>
                <p className="text-muted mb-0">Chờ xử lý</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiMessageSquare className="text-info mb-2" size={32} />
                <h4 className="text-info mb-0">{complaints.filter(c => c.status === 'in_progress').length}</h4>
                <p className="text-muted mb-0">Đang xử lý</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiCheckCircle className="text-success mb-2" size={32} />
                <h4 className="text-success mb-0">{complaints.filter(c => c.status === 'resolved').length}</h4>
                <p className="text-muted mb-0">Đã giải quyết</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center">
                <FiAlertTriangle className="text-danger mb-2" size={32} />
                <h4 className="text-danger mb-0">{complaints.length}</h4>
                <p className="text-muted mb-0">Tổng khiếu nại</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filter */}
        <div className="mb-3">
          <select
            className="form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ maxWidth: '300px' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="in_progress">Đang xử lý</option>
            <option value="resolved">Đã giải quyết</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>

        {/* Complaints List */}
        {complaints.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <FiAlertTriangle size={64} className="text-muted mb-3" />
              <h5>Bạn chưa có khiếu nại nào</h5>
              <p className="text-muted">Các khiếu nại của bạn sẽ hiển thị ở đây</p>
            </Card.Body>
          </Card>
        ) : (
          <div>
            {complaints.map((complaint) => {
              const statusInfo = statusMeta[complaint.status] || statusMeta.pending;
              return (
                <Card key={complaint._id} className="mb-3 border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start">
                      <div className="flex-grow-1">
                        <div className="d-flex align-items-center mb-2">
                          <Badge style={{ 
                            color: statusInfo.color, 
                            backgroundColor: statusInfo.bg,
                            padding: '8px 12px',
                            borderRadius: '6px'
                          }}>
                            {statusInfo.icon}
                            <span className="ms-2">{statusInfo.label}</span>
                          </Badge>
                          <Badge bg="secondary" className="ms-2">
                            {complaintTypeLabels[complaint.complaintType] || complaint.complaintType}
                          </Badge>
                          {complaint.escalatedToAdmin && (
                            <Badge bg="warning" text="dark" className="ms-2">
                              <FiArrowUp className="me-1" />
                              Đã gửi lên admin
                            </Badge>
                          )}
                        </div>
                        <h5 className="mb-2">{complaint.productId?.title || 'Không rõ sản phẩm'}</h5>
                        <p className="text-muted mb-2">
                          <strong>Người bán:</strong> {complaint.sellerId?.fullName || 'N/A'}
                        </p>
                        <p className="mb-2">
                          <strong>Mô tả:</strong> {complaint.description}
                        </p>
                        {complaint.response && (
                          <Alert variant="info" className="mb-2 py-2">
                            <strong>Phản hồi từ người bán:</strong> {complaint.response}
                          </Alert>
                        )}
                        <small className="text-muted">
                          Đơn hàng: #{complaint.orderId?._id?.slice(-8) || 'N/A'} • 
                          {formatDate(complaint.createdAt)}
                          {complaint.resolvedAt && (
                            <> • Giải quyết: {formatDate(complaint.resolvedAt)}</>
                          )}
                        </small>
                      </div>
                      <Button
                        variant="outline-primary"
                        onClick={() => handleViewDetails(complaint)}
                        className="ms-3"
                      >
                        <FiEye className="me-2" />
                        Chi tiết
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        )}
      </Container>

      {/* Detail Modal */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FiAlertTriangle className="me-2" />
            Chi tiết khiếu nại
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedComplaint && (
            <>
              <div className="mb-3">
                <h6>Sản phẩm</h6>
                <div className="d-flex align-items-center">
                  {selectedComplaint.productId?.imageURL && (
                    <img
                      src={selectedComplaint.productId.imageURL}
                      alt={selectedComplaint.productId.title}
                      style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', marginRight: '12px' }}
                    />
                  )}
                  <p className="mb-0">{selectedComplaint.productId?.title || 'N/A'}</p>
                </div>
              </div>
              <div className="mb-3">
                <h6>Người bán</h6>
                <p>{selectedComplaint.sellerId?.fullName || 'N/A'} ({selectedComplaint.sellerId?.email || 'N/A'})</p>
              </div>
              <div className="mb-3">
                <h6>Đơn hàng</h6>
                <p>#{selectedComplaint.orderId?._id?.slice(-8) || 'N/A'}</p>
              </div>
              <div className="mb-3">
                <h6>Loại khiếu nại</h6>
                <Badge bg="warning" text="dark">
                  {complaintTypeLabels[selectedComplaint.complaintType] || selectedComplaint.complaintType}
                </Badge>
              </div>
              <div className="mb-3">
                <h6>Trạng thái</h6>
                <Badge style={{ 
                  color: statusMeta[selectedComplaint.status]?.color || '#000', 
                  backgroundColor: statusMeta[selectedComplaint.status]?.bg || '#fff',
                  padding: '6px 12px',
                  borderRadius: '6px'
                }}>
                  {statusMeta[selectedComplaint.status]?.icon}
                  <span className="ms-2">{statusMeta[selectedComplaint.status]?.label || selectedComplaint.status}</span>
                </Badge>
                {selectedComplaint.escalatedToAdmin && (
                  <Badge bg="warning" text="dark" className="ms-2">
                    <FiArrowUp className="me-1" />
                    Đã gửi lên admin
                  </Badge>
                )}
              </div>
              <div className="mb-3">
                <h6>Mô tả chi tiết</h6>
                <p>{selectedComplaint.description}</p>
              </div>
              {selectedComplaint.images && selectedComplaint.images.length > 0 && (
                <div className="mb-3">
                  <h6>Hình ảnh minh chứng</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {selectedComplaint.images.map((image, index) => (
                      <div key={index} style={{ position: 'relative', width: '150px', height: '150px' }}>
                        <img
                          src={`http://localhost:5000${image}`}
                          alt={`Complaint image ${index + 1}`}
                          className="img-thumbnail"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                          onClick={() => window.open(`http://localhost:5000${image}`, '_blank')}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedComplaint.response && (
                <div className="mb-3 p-3 bg-light rounded">
                  <h6>Phản hồi từ người bán</h6>
                  <p className="mb-0">{selectedComplaint.response}</p>
                  {selectedComplaint.status === 'rejected' && (
                    <Alert variant="warning" className="mt-2 mb-0">
                      Người bán đã từ chối giải quyết khiếu nại này.
                      {!selectedComplaint.escalatedToAdmin && ' Bạn có thể gửi lên admin để được giải quyết.'}
                    </Alert>
                  )}
                </div>
              )}
              {selectedComplaint.escalatedToAdmin && (
                <Alert variant="info">
                  <strong>Khiếu nại đã được gửi lên admin</strong>
                  <br />
                  <small>Admin đang xem xét và sẽ giải quyết khiếu nại này. Thời gian: {selectedComplaint.escalatedAt ? formatDate(selectedComplaint.escalatedAt) : 'N/A'}</small>
                </Alert>
              )}
              <div className="mb-2">
                <small className="text-muted">
                  Tạo lúc: {formatDate(selectedComplaint.createdAt)}
                </small>
                {selectedComplaint.resolvedAt && (
                  <>
                    <br />
                    <small className="text-muted">
                      Giải quyết lúc: {formatDate(selectedComplaint.resolvedAt)}
                    </small>
                  </>
                )}
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedComplaint && 
           selectedComplaint.status === 'rejected' && 
           !selectedComplaint.escalatedToAdmin && (
            <Button 
              variant="warning" 
              onClick={handleEscalateToAdmin} 
              disabled={isEscalating}
            >
              <FiArrowUp className="me-2" />
              {isEscalating ? 'Đang gửi...' : 'Gửi lên admin để giải quyết'}
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BuyerComplaints;

