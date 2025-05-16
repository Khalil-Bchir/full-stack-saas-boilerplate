'use client';

import { Spinner } from '@/components/common/spinner';
import { selectAuth } from '@/services/v1/authSlice';
import { createContext, useContext, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

interface AuthContextProps {
  isAuthenticated: boolean | null;
  setAuthenticated: (isAuthenticated: boolean) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useSelector(selectAuth);
  const [localAuth, setLocalAuth] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('access_token');
      setLocalAuth(!!token);
    }
  }, [isAuthenticated]);

  const setAuthenticated = (value: boolean) => {
    setLocalAuth(value);
    if (value && typeof window !== 'undefined') {
      sessionStorage.setItem('access_token', 'your_token_value_here');
    } else if (typeof window !== 'undefined') {
      sessionStorage.removeItem('access_token');
    }
  };

  if (localAuth === null) {
    return (
      <div className="bg-background flex h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated: localAuth, setAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
