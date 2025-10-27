import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { 
  FiCheck, 
  FiEye, 
  FiClock, 
  FiPackage, 
  FiTruck, 
  FiCheckCircle, 
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiDollarSign,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiMessageSquare,
  FiMenu,
  FiArrowLeft,
  FiX,
} from 'react-icons/fi';
import './OrderManagement.css';

const OrderManagement = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [showShipperModal, setShowShipperModal] = useState(false);
  const [shippers, setShippers] = useState([]);
  const [selectedShipperId, setSelectedShipperId] = useState(null);
  const [orderToConfirm, setOrderToConfirm] = useState(null);
  const [shipperSearchTerm, setShipperSearchTerm] = useState('');
  const [shipperSortBy, setShipperSortBy] = useState('successRate');
  const [shipperPage, setShipperPage] = useState(1);
  const [shipperTotalPages, setShipperTotalPages] = useState(1);
  const [shipperHasMore, setShipperHasMore] = useState(false);
  const [loadingShippers, setLoadingShippers] = useState(false);
  const shipperModalRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [stats, setStats] = useState({
    pending: 0,
    confirmed: 0,
    shipped: 0,
    totalRevenue: 0
  });

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders/seller/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats({
          pending: data.pending || 0,
          confirmed: data.confirmed || 0,
          shipped: data.shipped || 0,
          totalRevenue: data.totalRevenue || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [token]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage
      });

      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }

      const response = await fetch(`http://localhost:5000/api/orders/seller?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setTotalPages(data.totalPages || 0);
        setTotalOrders(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, itemsPerPage, selectedStatus]);

  const getFilteredOrders = useCallback(() => {
    let filtered = [...orders];

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyerId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.buyerId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'amount_high':
          return b.totalPrice - a.totalPrice;
        case 'amount_low':
          return a.totalPrice - b.totalPrice;
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, searchTerm, sortBy]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus]);

  const fetchShippers = async (page = 1, append = false) => {
    
    try {
      setLoadingShippers(true);
      const params = new URLSearchParams({
        page: page,
        limit: 5,
        sortBy: shipperSortBy,
        search: shipperSearchTerm
      });

      const response = await fetch(`http://localhost:5000/api/shipper/shippers-with-stats?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (append) {
          setShippers(prev => [...prev, ...data.shippers]);
        } else {
          setShippers(data.shippers);
        }
        setShipperTotalPages(data.totalPages);
        setShipperHasMore(data.hasMore);
      } else {
        console.error('Failed to fetch shippers');
      }
    } catch (error) {
      console.error('Error fetching shippers:', error);
    } finally {
      setLoadingShippers(false);
    }
  };

  const handleConfirmOrderClick = async (orderId) => {
    setOrderToConfirm(orderId);
    setShipperPage(1);
    setShipperSearchTerm('');
    setShipperSortBy('successRate');
    setSelectedShipperId(null);
    await fetchShippers(1);
    setShowShipperModal(true);
  };

  useEffect(() => {
    if (showShipperModal) {
      setShipperPage(1);
      fetchShippers(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipperSearchTerm, shipperSortBy]);

  useEffect(() => {
    if (showShipperModal && shipperPage === 1 && shipperSearchTerm === '' && shipperSortBy === 'successRate') {
      fetchShippers(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showShipperModal]);

  useEffect(() => {
    if (showShipperModal || showOrderDetails) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showShipperModal, showOrderDetails]);

  useEffect(() => {
    if (!shipperModalRef.current || !shipperHasMore || loadingShippers) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = shipperModalRef.current;
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        handleLoadMoreShippers();
      }
    };

    const modalBody = shipperModalRef.current;
    modalBody.addEventListener('scroll', handleScroll);

    return () => {
      modalBody.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shipperHasMore, loadingShippers]);

  const handleLoadMoreShippers = () => {
    const nextPage = shipperPage + 1;
    setShipperPage(nextPage);
    fetchShippers(nextPage, true);
  };

  const handleConfirmOrder = async () => {
    if (!orderToConfirm) return;
    
    setConfirming(orderToConfirm);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderToConfirm}/confirm`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ shipperId: selectedShipperId })
      });

      if (response.ok) {
        await fetchOrders();
        await fetchStats();
        setShowShipperModal(false);
        setSelectedShipperId(null);
        setOrderToConfirm(null);
        alert('Đơn hàng đã được xác nhận thành công!');
      } else {
        const error = await response.json();
        alert(`Lỗi: ${error.message}`);
      }
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('Có lỗi xảy ra khi xác nhận đơn hàng');
    } finally {
      setConfirming(null);
    }
  };

  const handleViewOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data);
        setShowOrderDetails(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };


  const filteredOrders = getFilteredOrders();

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiClock className="text-warning" />;
      case 'confirmed':
        return <FiCheckCircle className="text-info" />;
      case 'awaiting_delivery':
        return <FiPackage className="text-info" />;
      case 'shipping':
        return <FiTruck className="text-warning" />;
      case 'delivered':
        return <FiTruck className="text-success" />;
      case 'completed':
        return <FiCheck className="text-success" />;
      case 'cancelled':
        return <FiX className="text-danger" />;
      default:
        return <FiClock className="text-muted" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning';
      case 'confirmed':
        return 'bg-info';
      case 'awaiting_delivery':
        return 'bg-info';
      case 'shipping':
        return 'bg-warning';
      case 'delivered':
        return 'bg-success';
      case 'completed':
        return 'bg-success';
      case 'cancelled':
        return 'bg-danger';
      default:
        return 'bg-muted';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'confirmed':
        return 'Đã xác nhận';
      case 'awaiting_delivery':
        return 'Chờ giao hàng';
      case 'shipping':
        return 'Đang giao hàng';
      case 'delivered':
        return 'Đã giao hàng';
      case 'completed':
        return 'Hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'cod':
        return 'COD';
      case 'bank_transfer':
        return 'Chuyển khoản';
      case 'momo':
        return 'MoMo';
      case 'zalopay':
        return 'ZaloPay';
      default:
        return method;
    }
  };

  const getPaymentMethodBadgeClass = (method) => {
    switch (method) {
      case 'cod':
        return 'bg-info';
      case 'bank_transfer':
        return 'bg-primary';
      case 'momo':
        return 'bg-danger';
      case 'zalopay':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  };

  if (loading) {
    return (
      <div className="om-loading-container">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="om-wrapper">
      <div className="om-container">
        <div className="om-header">
          <div className="om-header-top">
            <button 
              className="om-back-btn"
              onClick={() => navigate(-1)}
              title="Quay lại trang trước"
            >
              <FiArrowLeft size={20} />
              <span>Quay lại</span>
            </button>
            <div className="om-header-actions">
              <button 
                className="btn btn-outline-secondary"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FiFilter className="me-1" />
                Bộ lọc
              </button>
              <button 
                className="btn btn-outline-primary"
                onClick={() => {
                  fetchOrders();
                  fetchStats();
                }}
                disabled={loading}
              >
                <FiRefreshCw className={`me-1 ${loading ? 'om-spinning' : ''}`} />
                Làm mới
              </button>
            </div>
          </div>
          <div className="om-header-content">
            <div>
              <h1 className="om-page-title">Quản lý đơn hàng</h1>
              <p className="om-page-subtitle">Theo dõi và quản lý tất cả đơn hàng của bạn</p>
            </div>
          </div>
        </div>

        <div className="om-content-wrapper">
          <div className="row">
            <div className="col-12">

          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="om-stats-card h-100">
                <div className="card-body text-center py-3">
                  <div className="om-stats-icon bg-warning mx-auto">
                    <FiClock size={24} />
                  </div>
                  <div className="om-stats-number">{stats.pending}</div>
                  <div className="om-stats-label">Chờ xác nhận</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="om-stats-card h-100">
                <div className="card-body text-center py-3">
                  <div className="om-stats-icon bg-info mx-auto">
                    <FiCheckCircle size={24} />
                  </div>
                  <div className="om-stats-number">{stats.confirmed}</div>
                  <div className="om-stats-label">Đã xác nhận</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="om-stats-card h-100">
                <div className="card-body text-center py-3">
                  <div className="om-stats-icon bg-primary mx-auto">
                    <FiTruck size={24} />
                  </div>
                  <div className="om-stats-number">{stats.shipped}</div>
                  <div className="om-stats-label">Đang giao</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="om-stats-card h-100">
                <div className="card-body text-center py-3">
                  <div className="om-stats-icon bg-success mx-auto">
                    <FiDollarSign size={24} />
                  </div>
                  <div className="om-stats-number">{stats.totalRevenue.toLocaleString()}đ</div>
                  <div className="om-stats-label">Tổng doanh thu</div>
                </div>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Tìm kiếm</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <FiSearch />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm theo mã đơn hàng, tên khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Trạng thái</label>
                    <select
                      className="form-select"
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="all">Tất cả đơn hàng</option>
                      <option value="pending">Chờ xác nhận</option>
                      <option value="confirmed">Đã xác nhận</option>
                      <option value="awaiting_delivery">Chờ giao hàng</option>
                      <option value="shipping">Đang giao hàng</option>
                      <option value="delivered">Đã giao hàng</option>
                      <option value="completed">Hoàn thành</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Sắp xếp</label>
                    <select
                      className="form-select"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="newest">Mới nhất</option>
                      <option value="oldest">Cũ nhất</option>
                      <option value="amount_high">Giá cao nhất</option>
                      <option value="amount_low">Giá thấp nhất</option>
                    </select>
                  </div>
                  <div className="col-md-2 d-flex align-items-end">
                    <button 
                      className="btn btn-outline-secondary w-100"
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedStatus('all');
                        setSortBy('newest');
                        setCurrentPage(1);
                      }}
                    >
                      Xóa bộ lọc
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Orders Table */}
          <div className="om-orders-card card border-0 shadow-sm">
            <div className="om-card-header card-header bg-white border-0 py-3">
              <div className="d-flex justify-content-between align-items-center gap-3">
                <div className="d-flex align-items-center">
                  <h5 className="mb-0 me-3">Danh sách đơn hàng</h5>
                  <span className="badge bg-primary">{totalOrders} đơn hàng</span>
                </div>
              </div>
            </div>
            <div className="card-body p-0">
              {filteredOrders.length > 0 ? (
                <div className="table-responsive">
                  <table className="om-table table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th className="border-0 py-3 px-4 fw-semibold">Mã đơn hàng</th>
                        <th className="border-0 py-3 px-4 fw-semibold">Khách hàng</th>
                        <th className="border-0 py-3 px-4 fw-semibold">Số tiền</th>
                        <th className="border-0 py-3 px-4 fw-semibold">Thanh toán</th>
                        <th className="border-0 py-3 px-4 fw-semibold">Trạng thái</th>
                        <th className="border-0 py-3 px-4 fw-semibold">Ngày đặt</th>
                        <th className="border-0 py-3 px-4 fw-semibold text-center">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.map((order, index) => (
                        <tr key={order._id} className={index % 2 === 0 ? 'table-light' : ''}>
                          <td className="py-3 px-4">
                            <div className="d-flex align-items-center">
                              <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                                <FiPackage className="text-primary" size={16} />
                              </div>
                              <div>
                                <code className="fw-bold text-primary">#{order._id.slice(-8)}</code>
                                <br />
                                <small className="text-muted">ID: {order._id.slice(0, 8)}...</small>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="d-flex align-items-center">
                              <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                                <FiUser className="text-info" size={16} />
                              </div>
                              <div>
                                <strong className="d-block">{order.buyerId?.fullName || 'N/A'}</strong>
                                <small className="text-muted">{order.buyerId?.email}</small>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-end">
                              <h6 className="mb-0 text-success fw-bold">{order.totalPrice?.toLocaleString()}đ</h6>
                              <small className="text-muted">Tổng cộng</small>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`badge ${getPaymentMethodBadgeClass(order.paymentMethod)} px-3 py-2`}>
                              {getPaymentMethodText(order.paymentMethod)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div>
                              <span className={`badge ${getStatusBadgeClass(order.status)} d-flex align-items-center gap-1 px-3 py-2 mb-1`}>
                                {getStatusIcon(order.status)}
                                {getStatusText(order.status)}
                              </span>
                              {order.status === 'cancelled' && order.cancellationReason && (
                                <div className="mt-1">
                                  <small className="text-danger d-block" style={{ fontSize: '0.75rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={order.cancellationReason}>
                                    <strong>Lý do:</strong> {order.cancellationReason}
                                  </small>
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="d-flex align-items-center">
                              <FiCalendar className="text-muted me-2" size={14} />
                              <div>
                                <div className="fw-semibold">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
                                <small className="text-muted">{new Date(order.createdAt).toLocaleTimeString('vi-VN')}</small>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Dropdown align="end">
                              <Dropdown.Toggle 
                                variant="outline-secondary" 
                                size="sm" 
                                className="d-flex align-items-center gap-1"
                                title="Thao tác"
                              >
                                <FiMenu size={16} />
                              </Dropdown.Toggle>

                              <Dropdown.Menu>
                                <Dropdown.Item 
                                  onClick={() => handleViewOrderDetails(order._id)}
                                  className="d-flex align-items-center"
                                >
                                  <FiEye className="me-2" size={14} />
                                  Xem chi tiết
                                </Dropdown.Item>
                                
                                {order.status === 'pending' && (
                                  <>
                                    <Dropdown.Item 
                                      onClick={() => handleConfirmOrderClick(order._id)}
                                      disabled={confirming === order._id}
                                      className="d-flex align-items-center text-success"
                                    >
                                      {confirming === order._id ? (
                                        <>
                                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                          Đang xác nhận...
                                        </>
                                      ) : (
                                        <>
                                          <FiCheck className="me-2" size={14} />
                                          Xác nhận đơn hàng
                                        </>
                                      )}
                                    </Dropdown.Item>
                                  </>
                                )}
                              </Dropdown.Menu>
                            </Dropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px' }}>
                    <FiPackage size={32} className="text-muted" />
                  </div>
                  <h5 className="text-muted mb-2">Không có đơn hàng nào</h5>
                  <p className="text-muted mb-4">
                    {selectedStatus === 'all' 
                      ? 'Bạn chưa có đơn hàng nào' 
                      : `Không có đơn hàng nào ở trạng thái "${getStatusText(selectedStatus)}"`
                    }
                  </p>
                </div>
              )}
            </div>

            {totalOrders > 0 && (
              <div className="card-footer bg-white border-0 py-3">
                <div className="om-pagination-wrapper">
                  <div className="om-pagination-info">
                    <span className="text-muted">
                      Hiển thị trang {currentPage} / {totalPages} - Tổng {totalOrders} đơn hàng
                    </span>
                  </div>
                  <nav>
                    <ul className="pagination pagination-sm mb-0">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          Trước
                        </button>
                      </li>
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        const isCurrentPage = page === currentPage;
                        const isNearCurrentPage = Math.abs(page - currentPage) <= 2;
                        const isFirstPage = page === 1;
                        const isLastPage = page === totalPages;
                        
                        if (!isNearCurrentPage && !isFirstPage && !isLastPage) {
                          if (page === 2 || page === totalPages - 1) {
                            return <li key={page} className="page-item disabled"><span className="page-link">...</span></li>;
                          }
                          return null;
                        }
                        
                        return (
                          <li key={page} className={`page-item ${isCurrentPage ? 'active' : ''}`}>
                            <button 
                              className="page-link" 
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </li>
                        );
                      })}
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          Sau
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            )}
          </div>

            </div>
          </div>
        </div>
      </div>

      {showOrderDetails && selectedOrder && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-xl">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <div className="d-flex align-items-center">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                    <FiPackage size={20} />
                  </div>
                  <div>
                    <h5 className="modal-title mb-0">
                      Chi tiết đơn hàng #{selectedOrder.order._id.slice(-8)}
                    </h5>
                    <small className="opacity-75">
                      Đặt lúc {new Date(selectedOrder.order.createdAt).toLocaleString('vi-VN')}
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowOrderDetails(false)}
                ></button>
              </div>
              <div className="modal-body p-0">
                <div className="row g-0">
                  <div className="col-md-6 p-4 border-end">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-info bg-opacity-10 rounded-circle p-2 me-3">
                        <FiUser className="text-info" size={20} />
                      </div>
                      <h6 className="mb-0 fw-semibold">Thông tin khách hàng</h6>
                    </div>
                    <div className="ps-5">
                      <div className="mb-2">
                        <strong>Tên:</strong> {selectedOrder.order.buyerId?.fullName}
                      </div>
                      <div className="mb-2">
                        <strong>Email:</strong> {selectedOrder.order.buyerId?.email}
                      </div>
                      <div className="mb-2">
                        <strong>SĐT:</strong> {selectedOrder.order.buyerId?.phone || 'Chưa cập nhật'}
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 p-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="bg-warning bg-opacity-10 rounded-circle p-2 me-3">
                        <FiMapPin className="text-warning" size={20} />
                      </div>
                      <h6 className="mb-0 fw-semibold">Địa chỉ giao hàng</h6>
                    </div>
                    <div className="ps-5">
                      <div className="mb-2">
                        <strong>Tên người nhận:</strong> {selectedOrder.order.addressId?.fullName}
                      </div>
                      <div className="mb-2">
                        <strong>SĐT:</strong> {selectedOrder.order.addressId?.phone}
                      </div>
                      <div className="mb-2">
                        <strong>Địa chỉ:</strong> {selectedOrder.order.addressId?.street}
                      </div>
                      <div className="mb-2">
                        <strong>Thành phố:</strong> {selectedOrder.order.addressId?.city}, {selectedOrder.order.addressId?.state}
                      </div>
                    </div>
                  </div>
                </div>

                <hr className="my-0" />

                <div className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <div className="bg-success bg-opacity-10 rounded-circle p-2 me-3">
                      <FiPackage className="text-success" size={20} />
                    </div>
                    <h6 className="mb-0 fw-semibold">Sản phẩm đã đặt</h6>
                  </div>
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0">Sản phẩm</th>
                          <th className="border-0 text-center">Số lượng</th>
                          <th className="border-0 text-end">Đơn giá</th>
                          <th className="border-0 text-end">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={item.productId?.image || item.productId?.imageURL || '/placeholder.jpg'}
                                  alt={item.productId?.title}
                                  style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                                  className="me-3 rounded"
                                />
                                <div>
                                  <strong className="d-block">{item.productId?.title}</strong>
                                  <small className="text-muted">{item.productId?.description}</small>
                                </div>
                              </div>
                            </td>
                            <td className="text-center">
                              <span className="badge bg-primary">{item.quantity}</span>
                            </td>
                            <td className="text-end fw-semibold">{item.unitPrice?.toLocaleString()}đ</td>
                            <td className="text-end fw-bold text-success">{(item.unitPrice * item.quantity)?.toLocaleString()}đ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <hr className="my-0" />

                <div className="p-4 bg-light">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-primary bg-opacity-10 rounded-circle p-2 me-3">
                          <FiDollarSign className="text-primary" size={20} />
                        </div>
                        <h6 className="mb-0 fw-semibold">Thông tin thanh toán</h6>
                      </div>
                      <div className="ps-5">
                        <div className="mb-2">
                          <strong>Phương thức:</strong> 
                          <span className={`badge ${getPaymentMethodBadgeClass(selectedOrder.order.paymentMethod)} ms-2`}>
                            {getPaymentMethodText(selectedOrder.order.paymentMethod)}
                          </span>
                        </div>
                        <div className="mb-2">
                          <strong>Trạng thái:</strong> 
                          <span className={`badge ${getStatusBadgeClass(selectedOrder.order.status)} ms-2`}>
                            {getStatusText(selectedOrder.order.status)}
                          </span>
                        </div>
                        <div className="mb-2">
                          <strong>Tổng tiền:</strong> 
                          <span className="fw-bold text-success fs-5">{selectedOrder.order.totalPrice?.toLocaleString()}đ</span>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="d-flex align-items-center mb-3">
                        <div className="bg-secondary bg-opacity-10 rounded-circle p-2 me-3">
                          <FiMessageSquare className="text-secondary" size={20} />
                        </div>
                        <h6 className="mb-0 fw-semibold">
                          {selectedOrder.order.status === 'cancelled' ? 'Lý do hủy đơn' : 'Ghi chú'}
                        </h6>
                      </div>
                      <div className="ps-5">
                        <div className={`bg-white p-3 rounded border ${selectedOrder.order.status === 'cancelled' ? 'border-danger' : ''}`}>
                          {(selectedOrder.order.status === 'cancelled' && selectedOrder.order.cancellationReason) ? (
                            <div>
                              <span className="badge bg-danger mb-2">Lý do hủy</span>
                              <p className="mb-0">{selectedOrder.order.cancellationReason}</p>
                            </div>
                          ) : selectedOrder.order.notes ? (
                            <span>{selectedOrder.order.notes}</span>
                          ) : (
                            <span className="text-muted fst-italic">
                              {selectedOrder.order.status === 'cancelled' ? 'Không có lý do' : 'Không có ghi chú'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer bg-light border-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowOrderDetails(false)}
                >
                  <FiX className="me-1" />
                  Đóng
                </button>
                {selectedOrder.order.status === 'pending' && (
                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={() => {
                      handleConfirmOrderClick(selectedOrder.order._id);
                      setShowOrderDetails(false);
                    }}
                    disabled={confirming === selectedOrder.order._id}
                  >
                    {confirming === selectedOrder.order._id ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        Đang xử lý...
                      </>
                    ) : (
                      <>
                        <FiCheck className="me-1" />
                        Xác nhận đơn hàng
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showShipperModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content border-0 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <div className="d-flex align-items-center">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                    <FiTruck size={20} />
                  </div>
                  <div>
                    <h5 className="modal-title mb-0">Chọn người giao hàng</h5>
                    <small className="opacity-75">Chọn shipper để giao đơn hàng này</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowShipperModal(false);
                    setSelectedShipperId(null);
                    setOrderToConfirm(null);
                  }}
                ></button>
              </div>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }} ref={shipperModalRef}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <div className="input-group">
                      <span className="input-group-text">
                        <FiSearch />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm kiếm shipper..."
                        value={shipperSearchTerm}
                        onChange={(e) => setShipperSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <select
                      className="form-select"
                      value={shipperSortBy}
                      onChange={(e) => setShipperSortBy(e.target.value)}
                    >
                      <option value="successRate">Sắp xếp: Tỷ lệ thành công</option>
                      <option value="totalOrders">Sắp xếp: Tổng số đơn</option>
                      <option value="name">Sắp xếp: Theo tên</option>
                    </select>
                  </div>
                </div>

                {loadingShippers && shippers.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Đang tải shippers...</p>
                  </div>
                ) : shippers.length > 0 ? (
                  <>
                    <div className="d-flex flex-column gap-2">
                      {shippers.map((shipper) => (
                      <div 
                        key={shipper._id}
                        className={`card ${selectedShipperId === shipper._id ? 'border-primary' : 'border-secondary'}`}
                        style={{ 
                          cursor: 'pointer',
                          transition: 'all 0.3s',
                          borderWidth: selectedShipperId === shipper._id ? '2px' : '1px'
                        }}
                        onClick={() => setSelectedShipperId(shipper._id)}
                      >
                        <div className="card-body p-3">
                          <div className="d-flex align-items-center">
                            <div className={`bg-primary bg-opacity-10 rounded-circle p-2 ${selectedShipperId === shipper._id ? 'bg-primary' : ''}`}>
                              <FiTruck className={selectedShipperId === shipper._id ? 'text-white' : 'text-primary'} size={20} />
                            </div>
                            <div className="ms-3 flex-grow-1">
                              <h6 className="mb-0">{shipper.fullName}</h6>
                              <small className="text-muted">{shipper.email}</small>
                              {shipper.phone && <div><small className="text-muted">{shipper.phone}</small></div>}
                            </div>
                            
                            {/* Stats - displayed in one line */}
                            <div className="d-flex align-items-center gap-3 me-3">
                              <div className="text-center px-2">
                                <div className="fw-bold text-primary">{shipper.stats.totalOrders}</div>
                                <small className="text-muted">Tổng</small>
                              </div>
                              <div className="text-center px-2">
                                <div className="fw-bold text-success">{shipper.stats.completedOrders}</div>
                                <small className="text-muted">Thành công</small>
                              </div>
                              <div className="text-center px-2">
                                <div className="fw-bold text-danger">{shipper.stats.cancelledOrders}</div>
                                <small className="text-muted">Thất bại</small>
                              </div>
                              <div className="text-center px-2">
                                <div className="fw-bold text-warning">{shipper.stats.successRate}%</div>
                                <small className="text-muted">Tỷ lệ</small>
                              </div>
                            </div>

                            {selectedShipperId === shipper._id && (
                              <div>
                                <FiCheckCircle className="text-success" size={24} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                        ))}
                    </div>

                    {loadingShippers && (
                    <div className="text-center py-3">
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      <span className="text-muted">Đang tải thêm shippers...</span>
                    </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-5">
                    <FiTruck size={48} className="text-muted mb-3" />
                    <p className="text-muted">Không tìm thấy shipper nào</p>
                    {shipperSearchTerm && (
                      <small className="text-muted">Thử từ khóa khác</small>
                    )}
                  </div>
                )}
              </div>
              <div className="modal-footer bg-light border-0">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowShipperModal(false);
                    setSelectedShipperId(null);
                    setOrderToConfirm(null);
                  }}
                >
                  <FiX className="me-1" />
                  Hủy
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={handleConfirmOrder}
                  disabled={!selectedShipperId || confirming === orderToConfirm}
                >
                  {confirming === orderToConfirm ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                      Đang xác nhận...
                    </>
                  ) : (
                    <>
                      <FiCheck className="me-1" />
                      Xác nhận và chọn shipper
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;

