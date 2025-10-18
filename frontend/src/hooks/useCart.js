import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateQuantity, clearCart } from '../store/cartSlice';

export const useCart = () => {
  const dispatch = useDispatch();
  const cart = useSelector(state => state.cart);

  const addItem = (product, quantity = 1) => {
    if (!product || !product._id) {
      console.error('Invalid product data');
      return;
    }
    
    dispatch(addToCart({ product, quantity }));
  };

  const removeItem = (productId) => {
    if (!productId) {
      console.error('Product ID is required');
      return;
    }
    
    dispatch(removeFromCart(productId));
  };

  const updateItemQuantity = (productId, quantity) => {
    if (!productId || quantity < 0) {
      console.error('Invalid product ID or quantity');
      return;
    }
    
    dispatch(updateQuantity({ productId, quantity }));
  };

  const clearAllItems = () => {
    dispatch(clearCart());
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
    totalQuantity: cart.totalQuantity,
    totalAmount: cart.totalAmount,
    isEmpty: cart.items.length === 0,
    
    addItem,
    removeItem,
    updateItemQuantity,
    clearAllItems,
    
    isInCart,
    getItemQuantity,
  };
};
