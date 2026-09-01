import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CLIENT';
  phone?: string;
  companyName?: string;
}

export interface AuthModalOptions {
  redirectUrl?: string;
  initialTab?: 'login' | 'register' | 'otp';
  serviceTitle?: string;
  customTitle?: string;
  customMessage?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User, redirectUrl?: string) => void;
  logout: () => void;
  authModal: {
    isOpen: boolean;
    options: AuthModalOptions;
  };
  openAuthModal: (options?: AuthModalOptions) => void;
  closeAuthModal: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });

  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    options: AuthModalOptions;
  }>({
    isOpen: false,
    options: {}
  });

  const login = (newToken: string, newUser: User, redirectUrl?: string) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setAuthModal(prev => ({ ...prev, isOpen: false }));

    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  const openAuthModal = (options: AuthModalOptions = {}) => {
    setAuthModal({
      isOpen: true,
      options: {
        initialTab: options.initialTab || 'login',
        customTitle: options.customTitle || 'Login or Create an Account to Start Your Project',
        customMessage: options.customMessage || 'To submit a project request and track your project, please log in or create your free client account first.',
        ...options
      }
    });
  };

  const closeAuthModal = () => {
    setAuthModal(prev => ({ ...prev, isOpen: false }));
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const freshUser = await res.json();
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      }
    } catch (e) {
      console.error('Failed to refresh user', e);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      login,
      logout,
      authModal,
      openAuthModal,
      closeAuthModal,
      refreshUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Fallback if accessed outside provider
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    return {
      isAuthenticated: !!token,
      user,
      token,
      login: () => {},
      logout: () => {},
      authModal: { isOpen: false, options: {} },
      openAuthModal: () => {},
      closeAuthModal: () => {},
      refreshUser: async () => {}
    } as any;
  }
  return context;
};
