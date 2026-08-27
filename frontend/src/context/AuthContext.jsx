import { createContext, useContext, useEffect, useState } from 'react';
import api, { extractMessage } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On first load, check localStorage for an existing session and verify
  // it against the backend so a stale/expired token doesn't silently "log
  // in" the UI.
  useEffect(() => {
    const token = localStorage.getItem('savora_token');
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.data.user))
      .catch(() => {
        localStorage.removeItem('savora_token');
        localStorage.removeItem('savora_user');
      })
      .finally(() => setLoading(false));
  }, []);

  async function register({ name, email, phone, password, confirmPassword }) {
    try {
      const res = await api.post('/auth/register', { name, email, phone, password, confirmPassword });
      const { user: newUser, token } = res.data.data;
      localStorage.setItem('savora_token', token);
      setUser(newUser);
      return { success: true };
    } catch (err) {
      return { success: false, message: extractMessage(err) };
    }
  }

  async function login({ email, password }) {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: loggedInUser, token } = res.data.data;
      localStorage.setItem('savora_token', token);
      setUser(loggedInUser);
      return { success: true };
    } catch (err) {
      return { success: false, message: extractMessage(err) };
    }
  }

  function logout() {
    localStorage.removeItem('savora_token');
    localStorage.removeItem('savora_user');
    setUser(null);
  }

  async function updateProfile({ name, phone }) {
    try {
      const res = await api.put('/users/me', { name, phone });
      setUser(res.data.data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: extractMessage(err) };
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN',
    register,
    login,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
