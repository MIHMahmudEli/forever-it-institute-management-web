'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';
import { useNotifications } from '@/lib/notifications/notification-context';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Receipt,
  GraduationCap,
  Calendar,
  Award,
  CheckSquare,
  Layers,
  Menu as MenuIcon,
} from 'lucide-react';

interface BottomNavProps {
  onOpenMenu: () => void;
}

export default function BottomNav({ onOpenMenu }: BottomNavProps) {
  const pathname = usePathname();
  const { user, isStudent, isTeacher, isParent } = useAuth();
  const { unreadCount } = useNotifications();

  // If on login or print page, do not render bottom nav
  if (!user || pathname.startsWith('/login') || pathname.startsWith('/print')) {
    return null;
  }

  const staffAdminTabs = [
    {
      label: 'Home',
      href: '/dashboard',
      icon: LayoutDashboard,
      isActive: pathname === '/dashboard',
    },
    {
      label: 'Offerings',
      href: '/academic/offerings',
      icon: Layers,
      isActive: pathname.startsWith('/academic/offerings'),
    },
    {
      label: 'Students',
      href: '/students',
      icon: Users,
      isActive: pathname.startsWith('/students') && pathname !== '/students/new',
    },
    {
      label: 'Payments',
      href: '/payments',
      icon: Receipt,
      isActive: pathname.startsWith('/payments'),
    },
  ];

  const teacherTabs = [
    {
      label: 'Home',
      href: '/teacher/dashboard',
      icon: LayoutDashboard,
      isActive: pathname === '/teacher/dashboard',
    },
    {
      label: 'Routine',
      href: '/teacher/timetable',
      icon: Calendar,
      isActive: pathname === '/teacher/timetable',
    },
    {
      label: 'Courses',
      href: '/teacher/courses',
      icon: GraduationCap,
      isActive: pathname.startsWith('/teacher/courses'),
    },
    {
      label: 'Attendance',
      href: '/teacher/attendance',
      icon: CheckSquare,
      isActive: pathname === '/teacher/attendance',
    },
  ];

  const parentTabs = [
    {
      label: 'Home',
      href: '/parent/dashboard',
      icon: LayoutDashboard,
      isActive: pathname === '/parent/dashboard',
    },
    {
      label: 'Routine',
      href: '/parent/routine',
      icon: Calendar,
      isActive: pathname === '/parent/routine',
    },
    {
      label: 'Attendance',
      href: '/parent/attendance',
      icon: CheckSquare,
      isActive: pathname === '/parent/attendance',
    },
    {
      label: 'Grades',
      href: '/parent/grades',
      icon: Award,
      isActive: pathname === '/parent/grades',
    },
  ];

  const studentTabs = [
    {
      label: 'Home',
      href: '/student/dashboard',
      icon: LayoutDashboard,
      isActive: pathname === '/student/dashboard',
    },
    {
      label: 'Routine',
      href: '/student/routine',
      icon: Calendar,
      isActive: pathname === '/student/routine',
    },
    {
      label: 'Register',
      href: '/student/courses/register',
      icon: Layers,
      isActive: pathname === '/student/courses/register',
    },
    {
      label: 'Grades',
      href: '/student/grades',
      icon: Award,
      isActive: pathname === '/student/grades',
    },
  ];

  let primaryTabs = staffAdminTabs;
  if (isStudent) {
    primaryTabs = studentTabs;
  } else if (isTeacher) {
    primaryTabs = teacherTabs;
  } else if (isParent) {
    primaryTabs = parentTabs;
  }

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-1">
        {primaryTabs.map((tab) => {
          const Icon = tab.icon;
          const active = tab.isActive;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center py-1 px-1 h-full select-none transition-colors duration-150 relative group ${
                active ? 'text-[#006838]' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {/* Active Pill Indicator */}
              <div
                className={`flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200 ${
                  active
                    ? 'bg-emerald-100/80 text-[#006838]'
                    : 'text-slate-500 group-hover:text-slate-800'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
              </div>
              <span
                className={`text-[10.5px] leading-tight mt-0.5 tracking-tight ${
                  active ? 'font-bold text-[#006838]' : 'font-medium text-slate-500'
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* More / Menu Action Button */}
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-1 h-full select-none text-slate-500 hover:text-slate-800 transition-colors duration-150 relative group cursor-pointer"
          aria-label="Open all navigation options"
        >
          <div className="flex items-center justify-center w-10 h-7 rounded-full text-slate-500 group-hover:text-slate-800 relative">
            <MenuIcon className="w-5 h-5 stroke-[1.8]" />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </div>
          <span className="text-[10.5px] font-medium leading-tight mt-0.5 tracking-tight text-slate-500">
            More
          </span>
        </button>
      </div>
    </nav>
  );
}
