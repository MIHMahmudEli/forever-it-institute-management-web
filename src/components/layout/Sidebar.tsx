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
  ShieldCheck,
  UserCog,
  LogOut,
  ExternalLink,
  Clock,
  KeyRound,
  Bell,
  X,
  Calendar,
  BookOpen,
  Award,
  CheckSquare,
  Users2,
  Layers,
  HeartHandshake,
} from 'lucide-react';
import { useNotifications } from '@/lib/notifications/notification-context';

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, isAdmin, isStudent, isTeacher, isParent, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const adminStaffNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Academic Offerings', href: '/academic/offerings', icon: Layers },
    { name: 'Academic Terms', href: '/academic/terms', icon: Calendar },
    { name: 'Teachers Directory', href: '/academic/teachers', icon: Users2 },
    { name: 'Parents Directory', href: '/academic/parents', icon: HeartHandshake },
    { name: 'New Registration', href: '/students/new', icon: UserPlus },
    { name: 'Students', href: '/students', icon: Users },
    { name: 'Course Catalog', href: '/courses', icon: GraduationCap },
    { name: 'Enrollments', href: '/enrollments', icon: ClipboardList },
    { name: 'Payments & Receipts', href: '/payments', icon: Receipt },
    { name: 'Drop Requests', href: '/drop-requests', icon: Clock },
    { name: 'Notifications', href: '/notifications', icon: Bell, isNotification: true },
    { name: 'Financial Reports', href: '/reports', icon: BarChart3, adminOnly: true },
    { name: 'Staff Management', href: '/staff', icon: ShieldCheck, adminOnly: true },
    { name: 'My Account', href: '/account', icon: UserCog },
  ];

  const teacherNavigation = [
    { name: 'Teacher Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { name: 'My Routine / Schedule', href: '/teacher/timetable', icon: Calendar },
    { name: 'Assigned Offerings', href: '/teacher/courses', icon: GraduationCap },
    { name: 'Notifications', href: '/notifications', icon: Bell, isNotification: true },
    { name: 'Change Password', href: '/teacher/change-password', icon: KeyRound },
  ];

  const parentNavigation = [
    { name: 'Family Dashboard', href: '/parent/dashboard', icon: LayoutDashboard },
    { name: 'Child Routine', href: '/parent/routine', icon: Calendar },
    { name: 'Attendance Record', href: '/parent/attendance', icon: CheckSquare },
    { name: 'Academic Grades', href: '/parent/grades', icon: Award },
    { name: 'Fee Ledger', href: '/parent/payments', icon: Receipt },
    { name: 'Notifications', href: '/notifications', icon: Bell, isNotification: true },
    { name: 'Change Password', href: '/parent/change-password', icon: KeyRound },
  ];

  const studentNavigation = [
    { name: 'Portal Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Course Registration', href: '/student/courses/register', icon: BookOpen },
    { name: '7-Day Routine', href: '/student/routine', icon: Calendar },
    { name: 'My Grades', href: '/student/grades', icon: Award },
    { name: 'My Attendance', href: '/student/attendance', icon: CheckSquare },
    { name: 'Enrolled Courses', href: '/student/courses', icon: GraduationCap },
    { name: 'Payments & Receipts', href: '/student/payments', icon: Receipt },
    { name: 'Drop Requests', href: '/student/drop-requests', icon: Clock },
    { name: 'Notifications', href: '/notifications', icon: Bell, isNotification: true },
    { name: 'My Profile', href: '/student/profile', icon: UserCog },
    { name: 'Change Password', href: '/student/change-password', icon: KeyRound },
  ];

  let visibleNavigation = adminStaffNavigation.filter((item) => !item.adminOnly || isAdmin);
  if (isStudent) {
    visibleNavigation = studentNavigation;
  } else if (isTeacher) {
    visibleNavigation = teacherNavigation;
  } else if (isParent) {
    visibleNavigation = parentNavigation;
  }

  const checkIsActive = (href: string) => {
    if (pathname === href) return true;
    if (
      href === '/dashboard' ||
      href === '/student/dashboard' ||
      href === '/teacher/dashboard' ||
      href === '/parent/dashboard'
    ) {
      return false;
    }
    // When on /students/new, only New Registration should be active, not general Students list
    if (href === '/students' && pathname.startsWith('/students/new')) {
      return false;
    }
    return pathname.startsWith(href);
  };

  let homeHref = '/dashboard';
  let profileHref = '/account';
  if (isStudent) {
    homeHref = '/student/dashboard';
    profileHref = '/student/profile';
  } else if (isTeacher) {
    homeHref = '/teacher/dashboard';
    profileHref = '/teacher/dashboard';
  } else if (isParent) {
    homeHref = '/parent/dashboard';
    profileHref = '/parent/dashboard';
  }

  return (
    <aside className="w-full lg:w-64 bg-[#015333] text-white flex flex-col h-full border-r border-[#006838]/60 shadow-2xl">
      {/* Mobile Drawer Top Bar with High-Contrast Close Action */}
      {onClose && (
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#002816] border-b border-emerald-900/90 text-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-200">
              Navigation Menu
            </span>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white border border-emerald-400/60 text-xs font-bold shadow-sm transition-all cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4 text-white stroke-[2.5]" />
            <span>Close</span>
          </button>
        </div>
      )}

      {/* Brand Header */}
      <div className="p-4 border-b border-[#006838]/80 bg-[#004225] flex flex-col items-center text-center">
        {/* Line 1: Logo */}
        <Link href={homeHref} onClick={onClose} className="block w-full group">
          <div className="bg-white rounded-xl p-2.5 shadow-md flex items-center justify-center hover:opacity-95 transition-all">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.svg"
              alt="Forever IT Institute"
              className="w-full h-8.5 object-contain"
            />
          </div>
        </Link>

        {/* Line 2: Tag / Subtitle */}
        <span className="mt-2 text-[11px] tracking-[0.3em] font-extrabold uppercase text-emerald-200 text-center">
          {isStudent
            ? 'STUDENT PORTAL'
            : isTeacher
            ? 'TEACHER PORTAL'
            : isParent
            ? 'PARENT PORTAL'
            : 'ACADEMIC INSTITUTE'}
        </span>

        {/* Line 3: Bengali Tagline */}
        <div className="mt-1.5 w-full flex justify-center">
          <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#006838] text-[10px] text-emerald-100 font-bold border border-emerald-500/30 text-center tracking-wide">
            দক্ষতা গড়ুন, গড়ুন সফল ভবিষ্যৎ
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNavigation.map((item) => {
          const isActive = checkIsActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`flex items-center px-3.5 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40 font-semibold'
                  : 'text-emerald-100/80 hover:bg-emerald-900/60 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 mr-3 shrink-0 ${isActive ? 'text-white' : 'text-emerald-300'}`} />
              <span className="truncate flex-1">{item.name}</span>
              {item.isNotification && unreadCount > 0 && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white shadow-xs">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
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
        <Link
          href={profileHref}
          onClick={onClose}
          className="flex items-center justify-between mb-3 p-1.5 -mx-1.5 rounded-lg hover:bg-emerald-900/40 transition-smooth group"
          title={isStudent ? 'View Student Profile' : 'Manage Account Settings'}
        >
          <div className="truncate mr-2">
            <p className="text-xs font-semibold text-white group-hover:text-emerald-200 transition-colors truncate">
              {user?.fullName || 'User'}
            </p>
            <p className="text-[10px] text-emerald-300/80 truncate">
              {user?.registrationNumber || user?.email}
            </p>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
              isStudent
                ? 'bg-teal-500/20 text-teal-200 border border-teal-400/30'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
            }`}
          >
            {user?.role || 'STAFF'}
          </span>
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium text-red-200 bg-red-950/40 hover:bg-red-900/60 border border-red-900/50 transition-smooth"
        >
          <LogOut className="w-3.5 h-3.5 mr-2 text-red-400" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
