import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, InputGroup, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiSend, FiArrowLeft, FiMessageSquare, FiHome } from 'react-icons/fi';
import './Chat.css';

function Chat() {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user, token, isAuthenticated } = useAuth();
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (!isAuthenticated || !user || !token) {
            navigate('/login');
            return;
        }

        const loadData = () => {
            fetchConversation();
            fetchMessages();
        };

        loadData();

        // Poll for new messages every 2 seconds
        const interval = setInterval(loadData, 2000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [conversationId, isAuthenticated, user, token]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversation = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/chat/conversations/${conversationId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setConversation(data);
            }
        } catch (err) {
            console.error('Error fetching conversation:', err);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/chat/conversations/${conversationId}/messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data);
                setLoading(false);
            } else {
                setError('Không thể tải tin nhắn');
                setLoading(false);
            }
        } catch (err) {
            setError('Lỗi kết nối');
            setLoading(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim() || sending) return;

        setSending(true);
        try {
            const response = await fetch('http://localhost:5000/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    conversationId,
                    content: message.trim()
                })
            });

            if (response.ok) {
                const newMessage = await response.json();
                setMessages([...messages, newMessage]);
                setMessage('');
                fetchConversation(); // Update conversation last message
            } else {
                setError('Không thể gửi tin nhắn');
            }
        } catch (err) {
            setError('Lỗi kết nối');
        } finally {
            setSending(false);
        }
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const getOtherUser = () => {
        if (!conversation) return null;
        if (user.role === 'customer') {
            return conversation.sellerId;
        } else {
            return conversation.customerId;
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

    if (error && !conversation) {
        return (
            <Container className="mt-4">
                <Alert variant="danger">{error}</Alert>
                <Button onClick={() => navigate('/chat')}>Quay lại danh sách</Button>
            </Container>
        );
    }

    const otherUser = getOtherUser();

    return (
        <Container className="mt-4 chat-container">
            <Card className="chat-card">
                <Card.Header className="chat-header">
                    <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                            <Button
                                variant="link"
                                onClick={() => navigate('/chat')}
                                className="me-2 p-0"
                            >
                                <FiArrowLeft size={20} />
                            </Button>
                            {otherUser && (
                                <>
                                    <img
                                        src={otherUser.avatarUrl || '/logo192.png'}
                                        alt={otherUser.fullName}
                                        className="chat-header-avatar me-2"
                                        onError={(e) => {
                                            e.target.src = '/logo192.png';
                                        }}
                                    />
                                    <div>
                                        <h6 className="mb-0">{otherUser.fullName}</h6>
                                        <small className="text-muted">
                                            {user.role === 'customer' ? 'Người bán' : 'Khách hàng'}
                                        </small>
                                    </div>
                                </>
                            )}
                        </div>
                        <Button
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => navigate('/')}
                            className="d-flex align-items-center"
                        >
                            <FiHome className="me-1" size={16} />
                            Trang chủ
                        </Button>
                    </div>
                </Card.Header>

                <Card.Body
                    ref={chatContainerRef}
                    className="chat-messages"
                    style={{ height: '600px', overflowY: 'auto' }}
                >
                    {messages.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <FiMessageSquare size={48} className="mb-3" />
                            <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMyMessage = msg.senderId._id === user._id || msg.senderId._id === user.id;
                            return (
                                <div
                                    key={msg._id}
                                    className={`message-wrapper ${isMyMessage ? 'my-message' : 'other-message'}`}
                                >
                                    <div className="message-bubble">
                                        <p className="mb-1">{msg.content}</p>
                                        <small className="text-muted">{formatTime(msg.createdAt)}</small>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </Card.Body>

                <Card.Footer className="chat-footer">
                    {error && (
                        <Alert variant="danger" className="mb-2" onClose={() => setError(null)} dismissible>
                            {error}
                        </Alert>
                    )}
                    <Form onSubmit={handleSendMessage}>
                        <InputGroup>
                            <Form.Control
                                type="text"
                                placeholder="Nhập tin nhắn..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                disabled={sending}
                            />
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={sending || !message.trim()}
                            >
                                {sending ? (
                                    <Spinner animation="border" size="sm" />
                                ) : (
                                    <FiSend size={20} />
                                )}
                            </Button>
                        </InputGroup>
                    </Form>
                </Card.Footer>
            </Card>
        </Container>
    );
}

export default Chat;

