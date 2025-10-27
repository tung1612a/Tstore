import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const PermissionGuard = ({ 
  children, 
  permission, 
  role, 
  allowedRoles,
  fallback = null,
  showError = false 
}) => {
  const { hasPermission, user } = useAuth();

  // Check if user has required permission
  if (permission && !hasPermission(permission)) {
    if (showError) {
      return (
        <div className="alert alert-warning">
          <strong>Không có quyền truy cập!</strong> Bạn không có quyền thực hiện hành động này.
        </div>
      );
    }
    return fallback;
  }

  // Check if user has required role
  if (role && user?.role !== role) {
    if (showError) {
      return (
        <div className="alert alert-warning">
          <strong>Không có quyền truy cập!</strong> Bạn cần có quyền {role} để thực hiện hành động này.
        </div>
      );
    }
    return fallback;
  }

  // Check if user has one of allowed roles
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    if (showError) {
      return (
        <div className="alert alert-warning">
          <strong>Không có quyền truy cập!</strong> Bạn cần có một trong các quyền: {allowedRoles.join(', ')}.
        </div>
      );
    }
    return fallback;
  }

  return children;
};

export default PermissionGuard;
