import { useAuth } from '../contexts/AuthContext';

export const usePermissions = () => {
  const { 
    user, 
    isAuthenticated, 
    hasPermission, 
    isDevAdmin, 
    isAdmin, 
    isSeller, 
    isCustomer 
  } = useAuth();

  const canManageProducts = () => {
    return hasPermission('manage_products') || hasPermission('manage_own_products');
  };

  const canManageOrders = () => {
    return hasPermission('manage_orders') || hasPermission('manage_own_orders');
  };

  const canManageUsers = () => {
    return hasPermission('manage_users');
  };

  const canViewAnalytics = () => {
    return hasPermission('view_analytics') || hasPermission('view_own_analytics');
  };

  const canAccessAdmin = () => {
    return isAdmin();
  };

  const canAccessDevAdmin = () => {
    return isDevAdmin();
  };

  const canManageSystem = () => {
    return isDevAdmin();
  };

  const canManageDatabase = () => {
    return isDevAdmin();
  };

  const canViewLogs = () => {
    return isDevAdmin();
  };

  const canManagePromotions = () => {
    return hasPermission('manage_promotions');
  };

  const canManageCategories = () => {
    return hasPermission('manage_categories');
  };

  const canManageSellers = () => {
    return hasPermission('manage_sellers');
  };

  return {
    user,
    isAuthenticated,
    hasPermission,
    isDevAdmin,
    isAdmin,
    isSeller,
    isCustomer,
    canManageProducts,
    canManageOrders,
    canManageUsers,
    canViewAnalytics,
    canAccessAdmin,
    canAccessDevAdmin,
    canManageSystem,
    canManageDatabase,
    canViewLogs,
    canManagePromotions,
    canManageCategories,
    canManageSellers
  };
};
