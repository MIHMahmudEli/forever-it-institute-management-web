'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, Payment } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Receipt,
  Printer,
  ChevronLeft,
  ChevronRight,
  Filter,
  RotateCcw,
  X,
  AlertTriangle,
} from 'lucide-react';

export default function PaymentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');

  // Reversal Modal
  const [reversalModalOpen, setReversalModalOpen] = useState(false);
  const [targetPayment, setTargetPayment] = useState<Payment | null>(null);
  const [reversalReason, setReversalReason] = useState('');
  const [reversing, setReversing] = useState(false);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await api.payments.getAll({
        status: statusFilter || undefined,
        page,
        limit: 15,
      });
      setPayments(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalCount(res.meta.total);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  const handleReverse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPayment || !reversalReason.trim()) return;

    setReversing(true);
    try {
      await api.payments.reverse(targetPayment.id, { reversalReason });
      setReversalModalOpen(false);
      setTargetPayment(null);
      setReversalReason('');
      fetchPayments();
    } catch (err: any) {
      alert(err.message || 'Failed to reverse payment.');
    } finally {
      setReversing(false);
    }
  };

  return (
    <DashboardLayout title="Financial Transactions">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payments & Receipts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete transaction ledger with receipts, amount-in-words, and audit trails ({totalCount} entries).
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 bg-white"
          >
            <option value="">All Transactions</option>
            <option value="COMPLETED">Completed</option>
            <option value="REVERSED">Reversed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Student & Reg No</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Amount (BDT)</th>
                <th className="py-3 px-4">Amount in Words</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-200 rounded w-24" /></td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 bg-slate-200 rounded w-28 mb-1" />
                      <div className="h-2.5 bg-slate-100 rounded w-20" />
                    </td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-20" /></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-16" /></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-200 rounded w-16" /></td>
                    <td className="py-3.5 px-4"><div className="h-3 bg-slate-100 rounded w-32" /></td>
                    <td className="py-3.5 px-4"><div className="h-5 bg-slate-100 rounded-full w-20" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-6 bg-slate-100 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Receipt className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No payment transactions recorded.</p>
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{p.student?.fullName || 'Student'}</p>
                      <p className="font-mono text-[10px] text-slate-400">
                        {p.student?.registrationNumber}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{formatDate(p.paymentDate)}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold uppercase text-slate-800">
                        {p.paymentMethod}
                      </span>
                      {p.transactionReference && (
                        <span className="block text-[10px] font-mono text-slate-400">
                          {p.transactionReference}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-emerald-800 text-sm">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 italic text-[11px] max-w-[200px] truncate">
                      {p.amountInWords || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {p.status === 'COMPLETED' ? (
                          <Link
                            href={`/print/receipt/${p.id}`}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors shadow-2xs"
                            title="Print Money Receipt"
                            aria-label="Print Money Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </Link>
                        ) : (
                          <span className="text-slate-400 font-medium text-xs px-2 select-none" title="Print unavailable for reversed payment">
                            —
                          </span>
                        )}

                        {isAdmin && p.status === 'COMPLETED' && (
                          <button
                            onClick={() => {
                              setTargetPayment(p);
                              setReversalModalOpen(true);
                            }}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-red-200 transition-colors shadow-2xs"
                            title="Reverse Payment"
                            aria-label="Reverse Payment"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-slate-300 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reversal Confirmation Modal */}
      {reversalModalOpen && targetPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <h3 className="text-base font-bold text-slate-900">Authorize Payment Reversal</h3>
                <p className="text-xs text-slate-500">
                  Receipt: {targetPayment.receiptNumber} ({formatCurrency(targetPayment.amount)})
                </p>
              </div>
            </div>

            <form onSubmit={handleReverse} className="space-y-4 text-xs">
              <p className="text-slate-600">
                Payment records are never permanently deleted for accounting integrity. Reversing this
                transaction will adjust the student balance and mark this receipt as REVERSED.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Reversal Reason (Mandatory Audit Trail) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={reversalReason}
                  onChange={(e) => setReversalReason(e.target.value)}
                  placeholder="e.g. Accidental duplicate cash entry entered by staff..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReversalModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reversing || !reversalReason.trim()}
                  className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold disabled:opacity-50"
                >
                  {reversing ? 'Reversing...' : 'Confirm Reversal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
