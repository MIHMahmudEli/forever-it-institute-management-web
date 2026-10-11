'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, StudentPortalDashboard } from '@/lib/api/api-client';
import { useAuth } from '@/lib/auth/auth-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { DashboardCardSkeleton } from '@/components/ui/skeletons';
import {
  GraduationCap,
  CircleDollarSign,
  Receipt,
  Clock,
  ArrowUpRight,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  ChevronRight,
  Phone,
  MapPin,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const { user, mustChangePassword } = useAuth();
  const [data, setData] = useState<StudentPortalDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await api.studentPortal.getDashboard();
      setData(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch portal dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <DashboardLayout title="Student Portal Dashboard">
      {/* Temporary Password Change Warning */}
      {mustChangePassword && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start justify-between shadow-xs">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-amber-800">Action Required: Change Temporary Password</h3>
              <p className="text-xs text-amber-700 mt-0.5">
                You are currently logged in with a temporary system-generated password. For account security, please create your personal password.
              </p>
            </div>
          </div>
          <Link
            href="/student/change-password"
            className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-smooth shrink-0 ml-4"
          >
            <KeyRound className="w-3.5 h-3.5 mr-1.5" />
            Change Now
          </Link>
        </div>
      )}

      {/* Official Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] text-white p-6 mb-6 shadow-lg border border-emerald-600/40">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D81A22] transform rotate-45 translate-x-16 -translate-y-16 opacity-80 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold mb-2 border border-white/20">
              <span>FOREVER IT INSTITUTE</span>
              <span>•</span>
              <span>STUDENT DESK</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Welcome, {data?.student.fullName || user?.fullName || 'Student'}
            </h1>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
              Registration No:{' '}
              <span className="font-mono font-bold text-white bg-black/20 px-2 py-0.5 rounded">
                {data?.student.registrationNumber || user?.registrationNumber || 'Pending'}
              </span>{' '}
              • Manage your courses, track fee payments, and view official institute receipts.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            <Link
              href="/student/courses"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-white text-[#006838] hover:bg-emerald-50 text-xs font-bold shadow-md transition-smooth"
            >
              <GraduationCap className="w-4 h-4 mr-1.5 text-emerald-700" />
              My Courses
            </Link>
            <Link
              href="/student/payments"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold border border-emerald-500/50 shadow-md transition-smooth"
            >
              <Receipt className="w-4 h-4 mr-1.5 text-emerald-300" />
              Receipts
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Active Courses */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-500/40 transition-smooth">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Enrolled Courses
              </span>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                {data?.stats.activeCoursesCount || 0}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {data?.stats.totalEnrolledCourses || 0} total enrolled
              </p>
            </div>
          </div>

          {/* Total Payable */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-500/40 transition-smooth">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Agreed Fee
              </span>
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                <CircleDollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-slate-900">
                {formatCurrency(data?.financials.totalPayable || 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Combined across all courses</p>
            </div>
          </div>

          {/* Total Paid */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs hover:border-emerald-500/40 transition-smooth">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Paid
              </span>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-black text-emerald-700">
                {formatCurrency(data?.financials.totalPaid || 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Verified institute receipts</p>
            </div>
          </div>

          {/* Outstanding Due */}
          <div
            className={`p-5 rounded-xl border shadow-xs transition-smooth ${
              (data?.financials.outstandingDue || 0) > 0
                ? 'bg-amber-50/50 border-amber-200/80 hover:border-amber-400'
                : 'bg-white border-slate-200/80 hover:border-emerald-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Outstanding Due
              </span>
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  (data?.financials.outstandingDue || 0) > 0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                <CircleDollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <div
                className={`text-2xl font-black ${
                  (data?.financials.outstandingDue || 0) > 0 ? 'text-[#D81A22]' : 'text-slate-900'
                }`}
              >
                {formatCurrency(data?.financials.outstandingDue || 0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {(data?.financials.outstandingDue || 0) > 0 ? 'Payable before certificate' : 'Fully Cleared'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Enrolled Courses & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Enrolled Courses (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">My Enrolled Courses</h2>
              <p className="text-xs text-slate-500 mt-0.5">Active curriculum and enrolled programs</p>
            </div>
            <Link
              href="/student/courses"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center"
            >
              View All <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          <div className="p-4 sm:p-5">
            {loading ? (
              <div className="space-y-3">
                <div className="h-16 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-16 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            ) : (data?.activeEnrollments || []).length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No active courses enrolled at the moment.
              </div>
            ) : (
              <div className="space-y-3">
                {data?.activeEnrollments.map((enr) => (
                  <div
                    key={enr.id}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-smooth flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                          {enr.course?.code || 'CRS'}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {enr.course?.name || 'Course Title'}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Enrolled on {formatDate(enr.enrollmentDate)} • Fee: {formatCurrency(enr.finalFee)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0">
                      <StatusBadge status={enr.status} />
                      <Link
                        href={`/student/courses/${enr.id}`}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition-smooth"
                        title="View Course Details"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Payments (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Payment History</h2>
              <p className="text-xs text-slate-500 mt-0.5">Recent receipts issued</p>
            </div>
            <Link
              href="/student/payments"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center"
            >
              All <ChevronRight className="w-4 h-4 ml-0.5" />
            </Link>
          </div>

          <div className="p-4 sm:p-5">
            {loading ? (
              <div className="space-y-3">
                <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            ) : (data?.recentPayments || []).length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                No payment transactions recorded yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {data?.recentPayments.map((p) => (
                  <div key={p.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono font-bold text-slate-800">
                        {p.receiptNumber}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatDate(p.paymentDate)} • {p.paymentMethod}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-700">
                        {formatCurrency(p.amount)}
                      </span>
                      <div className="mt-0.5">
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Support / Campus Contact Card */}
      <div className="p-5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Institute Support & Campus</h3>
          <p className="text-sm font-semibold text-slate-900 mt-1">Forever IT Institute — Student Assistance Desk</p>
          <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-600">
            <span className="flex items-center">
              <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-700" />
              House # 14, Road # 14, Block # L, South Banasree, Dhaka-1219
            </span>
            <span className="flex items-center">
              <Phone className="w-3.5 h-3.5 mr-1 text-emerald-700" />
              +8801762367001
            </span>
          </div>
        </div>
        <a
          href="http://www.foreveritbd.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-50 transition-smooth shrink-0"
        >
          Visit Website <ArrowUpRight className="w-3.5 h-3.5 ml-1.5" />
        </a>
      </div>
    </DashboardLayout>
  );
}
