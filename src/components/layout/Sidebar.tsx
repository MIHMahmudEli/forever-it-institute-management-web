'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import {
  LayoutDashboard,
  UserPlus,
  Users,
  GraduationCap,
  ClipboardList,
  Receipt,
  BarChart3,
  LogOut,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'New Registration', href: '/students/new', icon: UserPlus, highlight: true },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Courses', href: '/courses', icon: GraduationCap },
    { name: 'Enrollments', href: '/enrollments', icon: ClipboardList },
    { name: 'Payments & Receipts', href: '/payments', icon: Receipt },
    { name: 'Financial Reports', href: '/reports', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-[#015333] text-white flex flex-col h-full border-r border-[#006838]/60 shadow-2xl">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#006838]/80 bg-[#004225]">
        <Link href="/dashboard" className="block group">
          <div className="bg-white rounded-xl p-2.5 shadow-md flex items-center justify-center hover:opacity-95 transition-all">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Forever IT Institute"
              className="w-full h-8.5 object-contain"
            />
          </div>
        </Link>
        <div className="mt-2.5 flex items-center justify-between">
          <span className="text-[10px] tracking-[0.25em] font-extrabold uppercase text-emerald-300">
            INSTITUTE
          </span>
          <span className="inline-block px-2 py-0.5 rounded-full bg-[#006838] text-[10px] text-emerald-200 font-bold border border-emerald-500/30">
            দক্ষতা গড়ুন, গড়ুন সফল ভবিষ্যৎ
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 font-semibold'
                  : item.highlight
                  ? 'bg-red-600/20 text-red-200 hover:bg-red-600/30 border border-red-500/30'
                  : 'text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 mr-3 shrink-0 ${isActive ? 'text-white' : item.highlight ? 'text-red-400' : 'text-emerald-300'}`} />
              <span className="truncate">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick External Links */}
      <div className="px-4 py-2 border-t border-emerald-900/60 text-[11px] text-emerald-300/70">
        <a
          href="http://www.foreveritbd.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center hover:text-emerald-200 transition-colors"
        >
          <span>www.foreveritbd.com</span>
          <ExternalLink className="w-3 h-3 ml-1.5 opacity-60" />
        </a>
      </div>

      {/* User & Logout Footer */}
      <div className="p-4 border-t border-emerald-900/60 bg-[#06331f]">
        <div className="flex items-center justify-between mb-3">
          <div className="truncate mr-2">
            <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'User'}</p>
            <p className="text-[10px] text-emerald-300 truncate">{user?.email}</p>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            {user?.role || 'STAFF'}
          </span>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium text-red-200 bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 mr-2 text-red-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
