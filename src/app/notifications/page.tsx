'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useNotifications } from '@/lib/notifications/notification-context';
import { api, NotificationItem } from '@/lib/api/api-client';
import {
  Bell,
  CheckCheck,
  RefreshCw,
  Send,
  Smartphone,
  Check,
  Trash2,
  ExternalLink,
  GraduationCap,
  Clock,
  Receipt,
  RotateCcw,
  CheckCircle2,
  FileCheck,
  UserPlus,
  KeyRound,
  Filter,
  Search,
  ShieldCheck,
  BellOff,
  AlertCircle,
} from 'lucide-react';

export default function NotificationsPage() {
  const {
    unreadCount,
    isPushSupported,
    isPushSubscribed,
    pushPermission,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
    refreshNotifications: refreshContext,
  } = useNotifications();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'COURSE' | 'PAYMENT' | 'DROP' | 'SYSTEM'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      let isReadParam: string | undefined = undefined;
      let typeParam: string | undefined = undefined;

      if (activeTab === 'UNREAD') {
        isReadParam = 'false';
      } else if (activeTab === 'COURSE') {
        typeParam = 'COURSE_REQUEST';
      } else if (activeTab === 'PAYMENT') {
        typeParam = 'PAYMENT_RECEIVED';
      } else if (activeTab === 'DROP') {
        typeParam = 'DROP_REQUEST';
      }

      const res = await api.notifications.getAll({
        page,
        limit: 15,
        isRead: isReadParam,
        type: typeParam,
      });

      setNotifications(res.data || []);
      setTotal(res.meta?.total || 0);
      setTotalPages(res.meta?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [page, activeTab]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      refreshContext();
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      refreshContext();
      setActionMessage('All notifications marked as read.');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.notifications.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotal((t) => Math.max(0, t - 1));
      refreshContext();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const handleTogglePush = async () => {
    setIsSubscribing(true);
    try {
      if (isPushSubscribed) {
        await unsubscribeFromPush();
        setActionMessage('Web Push notifications disabled for this device.');
      } else {
        const success = await subscribeToPush();
        if (success) {
          setActionMessage('Web Push notifications successfully enabled!');
        } else {
          setActionMessage('Could not enable Web Push. Please check browser permissions.');
        }
      }
      setTimeout(() => setActionMessage(null), 4000);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleSendTest = async () => {
    try {
      await sendTestNotification();
      await fetchNotifications();
      setActionMessage('Test notification dispatched!');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error('Failed to send test push:', err);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return n.title.toLowerCase().includes(term) || n.message.toLowerCase().includes(term);
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'COURSE_REQUEST':
        return <GraduationCap className="w-5 h-5 text-emerald-600" />;
      case 'DROP_REQUEST':
        return <Clock className="w-5 h-5 text-amber-600" />;
      case 'PAYMENT_RECEIVED':
        return <Receipt className="w-5 h-5 text-emerald-600" />;
      case 'PAYMENT_REVERSED':
        return <RotateCcw className="w-5 h-5 text-rose-600" />;
      case 'ENROLLMENT_APPROVED':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'DROP_REQUEST_REVIEWED':
        return <FileCheck className="w-5 h-5 text-indigo-600" />;
      case 'STUDENT_REGISTERED':
        return <UserPlus className="w-5 h-5 text-purple-600" />;
      case 'CREDENTIALS_RESET':
        return <KeyRound className="w-5 h-5 text-amber-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'COURSE_REQUEST':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">Course Request</span>;
      case 'DROP_REQUEST':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">Drop Request</span>;
      case 'PAYMENT_RECEIVED':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">Payment</span>;
      case 'PAYMENT_REVERSED':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">Payment Reversal</span>;
      case 'ENROLLMENT_APPROVED':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">Enrollment Active</span>;
      case 'STUDENT_REGISTERED':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-100 text-purple-800">New Registration</span>;
      case 'CREDENTIALS_RESET':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">Credentials Reset</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">System</span>;
    }
  };

  return (
    <DashboardLayout title="Central Notifications">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Top Header Card */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-xs border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    Central Notifications & Web Push Center
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Live system notifications, course enrollments, drop requests, and receipts.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <CheckCheck className="w-4 h-4 mr-1.5 text-emerald-700" />
                Mark All Read
              </button>

              <button
                type="button"
                onClick={handleSendTest}
                className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Test Alert
              </button>

              <button
                type="button"
                onClick={() => {
                  fetchNotifications();
                  refreshContext();
                }}
                className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Action toast message */}
          {actionMessage && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center space-x-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{actionMessage}</span>
            </div>
          )}
        </div>

        {/* Web Push Configuration Card */}
        {isPushSupported && (
          <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-teal-950 text-white rounded-2xl p-5 sm:p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="p-3 rounded-xl bg-white/10 shrink-0 text-white">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-base font-bold text-white tracking-tight">
                      Browser Web Push Notifications
                    </h2>
                    {isPushSubscribed ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                        Push Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Push Not Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-emerald-100/80 mt-1 max-w-2xl leading-relaxed">
                    Receive instant system alerts when students request course enrollments, drop requests, or payments are processed — even when this browser tab is closed or minimized.
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <button
                  type="button"
                  onClick={handleTogglePush}
                  disabled={isSubscribing}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    isPushSubscribed
                      ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                      : 'bg-white text-emerald-900 hover:bg-emerald-50 shadow-md'
                  }`}
                >
                  {isSubscribing
                    ? 'Configuring...'
                    : isPushSubscribed
                    ? 'Disable Push on Device'
                    : 'Enable Push Notifications'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'UNREAD', label: `Unread (${unreadCount})` },
              { id: 'COURSE', label: 'Course Requests' },
              { id: 'PAYMENT', label: 'Payments' },
              { id: 'DROP', label: 'Drop Requests' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-700 mb-2" />
              <p className="text-xs text-slate-500 font-medium">Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <BellOff className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">No notifications found</h3>
              <p className="text-xs text-slate-400 mt-1">
                {activeTab === 'UNREAD' ? 'You have read all your notifications!' : 'There are no notifications matching your filter.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  !item.isRead
                    ? 'bg-emerald-50/20 border-emerald-300/80 shadow-xs'
                    : 'bg-white border-slate-200/90'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3.5 flex-1 min-w-0">
                    <div className="p-2.5 rounded-xl bg-slate-100 shrink-0 mt-0.5">
                      {getIcon(item.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {getTypeBadge(item.type)}
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                        )}
                        <span className="text-[11px] text-slate-400 font-medium">
                          {new Date(item.createdAt).toLocaleString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <h4 className={`text-sm tracking-tight ${!item.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.message}
                      </p>

                      {item.link && (
                        <div className="mt-3">
                          <Link
                            href={item.link}
                            onClick={() => !item.isRead && handleMarkAsRead(item.id)}
                            className="inline-flex items-center text-xs font-bold text-emerald-800 hover:text-emerald-950 transition-colors"
                          >
                            <span>Open Record</span>
                            <ExternalLink className="w-3.5 h-3.5 ml-1" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 shrink-0">
                    {!item.isRead && (
                      <button
                        type="button"
                        onClick={() => handleMarkAsRead(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white px-5 py-3.5 rounded-2xl border border-slate-200">
            <span className="text-xs text-slate-500">
              Page {page} of {totalPages} ({total} total)
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
