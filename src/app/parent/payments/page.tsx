'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, Payment } from '@/lib/api/api-client';
import {
  Receipt,
  Calendar,
  CreditCard,
  Printer,
  AlertCircle,
} from 'lucide-react';

export default function ParentPaymentsPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const res = await api.parentPortal.getChildren();
      setChildren(res);
      if (res.length > 0) {
        const firstId = res[0].student.id;
        setSelectedStudentId(firstId);
        await loadPayments(firstId);
      }
    } catch (err: any) {
      console.error('Failed to load children', err);
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async (studentId: string) => {
    try {
      const data = await api.parentPortal.getChildPayments(studentId);
      setPayments(data);
    } catch (err: any) {
      console.error('Failed to load payments', err);
    }
  };

  const handleSelectChild = async (studentId: string) => {
    setSelectedStudentId(studentId);
    await loadPayments(studentId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
                <Receipt className="w-3.5 h-3.5 text-emerald-300" />
                <span>Financial Ledger & Verified Receipts</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Fee Payments Ledger</h1>
              <p className="text-emerald-100/90 text-sm mt-1">
                View all payment transactions, invoice slips, and print official receipts
              </p>
            </div>

            {children.length > 1 && (
              <div className="flex items-center gap-2 bg-white/15 p-1.5 rounded-2xl border border-white/20">
                {children.map((c) => (
                  <button
                    key={c.student.id}
                    onClick={() => handleSelectChild(c.student.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      c.student.id === selectedStudentId
                        ? 'bg-white text-emerald-950 shadow-sm'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {c.student.fullName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Receipt No</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4 text-right">Amount Paid</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No payment records found for this student.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{p.paymentDate}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {p.enrollment?.course?.name || 'Course'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{p.paymentMethod}</td>
                      <td className="py-3.5 px-4 text-right font-black text-slate-900">
                        ৳ {Number(p.amount).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Link
                          href={`/print/receipt/${p.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                        >
                          <Printer className="w-3.5 h-3.5 text-slate-500" />
                          <span>Print</span>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
