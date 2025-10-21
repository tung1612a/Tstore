import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requiredRole = null, 
  requiredPermission = null,
  allowedRoles = null 
}) => {
  const { isAuthenticated, user, loading, hasPermission } = useAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check specific role
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // Check allowed roles
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Check permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
