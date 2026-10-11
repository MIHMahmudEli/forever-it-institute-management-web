'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, Student } from '@/lib/api/api-client';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { TableSkeleton } from '@/components/ui/skeletons';
import {
  User,
  ShieldCheck,
  MapPin,
  Phone,
  Users,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
} from 'lucide-react';

export default function StudentProfilePage() {
  const [profile, setProfile] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Editable fields
  const [presentAddress, setPresentAddress] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentMobileNumber, setParentMobileNumber] = useState('');

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.studentPortal.getMe();
      setProfile(data);
      setPresentAddress(data.presentAddress || '');
      setParentName(data.parentName || '');
      setParentMobileNumber(data.parentMobileNumber || '');
    } catch (err: any) {
      setError(err.message || 'Failed to load student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await api.studentPortal.updateProfile({
        presentAddress,
        parentName,
        parentMobileNumber,
      });
      setSuccessMsg(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to update contact details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Student Profile & Settings">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Identity & Profile</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your official registered information and student portal credentials.
          </p>
        </div>

        <Link
          href="/student/change-password"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-xs transition-smooth"
        >
          <KeyRound className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
          Change Password
        </Link>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={4} />
      ) : !profile ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center text-xs text-slate-500">
          Student profile unavailable.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Identity Overview (1 Col) */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-600/30 text-emerald-800 flex items-center justify-center font-black text-2xl mb-4 shadow-inner">
              {profile.fullName.charAt(0)}
            </div>

            <h2 className="text-base font-bold text-slate-900">{profile.fullName}</h2>
            <div className="mt-1 font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
              {profile.registrationNumber}
            </div>

            <div className="mt-3">
              <StatusBadge status={profile.status} />
            </div>

            <div className="w-full mt-6 pt-6 border-t border-slate-100 text-left space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Portal Username</span>
                <span className="font-mono font-bold text-slate-800">{profile.user?.username || profile.registrationNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Account Email</span>
                <span className="text-slate-800 font-medium">{profile.user?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Registered Since</span>
                <span className="text-slate-800">{formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Details & Editable Form (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Official Locked Records */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
              <div className="flex items-center space-x-2 mb-4 pb-2 border-b border-slate-100">
                <Lock className="w-4 h-4 text-slate-400" />
                <h3 className="text-sm font-bold text-slate-900">Official Registered Records (Institute Locked)</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                To update your official legal name, NID, or primary registered phone number, please contact institute administration with original documents.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Full Legal Name</span>
                  <span className="font-bold text-slate-900">{profile.fullName}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">NID / Birth Certificate</span>
                  <span className="font-mono font-bold text-slate-900">{profile.nidOrBirthCertificateNumber}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Registered Mobile</span>
                  <span className="font-mono font-bold text-slate-900">{profile.mobileNumber}</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Registration Number</span>
                  <span className="font-mono font-bold text-slate-900">{profile.registrationNumber}</span>
                </div>
              </div>
            </div>

            {/* Editable Contact Information Form */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                Contact &amp; Guardian Information
              </h3>

              <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Present Residential Address
                  </label>
                  <textarea
                    rows={2}
                    value={presentAddress}
                    onChange={(e) => setPresentAddress(e.target.value)}
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 resize-none"
                    placeholder="House, Road, Area, City..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Parent / Guardian Name
                    </label>
                    <input
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                      placeholder="Guardian full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Parent / Guardian Mobile
                    </label>
                    <input
                      type="text"
                      value={parentMobileNumber}
                      onChange={(e) => setParentMobileNumber(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
                      placeholder="01XXXXXXXXX"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#006838] hover:bg-[#00532d] shadow-sm transition-smooth disabled:opacity-50"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
