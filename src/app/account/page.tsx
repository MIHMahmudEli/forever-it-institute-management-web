'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, User } from '@/lib/api/api-client';
import { useAuth } from '@/lib/auth/auth-context';
import { formatDate } from '@/lib/utils';
import { FormSkeleton } from '@/components/ui/skeletons';
import {
  User as UserIcon,
  Lock,
  Mail,
  ShieldCheck,
  Shield,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Check,
  X,
  KeyRound,
  Save,
} from 'lucide-react';

export default function MyAccountPage() {
  const { user: authUser, refreshUser } = useAuth();

  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile Edit State
  const [fullName, setFullName] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileNotification, setProfileNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordNotification, setPasswordNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    async function loadAccount() {
      setLoading(true);
      try {
        const me = await api.account.getMe();
        setProfile(me);
        setFullName(me.fullName);
      } catch {
        if (authUser) {
          setProfile(authUser);
          setFullName(authUser.fullName);
        }
      } finally {
        setLoading(false);
      }
    }
    loadAccount();
  }, [authUser]);

  // Validation rules for password
  const hasMinLength = newPassword.length >= 8;
  const hasLetterAndNumber = /[a-zA-Z]/.test(newPassword) && /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isDifferentFromCurrent = newPassword.length > 0 && newPassword !== currentPassword;
  const isPasswordFormValid =
    hasMinLength &&
    hasLetterAndNumber &&
    passwordsMatch &&
    currentPassword.length > 0 &&
    isDifferentFromCurrent;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileNotification(null);

    if (!fullName.trim()) {
      setProfileNotification({ type: 'error', message: 'Full name cannot be blank.' });
      return;
    }

    setProfileSaving(true);
    try {
      const updated = await api.account.updateProfile({ fullName });
      setProfile(updated);
      await refreshUser();
      setProfileNotification({
        type: 'success',
        message: 'Your profile details were updated successfully.',
      });
    } catch (err: any) {
      setProfileNotification({
        type: 'error',
        message: err?.message || 'Failed to update profile.',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordNotification(null);

    if (!isPasswordFormValid) {
      setPasswordNotification({
        type: 'error',
        message: 'Please satisfy all password security requirements below before submitting.',
      });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await api.account.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setPasswordNotification({
        type: 'success',
        message: res.message || 'Password changed successfully! Keep your credentials secure.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordNotification({
        type: 'error',
        message: err?.message || 'Failed to change password. Please verify current password.',
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <DashboardLayout title="My Account & Credentials">
      {/* Header section */}
      <div className="pb-6 border-b border-slate-200 mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Account Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review your credentials, update your personal display name, and securely change your portal
          password.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormSkeleton fields={4} />
          <FormSkeleton fields={4} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* CARD 1: PROFILE INFORMATION */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 pb-5 border-b border-slate-100">
                <div className="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-lg uppercase shadow-xs shrink-0">
                  {profile?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{profile?.fullName}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                        profile?.role === 'ADMIN'
                          ? 'bg-emerald-50 text-[#006838] border-emerald-300'
                          : 'bg-slate-100 text-slate-700 border-slate-300'
                      }`}
                    >
                      {profile?.role === 'ADMIN' ? (
                        <ShieldCheck className="w-3 h-3 mr-1 text-[#006838]" />
                      ) : (
                        <Shield className="w-3 h-3 mr-1 text-slate-500" />
                      )}
                      {profile?.role}
                    </span>
                    <span className="text-[11px] text-slate-400">• Active Account</span>
                  </div>
                </div>
              </div>

              {profileNotification && (
                <div
                  className={`mt-4 p-3 rounded-lg border text-xs flex items-center space-x-2 transition-smooth ${
                    profileNotification.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {profileNotification.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#006838] shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#D81A22] shrink-0" />
                  )}
                  <span>{profileNotification.message}</span>
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4 mt-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Registered Email
                  </label>
                  <div className="relative rounded-lg">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      disabled
                      value={profile?.email || ''}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed font-mono"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Primary login email managed by institute system administrator.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative rounded-lg shadow-2xs">
                    <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Your full official name..."
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#006838] focus:border-[#006838] transition-smooth-fast"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg text-white bg-[#006838] hover:bg-[#015333] active:bg-[#004225] shadow-xs transition-smooth disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    {profileSaving ? 'Saving Name...' : 'Save Profile Details'}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
              Account created on {formatDate((profile as any)?.createdAt || new Date().toISOString())}
            </div>
          </div>

          {/* CARD 2: PASSWORD CHANGE & SECURITY */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2.5 pb-5 border-b border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#006838] flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Change Password</h2>
                  <p className="text-xs text-slate-500">
                    Verify current credentials and enter a new strong password
                  </p>
                </div>
              </div>

              {passwordNotification && (
                <div
                  className={`mt-4 p-3 rounded-lg border text-xs flex items-center space-x-2 transition-smooth ${
                    passwordNotification.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  {passwordNotification.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-[#006838] shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-[#D81A22] shrink-0" />
                  )}
                  <span>{passwordNotification.message}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 mt-5">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Current Password
                  </label>
                  <div className="relative rounded-lg shadow-2xs">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#006838] focus:border-[#006838] transition-smooth-fast"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    New Password
                  </label>
                  <div className="relative rounded-lg shadow-2xs">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNew ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters..."
                      className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#006838] focus:border-[#006838] transition-smooth-fast"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative rounded-lg shadow-2xs">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password..."
                      className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#006838] focus:border-[#006838] transition-smooth-fast"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Policy Checklist */}
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 space-y-1.5 text-[11px]">
                  <p className="font-semibold text-slate-600 uppercase tracking-wider text-[10px]">
                    Security Requirements:
                  </p>
                  <div className="flex items-center space-x-2">
                    {hasMinLength ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-300" />
                    )}
                    <span className={hasMinLength ? 'text-slate-800' : 'text-slate-400'}>
                      Minimum 8 characters
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {hasLetterAndNumber ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-300" />
                    )}
                    <span className={hasLetterAndNumber ? 'text-slate-800' : 'text-slate-400'}>
                      Contains both letters and numbers
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {passwordsMatch ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-slate-300" />
                    )}
                    <span className={passwordsMatch ? 'text-slate-800' : 'text-slate-400'}>
                      Passwords match
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passwordSaving || !isPasswordFormValid}
                    className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg text-white bg-[#006838] hover:bg-[#015333] active:bg-[#004225] shadow-xs transition-smooth disabled:opacity-50"
                  >
                    <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                    {passwordSaving ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
              For security, avoid reusing previous passwords across multiple systems.
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
