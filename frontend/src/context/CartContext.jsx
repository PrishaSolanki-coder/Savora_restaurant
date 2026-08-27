import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { extractMessage } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get('/cart');
      setItems(res.data.data.items);
    } catch {
      // fail quietly — cart icon just shows 0 until the next successful refresh
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  async function addToCart(menuItemId, quantity = 1) {
    try {
      const res = await api.post('/cart/items', { menuItemId, quantity });
      setItems(res.data.data.items);
      return { success: true };
    } catch (err) {
      return { success: false, message: extractMessage(err) };
    }
  }

  async function updateQuantity(cartItemId, quantity) {
    try {
      const res = await api.put(`/cart/items/${cartItemId}`, { quantity });
      setItems(res.data.data.items);
      return { success: true };
    } catch (err) {
      return { success: false, message: extractMessage(err) };
    }
  }

  async function removeFromCart(cartItemId) {
    try {
      const res = await api.delete(`/cart/items/${cartItemId}`);
      setItems(res.data.data.items);
      return { success: true };
    } catch (err) {
      return { success: false, message: extractMessage(err) };
    }
  }

  async function clearCart() {
    try {
      await api.delete('/cart');
      setItems([]);
      return { success: true };
    } catch (err) {
      return { success: false, message: extractMessage(err) };
    }
  }

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  const value = {
    items, loading, itemCount, subtotal,
    addToCart, updateQuantity, removeFromCart, clearCart, refreshCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
