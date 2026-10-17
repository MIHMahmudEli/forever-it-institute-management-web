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
  isTeacher: boolean;
  isParent: boolean;
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
  isTeacher: false,
  isParent: false,
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
  const isTeacher = user?.role === 'TEACHER';
  const isParent = user?.role === 'PARENT';
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
    } else if (newUser.role === 'TEACHER') {
      if (newUser.mustChangePassword) {
        router.push('/teacher/change-password');
      } else {
        router.push('/teacher/dashboard');
      }
    } else if (newUser.role === 'PARENT') {
      if (newUser.mustChangePassword) {
        router.push('/parent/change-password');
      } else {
        router.push('/parent/dashboard');
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
      } else if (isTeacher) {
        router.push(mustChangePassword ? '/teacher/change-password' : '/teacher/dashboard');
      } else if (isParent) {
        router.push(mustChangePassword ? '/parent/change-password' : '/parent/dashboard');
      } else {
        router.push('/dashboard');
      }
      return;
    }

    // First login mandatory password change enforcement
    if (user && mustChangePassword) {
      if (isStudent && pathname !== '/student/change-password' && !pathname.startsWith('/print/')) {
        router.push('/student/change-password');
        return;
      }
      if (isTeacher && pathname !== '/teacher/change-password' && !pathname.startsWith('/print/')) {
        router.push('/teacher/change-password');
        return;
      }
      if (isParent && pathname !== '/parent/change-password' && !pathname.startsWith('/print/')) {
        router.push('/parent/change-password');
        return;
      }
    }

    // Role-based boundary enforcement
    if (user) {
      if (isStudent) {
        // Students can only access student routes, notifications, and print
        const isForbiddenForStudent =
          pathname === '/dashboard' ||
          pathname.startsWith('/students') ||
          pathname.startsWith('/courses') ||
          pathname.startsWith('/enrollments') ||
          pathname.startsWith('/payments') ||
          pathname.startsWith('/reports') ||
          pathname.startsWith('/staff') ||
          pathname.startsWith('/drop-requests') ||
          pathname.startsWith('/academic') ||
          pathname.startsWith('/teacher') ||
          pathname.startsWith('/parent') ||
          pathname === '/account';

        if (isForbiddenForStudent) {
          router.push(mustChangePassword ? '/student/change-password' : '/student/dashboard');
          return;
        }
      } else if (isTeacher) {
        // Teachers can access teacher routes, notifications, account
        const isForbiddenForTeacher =
          pathname === '/dashboard' ||
          pathname.startsWith('/students') ||
          pathname.startsWith('/student/') ||
          pathname.startsWith('/parent/') ||
          pathname.startsWith('/staff') ||
          pathname.startsWith('/reports') ||
          pathname.startsWith('/academic');

        if (isForbiddenForTeacher) {
          router.push(mustChangePassword ? '/teacher/change-password' : '/teacher/dashboard');
          return;
        }
      } else if (isParent) {
        // Parents can access parent routes, notifications, account
        const isForbiddenForParent =
          pathname === '/dashboard' ||
          pathname.startsWith('/students') ||
          pathname.startsWith('/student/') ||
          pathname.startsWith('/teacher/') ||
          pathname.startsWith('/staff') ||
          pathname.startsWith('/reports') ||
          pathname.startsWith('/academic');

        if (isForbiddenForParent) {
          router.push(mustChangePassword ? '/parent/change-password' : '/parent/dashboard');
          return;
        }
      } else {
        // Admin and Staff: cannot access student, teacher, or parent self portals directly
        if (pathname.startsWith('/student/')) {
          router.push('/dashboard');
          return;
        }
        if (pathname.startsWith('/parent/')) {
          router.push('/dashboard');
          return;
        }

        // Staff cannot access Admin-only pages
        if (!isAdmin && (pathname.startsWith('/staff') || pathname.startsWith('/reports'))) {
          router.push('/dashboard');
          return;
        }
      }
    }
  }, [user, isAdmin, isStaff, isStudent, isTeacher, isParent, mustChangePassword, isLoading, pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAdmin,
        isStaff,
        isStudent,
        isTeacher,
        isParent,
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
