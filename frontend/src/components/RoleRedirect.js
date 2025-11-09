import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect theo role đến dashboard tương ứng
      if (user.role === 'devadmin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'seller') {
        navigate('/seller');
      } else if (user.role === 'shipper') {
        navigate('/shipper');
      } else {
        navigate('/');
      }
    } else {
      navigate('/login');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Redirecting...</span>
      </div>
    </div>
  );
};

export default RoleRedirect;
