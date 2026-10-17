'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api/api-client';
import { useAuth } from '@/lib/auth/auth-context';
import { KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ParentChangePasswordPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      setLoading(true);
      await api.parentPortal.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setSuccess(true);
      await refreshUser();
      setTimeout(() => {
        router.push('/parent/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-md mx-auto py-10">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto mb-3 border border-emerald-100">
              <KeyRound className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-slate-900">
              {user?.mustChangePassword ? 'Set Permanent Password' : 'Change Password'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              {user?.mustChangePassword
                ? 'Please set a permanent password for your parent/guardian account.'
                : 'Update your account login password.'}
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Password updated successfully! Redirecting...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Current / Temporary Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                New Permanent Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#006838] hover:bg-[#00502a] text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? 'Updating Password...' : 'Save Password'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
