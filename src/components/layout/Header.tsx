'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/auth-context';
import { Menu, Calendar } from 'lucide-react';
import Link from 'next/link';
import NotificationBell from './NotificationBell';

interface HeaderProps {
  title?: string;
  onOpenMobileMenu?: () => void;
}

export default function Header({ title, onOpenMobileMenu }: HeaderProps) {
  const { user } = useAuth();
  const [today, setToday] = useState('');

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

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20 px-4 sm:px-6 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        {title && (
          <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight truncate max-w-[150px] xs:max-w-[220px] sm:max-w-md lg:max-w-none">
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
