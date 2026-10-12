'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, Payment } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { TableSkeleton } from '@/components/ui/skeletons';
import {
  Receipt,
  Printer,
  CircleDollarSign,
  AlertCircle,
  Info,
} from 'lucide-react';
import ReversalDetailsModal from '@/components/ui/ReversalDetailsModal';
import { useAuth } from '@/lib/auth/auth-context';

export default function StudentPaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reversal Audit Details Modal State
  const [reversalDetailsModalOpen, setReversalDetailsModalOpen] = useState(false);
  const [selectedReversalPayment, setSelectedReversalPayment] = useState<Payment | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.studentPortal.getPayments();
      setPayments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch payment records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const totalPaid = payments.reduce(
    (sum, p) => sum + (p.status === 'COMPLETED' ? Number(p.amount) : 0),
    0
  );

  return (
    <DashboardLayout title="Payments & Receipts">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Financial Transactions & Receipts</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified official receipts issued by Forever IT Institute.
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200/80 px-4 py-2.5 rounded-xl flex items-center space-x-3 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
            <CircleDollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider block">
              Total Verified Paid
            </span>
            <span className="text-base font-black text-emerald-900">
              {formatCurrency(totalPaid)}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : payments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Payment Records Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You do not have any recorded payment receipts yet. When you complete an installment or registration payment, your official receipt will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 whitespace-nowrap">
                <tr>
                  <th className="px-5 py-3.5">Receipt #</th>
                  <th className="px-5 py-3.5">Payment Date</th>
                  <th className="px-5 py-3.5">Associated Course</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Transaction Ref</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => {
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors whitespace-nowrap">
                      <td className="px-5 py-4 font-mono font-bold text-slate-900">
                        {p.receiptNumber}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(p.paymentDate)}</td>
                      <td className="px-5 py-4 font-medium text-slate-800">
                        {p.enrollment?.course?.name || 'Registration Fee'}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{p.paymentMethod}</td>
                      <td className="px-5 py-4 font-mono text-slate-500">
                        {p.transactionReference || '—'}
                      </td>
                      <td className="px-5 py-4 font-bold text-emerald-700 text-sm">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={p.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {p.status === 'COMPLETED' ? (
                            <Link
                              href={`/print/receipt/${p.id}`}
                              target="_blank"
                              className="inline-flex items-center justify-center p-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80 transition-smooth shadow-2xs hover:shadow-xs"
                              title="Print Official Payment Receipt"
                              aria-label="Print Official Payment Receipt"
                            >
                              <Printer className="w-4 h-4 text-emerald-700" />
                            </Link>
                          ) : p.status === 'REVERSED' ? (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReversalPayment(p);
                                setReversalDetailsModalOpen(true);
                              }}
                              className="inline-flex items-center justify-center p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors shadow-2xs cursor-pointer"
                              title="View Why This Payment Was Reversed (Reversal Reason)"
                              aria-label="View Why This Payment Was Reversed"
                            >
                              <Info className="w-4 h-4 text-red-600" />
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reversal Audit Details Modal */}
      <ReversalDetailsModal
        payment={selectedReversalPayment}
        isOpen={reversalDetailsModalOpen}
        onClose={() => {
          setReversalDetailsModalOpen(false);
          setSelectedReversalPayment(null);
        }}
        studentName={selectedReversalPayment?.student?.fullName || user?.fullName}
        studentRegNo={selectedReversalPayment?.student?.registrationNumber || user?.registrationNumber || ''}
      />
    </DashboardLayout>
  );
}
