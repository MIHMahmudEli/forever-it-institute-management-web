'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { BarChart3, AlertCircle, Printer, Download, Users, CreditCard } from 'lucide-react';

export default function ReportsPage() {
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-6 space-x-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('dues')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'dues'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Outstanding Dues Report
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'payments'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Payment Collections Report
        </button>
        <button
          onClick={() => setActiveTab('enrollments')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'enrollments'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Enrollments & Concessions Report
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

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
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
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Calculating student balances...
                      </td>
                    </tr>
                  ) : !duesData?.items?.length ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        🎉 All students have completely settled their course tuition fees!
                      </td>
                    </tr>
                  ) : (
                    duesData.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
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
                          <div className="flex flex-wrap gap-1">
                            {item.enrolledCourses.map((c: string, i: number) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700"
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
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
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Loading collections...
                      </td>
                    </tr>
                  ) : !paymentsData?.items?.length ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    paymentsData.items.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
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
                        <td className="py-3 px-4 font-medium">{p.status}</td>
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
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
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
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        Loading enrollments...
                      </td>
                    </tr>
                  ) : !enrollmentsData?.items?.length ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No enrollments found.
                      </td>
                    </tr>
                  ) : (
                    enrollmentsData.items.map((e) => (
                      <tr key={e.id} className="hover:bg-slate-50">
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
