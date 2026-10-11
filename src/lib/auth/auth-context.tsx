'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { User, api } from '../api/api-client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isStudent: boolean;
  mustChangePassword: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isLoading: true,
  isAdmin: false,
  isStaff: false,
  isStudent: false,
  mustChangePassword: false,
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

  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF';
  const isStudent = user?.role === 'STUDENT';
  const mustChangePassword = Boolean(user?.mustChangePassword);

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

    if (newUser.role === 'STUDENT') {
      if (newUser.mustChangePassword) {
        router.push('/student/change-password');
      } else {
        router.push('/student/dashboard');
      }
    } else {
      router.push('/dashboard');
    }
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
      pathname.startsWith('/print/'); // Allow printing without authentication check

    if (!user && !isPublicRoute) {
      router.push('/login');
      return;
    }

    if (user && pathname === '/login') {
      if (isStudent) {
        router.push(mustChangePassword ? '/student/change-password' : '/student/dashboard');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    // First login mandatory password change enforcement for students
    if (user && isStudent && mustChangePassword) {
      if (pathname !== '/student/change-password' && !pathname.startsWith('/print/')) {
        router.push('/student/change-password');
        return;
      }
    }

    // Role-based boundary enforcement
    if (user) {
      if (isStudent) {
        // Students cannot access administrative pages
        const isNonStudentRoute =
          pathname === '/dashboard' ||
          pathname.startsWith('/students') ||
          pathname.startsWith('/courses') ||
          pathname.startsWith('/enrollments') ||
          pathname.startsWith('/payments') ||
          pathname.startsWith('/reports') ||
          pathname.startsWith('/staff') ||
          pathname.startsWith('/drop-requests') ||
          pathname === '/account';

        if (isNonStudentRoute) {
          router.push(mustChangePassword ? '/student/change-password' : '/student/dashboard');
          return;
        }
      } else {
        // Non-students (Admin, Staff) cannot access student portal routes
        if (pathname.startsWith('/student/')) {
          router.push('/dashboard');
          return;
        }

        // Staff cannot access Admin-only pages
        if (!isAdmin && pathname.startsWith('/staff')) {
          router.push('/dashboard');
          return;
        }
      }
    }
  }, [user, isAdmin, isStudent, mustChangePassword, isLoading, pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isStaff,
        isStudent,
        mustChangePassword,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
