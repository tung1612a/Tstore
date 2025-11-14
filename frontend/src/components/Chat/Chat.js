import React, { useState, useEffect, useRef } from 'react';
import { Container, Card, InputGroup, Form, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { FiSend, FiArrowLeft, FiMessageSquare, FiHome, FiPackage, FiImage, FiX } from 'react-icons/fi';
import './Chat.css';

function Chat() {
    const { conversationId } = useParams();
    const navigate = useNavigate();
    const { user, token, isAuthenticated } = useAuth();
    const { showWarning, showError } = useToast();
    const [messages, setMessages] = useState([]);
    const [conversation, setConversation] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showImageModal, setShowImageModal] = useState(false);
    const [viewingImage, setViewingImage] = useState(null);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    const fileInputRef = useRef(null);

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

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                showWarning('Ảnh không được vượt quá 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                showWarning('Vui lòng chọn file ảnh');
                return;
            }
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if ((!message.trim() && !selectedImage) || sending) return;

        setSending(true);
        try {
            const formData = new FormData();
            formData.append('conversationId', conversationId);
            if (message.trim()) {
                formData.append('content', message.trim());
            }
            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            const response = await fetch('http://localhost:5000/api/chat/messages', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (response.ok) {
                const newMessage = await response.json();
                setMessages([...messages, newMessage]);
                setMessage('');
                setSelectedImage(null);
                setImagePreview(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                fetchConversation(); // Update conversation last message
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Không thể gửi tin nhắn');
            }
        } catch (err) {
            setError('Lỗi kết nối');
        } finally {
            setSending(false);
        }
    };

    const handleImageClick = (imageUrl) => {
        setViewingImage(imageUrl);
        setShowImageModal(true);
    };

    const formatTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const getOtherUser = () => {
        if (!conversation) return null;
        if (conversation.conversationType === 'seller-seller') {
            // Seller-seller: trả về seller khác
            if (conversation.sellerId?._id?.toString() === user._id?.toString() || 
                conversation.sellerId?.toString() === user._id?.toString()) {
                return conversation.sellerId2;
            } else {
                return conversation.sellerId;
            }
        } else {
            // Customer-seller
            if (user.role === 'customer') {
                return conversation.sellerId;
            } else {
                return conversation.customerId;
            }
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
                                        <h6 className="mb-0">{otherUser?.fullName}</h6>
                                        <small className="text-muted">
                                            {conversation?.conversationType === 'seller-seller' 
                                                ? 'Người bán' 
                                                : (user.role === 'customer' ? 'Người bán' : 'Khách hàng')}
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
                    {/* Hiển thị thông tin sản phẩm nếu có */}
                    {conversation?.productId && (
                        <Card className="mb-3 product-info-card" style={{ border: '1px solid #e0e0e0' }}>
                            <Card.Body className="p-3">
                                <div className="d-flex align-items-center">
                                    <div className="product-info-image me-3">
                                        <img
                                            src={conversation.productId.image || conversation.productId.imageURL || '/logo192.png'}
                                            alt={conversation.productId.title}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                border: '1px solid #e0e0e0'
                                            }}
                                            onError={(e) => {
                                                e.target.src = '/logo192.png';
                                            }}
                                        />
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex align-items-center mb-1">
                                            <FiPackage size={16} className="me-2 text-muted" />
                                            <small className="text-muted">Sản phẩm đang thảo luận</small>
                                        </div>
                                        <h6 className="mb-1" style={{ fontSize: '14px', fontWeight: '600' }}>
                                            {conversation.productId.title}
                                        </h6>
                                        <div className="d-flex align-items-center justify-content-between">
                                            <span className="text-danger fw-bold">
                                                {conversation.productId.price?.toLocaleString('vi-VN')}₫
                                            </span>
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => navigate(`/product/${conversation.productId._id}`)}
                                            >
                                                Xem sản phẩm
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    )}

                    {messages.length === 0 ? (
                        <div className="text-center text-muted py-5">
                            <FiMessageSquare size={48} className="mb-3" />
                            <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMyMessage = msg.senderId._id === user._id || msg.senderId._id === user.id;
                            const imageUrl = msg.imageUrl ? (msg.imageUrl.startsWith('http') ? msg.imageUrl : `http://localhost:5000${msg.imageUrl}`) : null;
                            return (
                                <div
                                    key={msg._id}
                                    className={`message-wrapper ${isMyMessage ? 'my-message' : 'other-message'}`}
                                >
                                    <div className="message-bubble">
                                        {imageUrl && (
                                            <div className="message-image mb-2">
                                                <img
                                                    src={imageUrl}
                                                    alt="Message attachment"
                                                    onClick={() => handleImageClick(imageUrl)}
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '300px',
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        objectFit: 'cover'
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {msg.content && (
                                            <p className="mb-1">{msg.content}</p>
                                        )}
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
                    {imagePreview && (
                        <div className="mb-2 position-relative" style={{ maxWidth: '200px' }}>
                            <img
                                src={imagePreview}
                                alt="Preview"
                                style={{
                                    width: '100%',
                                    maxHeight: '150px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    border: '1px solid #dee2e6'
                                }}
                            />
                            <Button
                                variant="danger"
                                size="sm"
                                className="position-absolute top-0 end-0"
                                style={{ borderRadius: '50%', width: '24px', height: '24px', padding: 0 }}
                                onClick={removeImage}
                            >
                                <FiX size={12} />
                            </Button>
                        </div>
                    )}
                    <Form onSubmit={handleSendMessage}>
                        <InputGroup>
                            <Button
                                variant="outline-secondary"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={sending}
                            >
                                <FiImage size={20} />
                            </Button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                style={{ display: 'none' }}
                            />
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
                                disabled={sending || (!message.trim() && !selectedImage)}
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

                {/* Modal để xem ảnh phóng to */}
                <Modal
                    show={showImageModal}
                    onHide={() => setShowImageModal(false)}
                    centered
                    size="lg"
                    contentClassName="bg-dark"
                >
                    <Modal.Body className="p-0 position-relative bg-dark">
                        <Button
                            variant="link"
                            className="position-absolute top-0 end-0 text-white"
                            onClick={() => setShowImageModal(false)}
                            style={{
                                zIndex: 1050,
                                padding: '10px',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                borderRadius: '50%'
                            }}
                        >
                            <FiX size={24} />
                        </Button>
                        {viewingImage && (
                            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                                <img
                                    src={viewingImage}
                                    alt="Full size"
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '80vh',
                                        height: 'auto',
                                        display: 'block'
                                    }}
                                />
                            </div>
                        )}
                    </Modal.Body>
                </Modal>
            </Card>
        </Container>
    );
}

export default Chat;

