import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_USER':
      localStorage.setItem('user', JSON.stringify(action.payload));
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Kiểm tra token khi app khởi động
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        try {
          // Kiểm tra token với server
          const response = await fetch('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const serverUserData = await response.json();
            dispatch({ type: 'SET_USER', payload: serverUserData });
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        dispatch({ type: 'LOGIN_SUCCESS', payload: data });
        return { success: true, user: data.user };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const isAdmin = () => {
    return state.user && state.user.role === 'admin';
  };

  const isDevAdmin = () => {
    return state.user && state.user.role === 'devadmin';
  };

  const isSeller = () => {
    return state.user && state.user.role === 'seller';
  };

  const isCustomer = () => {
    return state.user && state.user.role === 'customer';
  };

  const hasPermission = (permission) => {
    if (!state.user) return false;
    
    const role = state.user.role;
    
    // DevAdmin có tất cả quyền
    if (role === 'devadmin') return true;
    
    // Admin có quyền business
    if (role === 'admin') {
      const adminPermissions = [
        'manage_products',
        'manage_orders', 
        'manage_users',
        'manage_sellers',
        'view_analytics',
        'manage_categories',
        'manage_promotions'
      ];
      return adminPermissions.includes(permission);
    }
    
    // Seller có quyền riêng
    if (role === 'seller') {
      const sellerPermissions = [
        'manage_own_products',
        'manage_own_orders',
        'view_own_analytics'
      ];
      return sellerPermissions.includes(permission);
    }
    
    // Customer có quyền cơ bản
    if (role === 'customer') {
      const customerPermissions = [
        'view_products',
        'place_orders',
        'manage_own_profile'
      ];
      return customerPermissions.includes(permission);
    }
    
    return false;
  };

  const value = {
    ...state,
    login,
    logout,
    isAdmin,
    isDevAdmin,
    isSeller,
    isCustomer,
    hasPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
