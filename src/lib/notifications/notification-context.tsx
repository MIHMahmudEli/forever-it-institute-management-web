'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { api, NotificationItem } from '@/lib/api/api-client';
import { useAuth } from '@/lib/auth/auth-context';

interface NotificationContextType {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  isPushSupported: boolean;
  isPushSubscribed: boolean;
  pushPermission: NotificationPermission | 'unsupported';
  subscribeToPush: () => Promise<boolean>;
  unsubscribeFromPush: () => Promise<boolean>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  refreshNotifications: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Helper to convert base64 URL-safe key to Uint8Array for PushManager
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Gentle audio chime synthesizer using Web Audio API
function playChimeSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, now + 0.15);
    osc2.frequency.exponentialRampToValueAtTime(1174.66, now + 0.3); // D6

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.3);
    osc2.start(now + 0.15);
    osc2.stop(now + 0.5);
  } catch {
    // Ignore audio errors if audio context is blocked
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPushSupported, setIsPushSupported] = useState(false);
  const [isPushSubscribed, setIsPushSubscribed] = useState(false);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | 'unsupported'>('default');

  const previousCountRef = useRef(0);
  const isInitialLoadRef = useRef(true);

  // Check Web Push support in browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      setIsPushSupported(supported);
      if (supported) {
        setPushPermission(Notification.permission);
        // Register service worker
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => {
            return reg.pushManager.getSubscription();
          })
          .then((sub) => {
            setIsPushSubscribed(!!sub);
          })
          .catch((err) => {
            console.warn('Service worker registration error:', err);
          });
      } else {
        setPushPermission('unsupported');
      }
    }
  }, []);

  // Fetch recent notifications and unread count
  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const res = await api.notifications.getAll({ limit: 12 });
      setNotifications(res.data || []);
      const newUnread = res.meta?.unreadCount ?? 0;
      setUnreadCount(newUnread);

      // Play chime if new unread notification arrived
      if (!isInitialLoadRef.current && newUnread > previousCountRef.current) {
        playChimeSound();

        // If page is hidden, show native browser notification
        if (typeof window !== 'undefined' && document.hidden && Notification.permission === 'granted') {
          const latest = res.data?.[0];
          if (latest) {
            new Notification(latest.title, {
              body: latest.message,
              icon: '/logo-icon.svg',
            });
          }
        }
      }

      previousCountRef.current = newUnread;
      isInitialLoadRef.current = false;
    } catch (err: any) {
      if (err?.statusCode === 401 || err?.statusCode === 403) {
        return;
      }
      console.warn('Notification refresh paused:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Polling for real-time central notifications
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    refreshNotifications();

    // Poll every 25 seconds
    const interval = setInterval(() => {
      refreshNotifications();
    }, 25000);

    const onFocus = () => {
      refreshNotifications();
    };

    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [user, refreshNotifications]);

  // Subscribe to Web Push
  const subscribeToPush = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);

      if (permission !== 'granted') {
        return false;
      }

      const reg = await navigator.serviceWorker.ready;
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        const { publicKey } = await api.notifications.getVapidPublicKey();
        const applicationServerKey = urlBase64ToUint8Array(publicKey);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      const subJson = sub.toJSON();
      if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
        throw new Error('Invalid push subscription structure');
      }

      await api.notifications.subscribePush({
        endpoint: subJson.endpoint,
        keys: {
          p256dh: subJson.keys.p256dh,
          auth: subJson.keys.auth,
        },
        userAgent: navigator.userAgent,
      });

      setIsPushSubscribed(true);
      return true;
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
      return false;
    }
  }, [isPushSupported]);

  // Unsubscribe from Web Push
  const unsubscribeFromPush = useCallback(async (): Promise<boolean> => {
    if (!isPushSupported) return false;

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        const endpoint = sub.endpoint;
        await sub.unsubscribe();
        await api.notifications.unsubscribePush(endpoint);
      }
      setIsPushSubscribed(false);
      return true;
    } catch (err) {
      console.error('Failed to unsubscribe from push notifications:', err);
      return false;
    }
  }, [isPushSupported]);

  // Mark single notification as read
  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      previousCountRef.current = Math.max(0, previousCountRef.current - 1);
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await api.notifications.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      previousCountRef.current = 0;
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      await api.notifications.delete(id);
      setNotifications((prev) => {
        const target = prev.find((n) => n.id === id);
        if (target && !target.isRead) {
          setUnreadCount((c) => Math.max(0, c - 1));
          previousCountRef.current = Math.max(0, previousCountRef.current - 1);
        }
        return prev.filter((n) => n.id !== id);
      });
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, []);

  // Send a test notification
  const sendTestNotification = useCallback(async () => {
    try {
      await api.notifications.sendTest();
      await refreshNotifications();
    } catch (err) {
      console.error('Failed to send test notification:', err);
    }
  }, [refreshNotifications]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        isPushSupported,
        isPushSubscribed,
        pushPermission,
        subscribeToPush,
        unsubscribeFromPush,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        refreshNotifications,
        sendTestNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
