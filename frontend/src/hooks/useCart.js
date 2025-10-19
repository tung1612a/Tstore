import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5000/api/cart';

export const useCart = () => {
  const [cart, setCart] = useState({
    items: []
  });
  const [loading, setLoading] = useState(false);

  // Tính toán totalQuantity và totalAmount từ items
  const totalQuantity = cart.items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Lấy token từ localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Lấy giỏ hàng từ API
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_BASE_URL, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      } else {
        console.error('Error fetching cart:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load cart khi component mount
  useEffect(() => {
    fetchCart();
  }, []);

  const addItem = async (product, quantity = 1) => {
    if (!product || !product._id) {
      console.error('Invalid product data');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/add`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productId: product._id,
          quantity
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      } else {
        const error = await response.json();
        console.error('Error adding to cart:', error.message);
        alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (productId) => {
    if (!productId) {
      console.error('Product ID is required');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/remove/${productId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      } else {
        const error = await response.json();
        console.error('Error removing from cart:', error.message);
        alert('Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      alert('Có lỗi xảy ra khi xóa sản phẩm khỏi giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (productId, quantity) => {
    if (!productId || quantity < 0) {
      console.error('Invalid product ID or quantity');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/update`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productId,
          quantity
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      } else {
        const error = await response.json();
        console.error('Error updating quantity:', error.message);
        alert('Có lỗi xảy ra khi cập nhật số lượng');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Có lỗi xảy ra khi cập nhật số lượng');
    } finally {
      setLoading(false);
    }
  };

  const clearAllItems = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/clear`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data);
      } else {
        const error = await response.json();
        console.error('Error clearing cart:', error.message);
        alert('Có lỗi xảy ra khi xóa giỏ hàng');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Có lỗi xảy ra khi xóa giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const isInCart = (productId) => {
    return cart.items.some(item => item._id === productId);
  };

  const getItemQuantity = (productId) => {
    const item = cart.items.find(item => item._id === productId);
    return item ? item.quantity : 0;
  };

  return {
    items: cart.items,
    totalQuantity,
    totalAmount,
    isEmpty: cart.items.length === 0,
    loading,
    
    addItem,
    removeItem,
    updateItemQuantity,
    clearAllItems,
    
    isInCart,
    getItemQuantity,
    refreshCart: fetchCart
  };
};
