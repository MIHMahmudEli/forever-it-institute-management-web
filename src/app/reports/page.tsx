'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-context';
import StatusBadge from '@/components/ui/StatusBadge';
import { Printer, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function ReportsPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'dues' | 'payments' | 'enrollments'>('dues');
  const [loading, setLoading] = useState(true);

  // Dues Report State
  const [duesData, setDuesData] = useState<{ summary: any; items: any[] } | null>(null);

  // Payments Report State
  const [paymentsData, setPaymentsData] = useState<{ summary: any; items: any[] } | null>(null);

  // Enrollments Report State
  const [enrollmentsData, setEnrollmentsData] = useState<{ summary: any; items: any[] } | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dues') {
        const res = await api.reports.getDues();
        setDuesData(res);
      } else if (activeTab === 'payments') {
        const res = await api.reports.getPayments();
        setPaymentsData(res);
      } else if (activeTab === 'enrollments') {
        const res = await api.reports.getEnrollments();
        setEnrollmentsData(res);
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  if (!isAdmin) {
    return (
      <DashboardLayout title="Access Restricted">
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-lg mx-auto mt-12 shadow-xs">
          <ShieldAlert className="w-12 h-12 text-[#D81A22] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Administrator Privileges Required</h2>
          <p className="text-xs text-slate-500 mt-2">
            Institutional revenue, financial reconciliation, and dues reports are restricted to authorized institute
            administrators only.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Financial & Enrollment Reports">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Institutional Reports</h1>
          <p className="text-xs text-slate-500 mt-1">
            Reconciliation reports, outstanding balances, revenue auditing, and admissions statistics.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 shadow-xs"
        >
          <Printer className="w-3.5 h-3.5 mr-1.5" />
          Print Report Sheet
        </button>
      </div>

      {/* Segmented App-Style Tabs Bar */}
      <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto scrollbar-none mb-6">
        <button
          onClick={() => setActiveTab('dues')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'dues'
              ? 'bg-white text-red-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Outstanding Dues
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Payment Collections
        </button>
        <button
          onClick={() => setActiveTab('enrollments')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeTab === 'enrollments'
              ? 'bg-white text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Enrollments & Concessions
        </button>
      </div>

      {/* TAB 1: OUTSTANDING DUES */}
      {activeTab === 'dues' && (
        <div className="space-y-6">
          {/* Summary Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-5">
              <span className="text-xs font-medium text-red-700">Total Outstanding Balance</span>
              <h3 className="text-2xl font-black text-red-600 mt-1">
                {formatCurrency(duesData?.summary?.totalOutstandingDue)}
              </h3>
              <p className="text-[11px] text-red-600/80 mt-1">
                Uncollected tuition across active student profiles
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <span className="text-xs font-medium text-slate-500">Students with Pending Dues</span>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {duesData?.summary?.totalStudentsWithDue ?? 0}
              </h3>
              <p className="text-[11px] text-slate-400 mt-1">Requires follow-up</p>
            </div>
          </div>

          {/* Dues Data: Mobile Card List (< lg) + Desktop Table (lg+) */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            {/* Mobile Card List (< lg) */}
            <div className="block lg:hidden divide-y divide-slate-100 p-2 sm:p-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-3 space-y-2 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-36" />
                    <div className="h-3 bg-slate-100 rounded w-28" />
                    <div className="h-5 bg-slate-100 rounded-md w-full" />
                  </div>
                ))
              ) : !duesData?.items?.length ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  🎉 All students have completely settled their course tuition fees!
                </div>
              ) : (
                duesData.items.map((item, idx) => (
                  <div key={idx} className="p-3 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{item.fullName}</h4>
                        <p className="font-mono text-xs text-slate-500 font-bold">{item.registrationNumber}</p>
                      </div>
                      <span className="text-sm font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">
                        {formatCurrency(item.outstandingDue)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 px-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Student Phone</span>
                        <span className="font-semibold text-slate-800">{item.mobileNumber}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Total Paid / Fee</span>
                        <span className="font-semibold text-slate-700">
                          {formatCurrency(item.totalPaid)} / {formatCurrency(item.totalPayable)}
                        </span>
                      </div>
                    </div>

                    {item.enrolledCourses && item.enrolledCourses.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {item.enrolledCourses.map((c: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-100 text-[10.5px] font-medium text-slate-700">
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table (hidden on mobile, visible on lg+) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[720px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                    <th className="py-3 px-4">Student & Reg No</th>
                    <th className="py-3 px-4">Contact Phone</th>
                    <th className="py-3 px-4">Parents Contact</th>
                    <th className="py-3 px-4">Enrolled Programs</th>
                    <th className="py-3 px-4">Total Fee</th>
                    <th className="py-3 px-4">Total Paid</th>
                    <th className="py-3 px-4 text-right">Outstanding Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-3.5 px-4">
                          <div className="h-3.5 bg-slate-200 rounded w-28 mb-1" />
                          <div className="h-2.5 bg-slate-100 rounded w-16" />
                        </td>
                        <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-24" /></td>
                        <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-24" /></td>
                        <td className="py-3.5 px-4"><div className="h-4 bg-slate-100 rounded w-28" /></td>
                        <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-16" /></td>
                        <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-200 rounded w-16" /></td>
                        <td className="py-3.5 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto" /></td>
                      </tr>
                    ))
                  ) : !duesData?.items?.length ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        🎉 All students have completely settled their course tuition fees!
                      </td>
                    </tr>
                  ) : (
                    duesData.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 whitespace-nowrap">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{item.fullName}</p>
                          <p className="font-mono text-[10px] text-slate-400">
                            {item.registrationNumber}
                          </p>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-700">
                          {item.mobileNumber}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">{item.parentMobileNumber}</td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {item.enrolledCourses.map((c: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 whitespace-nowrap"
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-800">
                          {formatCurrency(item.totalPayable)}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-emerald-700">
                          {formatCurrency(item.totalPaid)}
                        </td>
                        <td className="py-3.5 px-4 font-black text-red-600 text-sm text-right">
                          {formatCurrency(item.due)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PAYMENTS REPORT */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <span className="text-xs font-semibold text-emerald-800">Total Verified Collections</span>
            <h3 className="text-2xl font-black text-emerald-800 mt-1">
              {formatCurrency(paymentsData?.summary?.totalCollected)}
            </h3>
            <p className="text-[11px] text-emerald-700 mt-1">
              Across {paymentsData?.summary?.totalTransactions ?? 0} total transactions
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            {/* Mobile Card List (< lg) */}
            <div className="block lg:hidden divide-y divide-slate-100 p-2 sm:p-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-3 space-y-2 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-32" />
                    <div className="h-3 bg-slate-100 rounded w-44" />
                    <div className="h-4 bg-slate-200 rounded w-20" />
                  </div>
                ))
              ) : !paymentsData?.items?.length ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No payment collections found.
                </div>
              ) : (
                paymentsData.items.map((p) => (
                  <div key={p.id} className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-mono text-xs font-bold text-slate-800">{p.receiptNumber}</span>
                        <p className="font-bold text-sm text-slate-900 mt-0.5">{p.student?.fullName || 'Student'}</p>
                      </div>
                      <StatusBadge status={p.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 px-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Method</span>
                        <span className="font-medium text-slate-700">
                          {formatDate(p.paymentDate)} • <span className="uppercase font-semibold">{p.paymentMethod}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Collected Amount</span>
                        <span className="text-sm font-black text-emerald-800">{formatCurrency(p.amount)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table (hidden on mobile, visible on lg+) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[720px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                    <th className="py-3 px-4">Receipt</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">TrxID</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-3 px-4"><div className="h-3.5 bg-slate-200 rounded w-20" /></td>
                        <td className="py-3 px-4"><div className="h-3.5 bg-slate-100 rounded w-16" /></td>
                        <td className="py-3 px-4"><div className="h-3.5 bg-slate-200 rounded w-28" /></td>
                        <td className="py-3 px-4"><div className="h-3.5 bg-slate-100 rounded w-16" /></td>
                        <td className="py-3 px-4"><div className="h-3.5 bg-slate-100 rounded w-24" /></td>
                        <td className="py-3 px-4"><div className="h-3.5 bg-slate-200 rounded w-16" /></td>
                        <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded-full w-20" /></td>
                      </tr>
                    ))
                  ) : !paymentsData?.items?.length ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    paymentsData.items.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 whitespace-nowrap">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {p.receiptNumber}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{formatDate(p.paymentDate)}</td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {p.student?.fullName}
                        </td>
                        <td className="py-3 px-4 uppercase font-medium">{p.paymentMethod}</td>
                        <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                          {p.transactionReference || '—'}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-800">
                          {formatCurrency(p.amount)}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={p.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ENROLLMENTS REPORT */}
      {activeTab === 'enrollments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <span className="text-xs text-slate-500 font-medium">Gross Course Value</span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {formatCurrency(enrollmentsData?.summary?.totalAgreedAmount)}
              </h3>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <span className="text-xs text-slate-500 font-medium">Total Concessions Given</span>
              <h3 className="text-xl font-bold text-red-600 mt-1">
                {formatCurrency(enrollmentsData?.summary?.totalDiscountAmount)}
              </h3>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <span className="text-xs text-emerald-800 font-medium">Net Receivable</span>
              <h3 className="text-xl font-bold text-emerald-800 mt-1">
                {formatCurrency(enrollmentsData?.summary?.totalFinalPayable)}
              </h3>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            {/* Mobile Card List (< lg) */}
            <div className="block lg:hidden divide-y divide-slate-100 p-2 sm:p-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-3 space-y-2 animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-36" />
                    <div className="h-3 bg-slate-100 rounded w-28" />
                    <div className="h-4 bg-slate-200 rounded w-24" />
                  </div>
                ))
              ) : !enrollmentsData?.items?.length ? (
                <div className="py-8 text-center text-xs text-slate-500">
                  No enrollments found.
                </div>
              ) : (
                enrollmentsData.items.map((e) => (
                  <div key={e.id} className="p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{e.student?.fullName || 'Student'}</h4>
                        <p className="text-xs text-slate-600 font-semibold">{e.course?.name}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold">
                        {e.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs py-2 px-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Agreed / Discount</span>
                        <span className="font-medium text-slate-700">
                          {formatCurrency(e.agreedFee)}{' '}
                          {e.discount > 0 && <span className="text-red-600 font-bold">(-{formatCurrency(e.discount)})</span>}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Net Payable</span>
                        <span className="text-sm font-black text-emerald-800">{formatCurrency(e.finalFee)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Desktop Table (hidden on mobile, visible on lg+) */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[720px]">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Catalog Fee</th>
                    <th className="py-3 px-4">Discount</th>
                    <th className="py-3 px-4">Net Payable</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="py-3 px-4"><div className="h-3.5 bg-slate-100 rounded w-16" /></td>
                        <td className="py-3 px-4"><div className="h-3.5 bg-slate-200 rounded w-28" /></td>
                        <td className="py-3 px-4"><div className="h-3.5 bg-slate-200 rounded w-24" /></td>
                        <td className="py-3 px-4"><div className="h-3.5 bg-slate-100 rounded w-16" /></td>
                        <td className="py-3 px-4"><div className="h-3.5 bg-slate-100 rounded w-14" /></td>
                        <td className="py-3 px-4"><div className="h-3.5 bg-slate-200 rounded w-16" /></td>
                        <td className="py-3 px-4"><div className="h-4 bg-slate-100 rounded-full w-16" /></td>
                      </tr>
                    ))
                  ) : !enrollmentsData?.items?.length ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No enrollments found.
                      </td>
                    </tr>
                  ) : (
                    enrollmentsData.items.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50 whitespace-nowrap">
                        <td className="py-3 px-4 text-slate-600">{formatDate(e.enrollmentDate)}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{e.student?.fullName}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{e.course?.name}</td>
                        <td className="py-3 px-4 font-medium">{formatCurrency(e.agreedFee)}</td>
                        <td className="py-3 px-4 text-red-600">
                          {e.discount > 0 ? `-${formatCurrency(e.discount)}` : '৳ 0'}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-800">
                          {formatCurrency(e.finalFee)}
                        </td>
                        <td className="py-3 px-4">{e.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
