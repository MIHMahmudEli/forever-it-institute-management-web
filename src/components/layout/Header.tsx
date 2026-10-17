'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { Menu, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  title?: string;
  onOpenMobileMenu?: () => void;
  showBack?: boolean;
  backHref?: string;
}

export default function Header({
  title,
  onOpenMobileMenu,
  showBack: explicitShowBack,
  backHref,
}: HeaderProps) {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [today, setToday] = useState('');

  // Auto-detect detail/nested views for showing a native mobile back button
  const isNestedRoute =
    explicitShowBack !== undefined
      ? explicitShowBack
      : pathname === '/students/new' ||
        pathname.startsWith('/students/') ||
        pathname === '/account' ||
        pathname === '/notifications' ||
        pathname === '/student/change-password' ||
        (pathname.startsWith('/student/courses/') && pathname !== '/student/courses');

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    );
  }, []);

  const handleBack = () => {
    if (backHref) {
      router.push(backHref);
    } else if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push(user?.role === 'STUDENT' ? '/student/dashboard' : '/dashboard');
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 px-3.5 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between shadow-2xs pt-[env(safe-area-inset-top,0px)]">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        {isNestedRoute ? (
          <button
            onClick={handleBack}
            className="lg:hidden p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0 cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-800" />
          </button>
        ) : (
          onOpenMobileMenu && (
            <button
              onClick={onOpenMobileMenu}
              className="lg:hidden p-2 -ml-1 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors shrink-0 cursor-pointer"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>
          )
        )}
        {title && (
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate max-w-[160px] xs:max-w-[220px] sm:max-w-md lg:max-w-none">
            {title}
          </h2>
        )}
      </div>

      <div className="flex items-center space-x-3 sm:space-x-4">
        {/* Date Display */}
        {today && (
          <div className="hidden sm:flex items-center text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
            <span>{today}</span>
          </div>
        )}

        {/* Central Web Notifications Bell */}
        <NotificationBell />

        {/* User Mini Badge */}
        <Link
          href={user?.role === 'STUDENT' ? '/student/profile' : '/account'}
          className="flex items-center space-x-2 p-1 -m-1 rounded-lg hover:bg-slate-100 transition-smooth group"
          title={user?.role === 'STUDENT' ? 'Student Profile' : 'Account Settings'}
        >
          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs group-hover:bg-emerald-900 transition-colors">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-emerald-800 transition-colors">
              {user?.fullName}
            </p>
            <p className="text-[10px] text-emerald-700 font-medium">{user?.role}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
