import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const SellerDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/seller/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setLowStockProducts(data.lowStockProducts);
        setRecentOrders(data.recentOrders);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
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
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h1 className="mb-4">Seller Dashboard</h1>
          
          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Products</h5>
                  <h2>{stats?.totalProducts || 0}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Orders</h5>
                  <h2>{stats?.totalOrders || 0}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Revenue</h5>
                  <h2>${stats?.totalRevenue?.toFixed(2) || '0.00'}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <h5 className="card-title">Low Stock Items</h5>
                  <h2>{stats?.lowStockCount || 0}</h2>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Low Stock Products */}
            <div className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Low Stock Products</h5>
                </div>
                <div className="card-body">
                  {lowStockProducts.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Stock</th>
                            <th>Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lowStockProducts.map(product => (
                            <tr key={product._id}>
                              <td>{product.title}</td>
                              <td>
                                <span className={`badge ${product.stock <= 5 ? 'bg-danger' : 'bg-warning'}`}>
                                  {product.stock}
                                </span>
                              </td>
                              <td>${product.price}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted">No low stock products</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Recent Orders</h5>
                </div>
                <div className="card-body">
                  {recentOrders.length > 0 ? (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Customer</th>
                            <th>Amount</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentOrders.map(order => (
                            <tr key={order._id}>
                              <td>{order._id.slice(-8)}</td>
                              <td>{order.userId?.fullName}</td>
                              <td>${order.totalAmount}</td>
                              <td>
                                <span className={`badge ${
                                  order.status === 'completed' ? 'bg-success' :
                                  order.status === 'pending' ? 'bg-warning' : 'bg-secondary'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-muted">No recent orders</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
