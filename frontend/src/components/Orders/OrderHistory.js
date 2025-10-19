import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiPackage, FiSearch, FiFilter, FiEye, FiXCircle, FiCheckCircle, FiTruck } from 'react-icons/fi';
import { useUser } from '../../hooks/useUser';
import './OrderHistory.css';

const PAGE_SIZE = 10;

const statusMeta = {
  pending: { label: 'Chờ xác nhận', color: '#856404', bg: '#fff3cd', icon: <FiPackage /> },
  paid: { label: 'Đã thanh toán', color: '#155724', bg: '#d4edda', icon: <FiCheckCircle /> },
  shipped: { label: 'Đã giao hàng', color: '#004085', bg: '#cce7ff', icon: <FiTruck /> },
  completed: { label: 'Hoàn thành', color: '#0c5460', bg: '#d1ecf1', icon: <FiCheckCircle /> },
  cancelled: { label: 'Đã hủy', color: '#721c24', bg: '#f8d7da', icon: <FiXCircle /> }
};

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  });
}

const OrderHistory = () => {
  const { role } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setOrders([]);
    setPage(1);
    setHasMore(true);
    setLoading(true);
  }, [status, paymentStatus, fromDate, toDate]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const endpoint = role === 'seller' ? '/api/orders/seller' : '/api/orders/buyer';
        const params = new URLSearchParams({ page, limit: PAGE_SIZE });
        if (status) params.append('status', status);
        if (paymentStatus) params.append('paymentStatus', paymentStatus);
        if (fromDate) params.append('fromDate', fromDate);
        if (toDate) params.append('toDate', toDate);
        const res = await fetch(`http://localhost:5000${endpoint}?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(prev => page === 1 ? data.orders : [...prev, ...data.orders]);
          setTotalPages(data.totalPages);
          setHasMore(page < data.totalPages);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    };
    fetchOrders();
  }, [page, status, paymentStatus, fromDate, toDate, role]);

  useEffect(() => {
    if (!hasMore || loading) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first.isIntersecting && !isFetchingMore) {
        setIsFetchingMore(true);
        setPage(p => p + 1);
      }
    }, { root: null, rootMargin: '200px', threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loading, isFetchingMore]);

  const filtered = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase();
    return orders.filter(o => (
      o._id?.toLowerCase().includes(q) ||
      (role === 'seller' ? o.buyerId?.name : o.sellerId?.name)?.toLowerCase().includes(q) ||
      o.storeId?.storeName?.toLowerCase().includes(q)
    ));
  }, [orders, search, role]);

  const cancelOrder = async (orderId, reason) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason })
      });
      if (res.ok) {
        setPage(1);
        setLoading(true);
      }
    } catch (e) {
      console.error('Error cancelling order:', e);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, trackingNumber = '') => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus, trackingNumber })
      });
      if (res.ok) {
        setPage(1);
        setLoading(true);
      }
    } catch (e) {
      console.error('Error updating status:', e);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="order-history">
        <div className="history-container">
          <div className="loading-block">
            <div className="spinner" />
            <p>Đang tải đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-history">
      <div className="history-container">
        <div className="history-header">
          <div className="title-wrap">
            <h1>{role === 'seller' ? 'Quản lý đơn hàng' : 'Lịch sử đơn hàng'}</h1>
            <p>{role === 'seller' ? 'Theo dõi đơn từ khách hàng' : 'Theo dõi đơn hàng của bạn'}</p>
          </div>
          <div className="quick-stats">
            <div className="stat">
              <span className="label">Tổng</span>
              <span className="value">{orders.length}</span>
            </div>
            <div className="stat">
              <span className="label">Hoàn thành</span>
              <span className="value">{orders.filter(o => o.status === 'completed').length}</span>
            </div>
          </div>
        </div>

        <div className="history-filters">
          <div className="search">
            <FiSearch className="icon" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm theo mã, người bán/người mua, cửa hàng..." />
          </div>
          <div className="filters">
            <FiFilter className="fi" />
            <select value={status} onChange={e => setStatus(e.target.value)}>
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="paid">Đã thanh toán</option>
              <option value="shipped">Đã giao hàng</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
            <select value={paymentStatus} onChange={e => setPaymentStatus(e.target.value)}>
              <option value="">Tất cả thanh toán</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="completed">Đã thanh toán</option>
              <option value="failed">Thất bại</option>
              <option value="refunded">Hoàn tiền</option>
            </select>
            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <FiPackage size={64} />
            <h3>Không có đơn hàng</h3>
            <p>Hãy thử điều chỉnh bộ lọc hoặc từ khóa</p>
          </div>
        ) : (
          <div className="history-list">
            <div className="list-head">
              <div className="col id">Mã đơn</div>
              <div className="col partner">{role === 'seller' ? 'Người mua' : 'Người bán'}</div>
              <div className="col store">Cửa hàng</div>
              <div className="col date">Ngày tạo</div>
              <div className="col total">Tổng tiền</div>
              <div className="col status">Trạng thái</div>
              <div className="col actions">Thao tác</div>
            </div>
            {filtered.map(order => {
              const meta = statusMeta[order.status] || statusMeta.pending;
              return (
                <div key={order._id} className="list-row">
                  <div className="col id">#{order._id.slice(-8)}</div>
                  <div className="col partner">{role === 'seller' ? order.buyerId?.name : order.sellerId?.name || '—'}</div>
                  <div className="col store">{order.storeId?.storeName || '—'}</div>
                  <div className="col date">{formatDate(order.createdAt)}</div>
                  <div className="col total">{order.totalPrice?.toLocaleString()}đ</div>
                  <div className="col status">
                    <span className="badge" style={{ color: meta.color, background: meta.bg }}>
                      {meta.icon}
                      <span>{meta.label}</span>
                    </span>
                  </div>
                  <div className="col actions">
                    <button className="btn ghost" onClick={() => window.open(`/orders/${order._id}`, '_blank')}>
                      <FiEye size={16} /> Chi tiết
                    </button>
                    {role === 'seller' ? (
                      <>
                        {order.status === 'paid' && (
                          <button className="btn primary" onClick={() => { const tn = prompt('Nhập mã vận đơn:'); if (tn) updateOrderStatus(order._id, 'shipped', tn); }}>
                            <FiTruck size={16} /> Giao hàng
                          </button>
                        )}
                        {order.status === 'shipped' && (
                          <button className="btn success" onClick={() => updateOrderStatus(order._id, 'completed')}>
                            <FiCheckCircle size={16} /> Hoàn thành
                          </button>
                        )}
                      </>
                    ) : (
                      <>
                        {['pending', 'paid'].includes(order.status) && (
                          <button className="btn danger" onClick={() => { const reason = prompt('Lý do hủy đơn hàng:'); if (reason) cancelOrder(order._id, reason); }}>
                            <FiXCircle size={16} /> Hủy
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {hasMore && <div ref={sentinelRef} style={{ height: 1 }} />}
          </div>
        )}

        {totalPages > 1 && (
          <div className="history-pagination">
            <button className="pg-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>Trước</button>
            <div className="pg-info">Trang {page} / {totalPages}</div>
            <button className="pg-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Sau</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;


