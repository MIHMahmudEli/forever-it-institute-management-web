'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, api } from '../api/api-client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('fit_access_token');
      const storedUser = localStorage.getItem('fit_user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Ignore storage read error
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('fit_access_token', newToken);
    localStorage.setItem('fit_user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('fit_access_token');
    localStorage.removeItem('fit_user');
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  const refreshUser = async () => {
    try {
      const profile = await api.auth.me();
      setUser(profile);
      localStorage.setItem('fit_user', JSON.stringify(profile));
    } catch {
      logout();
    }
  };

  // Route protection
  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute =
      pathname === '/login' ||
      pathname.startsWith('/print/'); // Allow printing without breaking if shared or printed

    if (!user && !isPublicRoute) {
      router.push('/login');
    } else if (user && pathname === '/login') {
      router.push('/dashboard');
    }
  }, [user, isLoading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
