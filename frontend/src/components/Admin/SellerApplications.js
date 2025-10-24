import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import { FiUser, FiMail, FiPhone, FiHome, FiFileText, FiCheck, FiX, FiEye, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const SellerApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [reviewData, setReviewData] = useState({
    action: '',
    rejectionReason: '',
    notes: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/seller-applications', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApplications(data);
      } else {
        setError('Failed to fetch applications');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (application) => {
    setSelectedApplication(application);
    setReviewData({
      action: '',
      rejectionReason: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleSubmitReview = async () => {
    if (!reviewData.action) {
      alert('Please select an action');
      return;
    }

    if (reviewData.action === 'reject' && !reviewData.rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`http://localhost:5000/api/auth/seller-applications/${selectedApplication._id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(reviewData)
      });

      if (response.ok) {
        setShowModal(false);
        fetchApplications(); // Refresh the list
        alert('Application reviewed successfully');
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to review application');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return <Badge bg={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <Spinner animation="border" />
          <p>Loading applications...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center mb-3">
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/admin')}
              className="me-3"
            >
              <FiArrowLeft className="me-2" />
              Quay lại Dashboard
            </Button>
          </div>
          <h2>Seller Applications Management</h2>
          <p className="text-muted">Review and manage seller applications</p>
        </Col>
      </Row>

      {error && (
        <Alert variant="danger">{error}</Alert>
      )}

      <Row>
        {applications.map((app) => (
          <Col md={6} lg={4} key={app._id} className="mb-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <strong>{app.fullName}</strong>
                  {getStatusBadge(app.status)}
                </div>
                <small className="text-muted">
                  {formatDate(app.createdAt)}
                </small>
              </Card.Header>
              
              <Card.Body>
                <div className="mb-2">
                  <FiMail className="me-2" />
                  <small>{app.email}</small>
                </div>
                
                <div className="mb-2">
                  <FiPhone className="me-2" />
                  <small>{app.phone}</small>
                </div>
                
                <div className="mb-2">
                  <FiHome className="me-2" />
                  <small>{app.businessName}</small>
                </div>
                
                {app.businessDescription && (
                  <div className="mb-2">
                    <FiFileText className="me-2" />
                    <small>{app.businessDescription.substring(0, 50)}...</small>
                  </div>
                )}

                <div className="mb-2">
                  <strong>Tax Code:</strong> {app.taxCode}
                </div>
                
                <div className="mb-2">
                  <strong>CCCD:</strong> {app.cccd}
                </div>

                {app.status === 'pending' && (
                  <div className="d-grid gap-2">
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => handleReview(app)}
                    >
                      <FiEye className="me-1" />
                      Review Application
                    </Button>
                  </div>
                )}

                {app.status !== 'pending' && (
                  <div>
                    <small className="text-muted">
                      Reviewed by: {app.reviewedBy?.fullName || 'Unknown'}
                    </small>
                    <br />
                    <small className="text-muted">
                      {formatDate(app.reviewedAt)}
                    </small>
                    {app.rejectionReason && (
                      <div className="mt-2">
                        <strong>Rejection Reason:</strong>
                        <p className="text-danger small">{app.rejectionReason}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {applications.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">No applications found</p>
        </div>
      )}

      {/* Review Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Review Seller Application</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedApplication && (
            <div>
              <h5>Application Details</h5>
              <Row>
                <Col md={6}>
                  <p><strong>Name:</strong> {selectedApplication.fullName}</p>
                  <p><strong>Email:</strong> {selectedApplication.email}</p>
                  <p><strong>Phone:</strong> {selectedApplication.phone}</p>
                  <p><strong>Business Name:</strong> {selectedApplication.businessName}</p>
                </Col>
                <Col md={6}>
                  <p><strong>Tax Code:</strong> {selectedApplication.taxCode}</p>
                  <p><strong>CCCD:</strong> {selectedApplication.cccd}</p>
                  <p><strong>Applied:</strong> {formatDate(selectedApplication.createdAt)}</p>
                </Col>
              </Row>
              
              {selectedApplication.businessDescription && (
                <div className="mt-3">
                  <strong>Business Description:</strong>
                  <p>{selectedApplication.businessDescription}</p>
                </div>
              )}

              <hr />

              <h5>Review Decision</h5>
              <Form.Group className="mb-3">
                <Form.Label>Action *</Form.Label>
                <div>
                  <Form.Check
                    type="radio"
                    label="Approve"
                    name="action"
                    value="approve"
                    checked={reviewData.action === 'approve'}
                    onChange={(e) => setReviewData({...reviewData, action: e.target.value})}
                  />
                  <Form.Check
                    type="radio"
                    label="Reject"
                    name="action"
                    value="reject"
                    checked={reviewData.action === 'reject'}
                    onChange={(e) => setReviewData({...reviewData, action: e.target.value})}
                  />
                </div>
              </Form.Group>

              {reviewData.action === 'reject' && (
                <Form.Group className="mb-3">
                  <Form.Label>Rejection Reason *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={reviewData.rejectionReason}
                    onChange={(e) => setReviewData({...reviewData, rejectionReason: e.target.value})}
                    placeholder="Please provide a reason for rejection"
                  />
                </Form.Group>
              )}

              <Form.Group className="mb-3">
                <Form.Label>Notes (Optional)</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  value={reviewData.notes}
                  onChange={(e) => setReviewData({...reviewData, notes: e.target.value})}
                  placeholder="Additional notes for this application"
                />
              </Form.Group>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button 
            variant={reviewData.action === 'approve' ? 'success' : 'danger'}
            onClick={handleSubmitReview}
            disabled={submitting}
          >
            {submitting ? 'Processing...' : `${reviewData.action === 'approve' ? 'Approve' : 'Reject'} Application`}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default SellerApplications;
