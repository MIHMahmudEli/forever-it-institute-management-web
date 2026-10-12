'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, DashboardSummary } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { DashboardCardSkeleton } from '@/components/ui/skeletons';
import {
  Users,
  GraduationCap,
  ClipboardList,
  CircleDollarSign,
  AlertTriangle,
  UserPlus,
  ArrowUpRight,
  RefreshCw,
  Printer,
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const summary = await api.dashboard.getSummary();
      setData(summary);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  return (
    <DashboardLayout title="Executive Overview">
      {/* Official Institute Branded Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] text-white p-6 mb-6 shadow-lg border border-emerald-600/40">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D81A22] transform rotate-45 translate-x-16 -translate-y-16 opacity-80 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold mb-2 border border-white/20">
              <span>FOREVER IT INSTITUTE</span>
              <span>•</span>
              <span className="font-bangla">দক্ষতা গড়ুন, গড়ুন সফল ভবিষ্যৎ</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Institute Central Dashboard
            </h1>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-xl">
              Professional IT &amp; Business Development Training • South Banasree, Dhaka • +8801762367001
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center px-3.5 py-2 text-xs font-bold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/students/new"
              className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl bg-[#D81A22] hover:bg-[#b91c1c] text-white shadow-md transition-all"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1.5" />
              New Registration
            </Link>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between text-sm">
          <span>{error}</span>
          <button onClick={loadDashboard} className="underline font-semibold text-xs ml-4">
            Retry
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      {loading ? (
        <div className="mb-8">
          <DashboardCardSkeleton count={5} />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {/* Total Students */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Students</span>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-slate-900">
                {data?.kpis.totalStudents ?? 0}
              </h3>
              <p className="text-[11px] text-emerald-700 font-medium mt-1">
                {`${data?.kpis.activeStudents ?? 0} actively enrolled`}
              </p>
            </div>
          </div>

        {/* Active Courses */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Courses</span>
            <div className="p-2 bg-blue-50 rounded-lg text-blue-700">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">
              {loading ? '—' : data?.kpis.totalActiveCourses ?? 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Catalog programs</p>
          </div>
        </div>

        {/* Total Enrollments */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Course Enrollments</span>
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-700">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-slate-900">
              {loading ? '—' : data?.kpis.totalEnrollments ?? 0}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">Across all categories</p>
          </div>
        </div>

        {/* Payments Collected */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Payments Collected</span>
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800">
              <CircleDollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-emerald-700">
              {loading ? '—' : formatCurrency(data?.kpis.totalCollected)}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Of {formatCurrency(data?.kpis.totalPayable)} payable
            </p>
          </div>
        </div>

        {/* Outstanding Due */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Outstanding Due</span>
            <div className="p-2 bg-red-50 rounded-lg text-red-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
            <div className="mt-3">
              <h3 className="text-2xl font-bold text-red-600">
                {formatCurrency(data?.kpis.outstandingDue)}
              </h3>
              <p className="text-[11px] text-slate-500 mt-1">Pending student balances</p>
            </div>
          </div>
        </div>
      )}

      {/* Tables & Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Registrations (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Registrations</h2>
              <p className="text-xs text-slate-500">Latest students admitted to programs</p>
            </div>
            <Link
              href="/students"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="overflow-x-auto mt-3">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
                  <th className="py-2.5 px-3">Reg No</th>
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Mobile</th>
                  <th className="py-2.5 px-3">Courses</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3 px-3"><div className="h-3.5 bg-slate-200 rounded w-20" /></td>
                      <td className="py-3 px-3"><div className="h-3.5 bg-slate-200 rounded w-28" /></td>
                      <td className="py-3 px-3"><div className="h-3.5 bg-slate-100 rounded w-24" /></td>
                      <td className="py-3 px-3"><div className="h-3.5 bg-slate-100 rounded w-32" /></td>
                      <td className="py-3 px-3 text-right"><div className="h-7 w-7 bg-slate-100 rounded-lg ml-auto" /></td>
                    </tr>
                  ))
                ) : !data?.recentRegistrations?.length ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No registrations recorded yet.
                    </td>
                  </tr>
                ) : (
                  data.recentRegistrations.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                        {item.registrationNumber}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900">{item.fullName}</td>
                      <td className="py-3 px-3 text-slate-600">{item.mobileNumber}</td>
                      <td className="py-3 px-3 text-slate-600">
                        <div className="flex flex-wrap gap-1">
                          {item.courses.map((c, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 font-medium"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <Link
                          href={`/print/registration/${item.id}`}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs"
                          title="Print Registration Form"
                        >
                          <Printer className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Course Enrollment Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col">
          <div className="pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Course Distribution</h2>
            <p className="text-xs text-slate-500">Enrollment share by program</p>
          </div>

          <div className="flex-1 flex flex-col justify-center space-y-3 mt-4">
            {loading ? (
              <div className="space-y-3 py-2 animate-pulse">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between">
                      <div className="h-3 bg-slate-200 rounded w-32" />
                      <div className="h-3 bg-slate-100 rounded w-12" />
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full" />
                  </div>
                ))}
              </div>
            ) : !data?.courseDistribution?.length ? (
              <p className="text-center text-xs text-slate-400 py-6">No enrollment data available.</p>
            ) : (
              data.courseDistribution.map((item, idx) => {
                const total = data.kpis.totalEnrollments || 1;
                const percentage = Math.round((item.value / total) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 truncate mr-2">{item.name}</span>
                      <span className="text-slate-500 shrink-0">
                        {item.value} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Payments Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 mb-8">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Payment Collections</h2>
            <p className="text-xs text-slate-500">Live transaction ledger and receipt tracking</p>
          </div>
          <Link
            href="/payments"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center"
          >
            <span>All Transactions</span>
            <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-100">
                <th className="py-2.5 px-3">Receipt No</th>
                <th className="py-2.5 px-3">Student</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3 px-3"><div className="h-3.5 bg-slate-200 rounded w-20" /></td>
                    <td className="py-3 px-3"><div className="h-3.5 bg-slate-200 rounded w-28" /></td>
                    <td className="py-3 px-3"><div className="h-3.5 bg-slate-100 rounded w-20" /></td>
                    <td className="py-3 px-3"><div className="h-3.5 bg-slate-100 rounded w-16" /></td>
                    <td className="py-3 px-3"><div className="h-3.5 bg-slate-200 rounded w-16" /></td>
                    <td className="py-3 px-3"><div className="h-5 bg-slate-100 rounded-full w-20" /></td>
                    <td className="py-3 px-3 text-right"><div className="h-6 bg-slate-100 rounded w-20 ml-auto" /></td>
                  </tr>
                ))
              ) : !data?.recentPayments?.length ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                data.recentPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{p.studentName}</p>
                      <p className="text-[10px] text-slate-500 font-mono">{p.registrationNumber}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{formatDate(p.paymentDate)}</td>
                    <td className="py-3 px-3 font-medium text-slate-700 uppercase">{p.paymentMethod}</td>
                    <td className="py-3 px-3 font-bold text-emerald-700">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-3 text-right">
                      {p.status === 'COMPLETED' ? (
                        <Link
                          href={`/print/receipt/${p.id}`}
                          className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors shadow-2xs"
                        >
                          Print Receipt
                        </Link>
                      ) : (
                        <span className="text-slate-400 font-medium text-xs px-2 select-none" title="Print unavailable for reversed payment">
                          —
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
