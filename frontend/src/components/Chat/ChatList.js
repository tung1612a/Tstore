import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Badge, Spinner, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMessageSquare, FiClock, FiHome } from 'react-icons/fi';
import './Chat.css';

function ChatList() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login');
      return;
    }

    fetchConversations();
    
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user, token]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      } else {
        setError('Không thể tải danh sách cuộc trò chuyện');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  const getOtherUser = (conversation) => {
    if (user.role === 'customer') {
      return conversation.sellerId;
    } else {
      return conversation.customerId;
    }
  };

  const getUnreadCount = (conversation) => {
    if (user.role === 'customer') {
      return conversation.customerUnreadCount || 0;
    } else {
      return conversation.sellerUnreadCount || 0;
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="d-flex align-items-center">
          <FiMessageSquare size={24} className="me-2" />
          <h3>Tin nhắn của tôi</h3>
        </div>
        <Button 
          variant="outline-primary" 
          onClick={() => navigate('/')}
          className="d-flex align-items-center"
        >
          <FiHome className="me-2" />
          Trang chủ
        </Button>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <FiMessageSquare size={48} className="text-muted mb-3" />
            <p className="text-muted mb-3">Bạn chưa có cuộc trò chuyện nào</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/')}
              className="d-flex align-items-center mx-auto"
            >
              <FiHome className="me-2" />
              Quay lại trang chủ
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <ListGroup>
          {conversations.map((conversation) => {
            const otherUser = getOtherUser(conversation);
            const unreadCount = getUnreadCount(conversation);

            return (
              <ListGroup.Item
                key={conversation._id}
                action
                onClick={() => navigate(`/chat/${conversation._id}`)}
                className="conversation-item"
                style={{ cursor: 'pointer' }}
              >
                <div className="d-flex align-items-center">
                  <img
                    src={otherUser.avatarUrl || '/logo192.png'}
                    alt={otherUser.fullName}
                    className="conversation-avatar me-3"
                    onError={(e) => {
                      e.target.src = '/logo192.png';
                    }}
                  />
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center">
                      <h6 className="mb-1">{otherUser.fullName}</h6>
                      <small className="text-muted">
                        <FiClock size={12} className="me-1" />
                        {formatTime(conversation.lastMessageAt)}
                      </small>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <p className="mb-0 text-muted text-truncate" style={{ maxWidth: '400px' }}>
                        {conversation.lastMessage || 'Chưa có tin nhắn'}
                      </p>
                      {unreadCount > 0 && (
                        <Badge bg="danger" className="ms-2">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      )}
    </Container>
  );
}

export default ChatList;

