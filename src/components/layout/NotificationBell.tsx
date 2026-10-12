'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useNotifications } from '@/lib/notifications/notification-context';
import {
  Bell,
  CheckCheck,
  GraduationCap,
  Clock,
  Receipt,
  RotateCcw,
  CheckCircle2,
  FileCheck,
  UserPlus,
  KeyRound,
  ExternalLink,
  ShieldAlert,
  Smartphone,
  Check,
} from 'lucide-react';

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch {
    return 'Recently';
  }
}

function getNotificationIcon(type: string) {
  switch (type) {
    case 'COURSE_REQUEST':
      return <GraduationCap className="w-4 h-4 text-emerald-600" />;
    case 'DROP_REQUEST':
      return <Clock className="w-4 h-4 text-amber-600" />;
    case 'PAYMENT_RECEIVED':
      return <Receipt className="w-4 h-4 text-emerald-600" />;
    case 'PAYMENT_REVERSED':
      return <RotateCcw className="w-4 h-4 text-rose-600" />;
    case 'ENROLLMENT_APPROVED':
      return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    case 'DROP_REQUEST_REVIEWED':
      return <FileCheck className="w-4 h-4 text-indigo-600" />;
    case 'STUDENT_REGISTERED':
      return <UserPlus className="w-4 h-4 text-purple-600" />;
    case 'CREDENTIALS_RESET':
      return <KeyRound className="w-4 h-4 text-amber-600" />;
    default:
      return <Bell className="w-4 h-4 text-slate-500" />;
  }
}

export default function NotificationBell() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    isPushSupported,
    isPushSubscribed,
    subscribeToPush,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleEnablePush = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSubscribing(true);
    await subscribeToPush();
    setIsSubscribing(false);
  };

  const handleItemClick = (notification: (typeof notifications)[0]) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    setIsOpen(false);
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
        aria-label="View notifications"
        title="Central Notifications"
      >
        <Bell className="w-5 h-5" />

        {/* Unread Counter Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-black text-white bg-red-600 rounded-full border-2 border-white shadow-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Card */}
      {isOpen && (
        <div className="fixed inset-x-3 top-16 sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96 max-w-[calc(100vw-24px)] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-slate-800 tracking-tight">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center space-x-1 cursor-pointer transition-colors"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Web Push Prompt Bar */}
          {isPushSupported && !isPushSubscribed && (
            <div className="px-4 py-2.5 bg-emerald-50/70 border-b border-emerald-100 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2 text-emerald-900">
                <Smartphone className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <span className="font-medium text-[11px] leading-tight">Enable desktop & mobile push</span>
              </div>
              <button
                type="button"
                onClick={handleEnablePush}
                disabled={isSubscribing}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition-colors cursor-pointer shrink-0"
              >
                {isSubscribing ? 'Enabling...' : 'Enable'}
              </button>
            </div>
          )}

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2">
                  <Bell className="w-5 h-5" />
                </div>
                <p className="text-xs font-medium text-slate-600">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">All institute activities will appear here</p>
              </div>
            ) : (
              notifications.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer flex items-start space-x-3 group ${
                    !item.isRead ? 'bg-emerald-50/30' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 shrink-0 group-hover:bg-white group-hover:shadow-xs transition-all">
                    {getNotificationIcon(item.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <p className={`text-xs leading-snug truncate ${!item.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {item.title}
                      </p>
                      {!item.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 pt-0.5">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formatRelativeTime(item.createdAt)}
                      </span>
                      {item.link && (
                        <span className="text-[10px] font-semibold text-emerald-700 group-hover:underline inline-flex items-center space-x-0.5">
                          <span>View</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-200 text-center">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-900 transition-colors inline-block"
            >
              View All Notifications & Push Center →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
