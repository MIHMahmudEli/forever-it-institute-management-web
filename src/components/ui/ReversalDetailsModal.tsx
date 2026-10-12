'use client';

import React from 'react';
import { Payment } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { X, RotateCcw, AlertTriangle, User, Calendar, CreditCard, Hash, BookOpen } from 'lucide-react';

interface ReversalDetailsModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  studentName?: string;
  studentRegNo?: string;
}

export default function ReversalDetailsModal({
  payment,
  isOpen,
  onClose,
  studentName,
  studentRegNo,
}: ReversalDetailsModalProps) {
  if (!isOpen || !payment) return null;

  const displayStudent = payment.student?.fullName || studentName || 'Student';
  const displayRegNo = payment.student?.registrationNumber || studentRegNo || '';
  const displayCourse = payment.enrollment?.course?.name;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in transition-opacity"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reversal-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4 sm:space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 id="reversal-modal-title" className="text-base font-bold text-slate-900">
                Payment Reversal Audit Record
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                Receipt No: <strong className="text-slate-800">{payment.receiptNumber}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Why it was reversed - Highlighted Callout */}
        <div className="bg-red-50/80 border border-red-200 rounded-xl p-4 space-y-2.5">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Reason for Payment Reversal
            </span>
          </div>

          <div className="bg-white/90 border border-red-200/60 rounded-lg p-3">
            <p className="text-xs text-red-950 font-medium whitespace-pre-wrap leading-relaxed">
              {payment.reversalReason ? (
                `“${payment.reversalReason}”`
              ) : (
                <span className="italic text-slate-500">No explicit reason text was provided at the time of reversal.</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] text-red-700/90 font-medium">
            <span>
              Reversed By: <strong className="text-red-900 font-semibold">{payment.reversedBy || 'Authorized Administrator'}</strong>
            </span>
            {payment.reversedAt && (
              <span>
                Timestamp: <strong className="text-red-900 font-semibold">{formatDate(payment.reversedAt)}</strong>
              </span>
            )}
          </div>
        </div>

        {/* Original Payment Metadata */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
            Original Transaction Details
          </h4>
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Student</span>
              <p className="font-bold text-slate-900 mt-0.5 flex items-center">
                <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {displayStudent}
              </p>
              {displayRegNo && (
                <span className="font-mono text-[10px] text-slate-500 block">{displayRegNo}</span>
              )}
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Reversed Amount</span>
              <p className="text-sm font-extrabold text-red-700 mt-0.5">
                {formatCurrency(payment.amount)}
              </p>
              <span className="text-[10px] text-slate-500">Deducted from verified total</span>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Payment Date</span>
              <p className="font-semibold text-slate-800 mt-0.5 flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {formatDate(payment.paymentDate)}
              </p>
            </div>

            <div>
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Method & Ref</span>
              <p className="font-semibold text-slate-800 mt-0.5 flex items-center">
                <CreditCard className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {payment.paymentMethod}
              </p>
              {payment.transactionReference && (
                <span className="font-mono text-[10px] text-slate-500 block">
                  Trx: {payment.transactionReference}
                </span>
              )}
            </div>

            {displayCourse && (
              <div className="col-span-2 pt-1 border-t border-slate-200/70">
                <span className="text-slate-400 block text-[10px] font-semibold uppercase">Enrolled Course</span>
                <p className="font-semibold text-slate-800 mt-0.5 flex items-center">
                  <BookOpen className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {displayCourse}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs shadow-xs transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
