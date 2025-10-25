// Simple Auth Context for the app - Updated with API Client
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/utils/api-client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get user from session using the new API client
    const checkAuth = async () => {
      try {
        const data = await api.get('/auth/check.php');
        setUser(data.user);
      } catch (err) {
        console.error('Auth check failed:', err);
        // Si c'est une erreur 401, l'utilisateur sera automatiquement redirigé
        // par le client API, donc on ne fait rien ici
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const data = await api.post('/auth/login.php', credentials);
      setUser(data.user);
      return data;
    } catch (err) {
      throw new Error(err.message || 'Login failed');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout.php', {});
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
