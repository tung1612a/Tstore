import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentUsers(data.recentUsers);
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
          <h1 className="mb-4">Admin Dashboard</h1>
          
          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-md-3 mb-3">
              <div className="card bg-primary text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Users</h5>
                  <h2>{stats?.totalUsers || 0}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Sellers</h5>
                  <h2>{stats?.totalSellers || 0}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Products</h5>
                  <h2>{stats?.totalProducts || 0}</h2>
                </div>
              </div>
            </div>
            <div className="col-md-3 mb-3">
              <div className="card bg-warning text-white">
                <div className="card-body">
                  <h5 className="card-title">Total Orders</h5>
                  <h2>{stats?.totalOrders || 0}</h2>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Users */}
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">Recent Users</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Phone</th>
                          <th>Created At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.map(user => (
                          <tr key={user._id}>
                            <td>{user.fullName}</td>
                            <td>{user.email}</td>
                            <td>
                              <span className={`badge ${
                                user.role === 'admin' ? 'bg-danger' :
                                user.role === 'seller' ? 'bg-warning' : 'bg-primary'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td>{user.phone || 'N/A'}</td>
                            <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
