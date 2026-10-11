'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, PaymentReceipt } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Printer, ArrowLeft } from 'lucide-react';

export default function PrintablePaymentReceipt() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.payments.getReceipt(id);
        setReceipt(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch money receipt.');
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm font-semibold text-slate-600">Generating receipt for printing...</p>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-6 rounded-xl border border-slate-300 text-center max-w-md">
          <p className="text-red-600 font-bold mb-4">{error || 'Receipt not found.'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:py-0 print:bg-white text-black font-sans">
      {/* Floating Toolbar (Hidden when printing) */}
      <div className="no-print max-w-[180mm] mx-auto mb-4 flex items-center justify-between px-4">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back
        </button>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-md"
        >
          <Printer className="w-4 h-4 mr-1.5" />
          Print Money Receipt
        </button>
      </div>

      {/* Printable Receipt Canvas */}
      <div className="max-w-[180mm] mx-auto bg-white p-8 border-2 border-slate-300 print:border-none shadow-lg print:shadow-none min-h-[140mm] flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex justify-between items-start pb-4 border-b-2 border-emerald-900">
            <div>
              <h1 className="text-xl font-black text-emerald-900 uppercase tracking-wide">
                {receipt.institute.name}
              </h1>
              <p className="text-xs font-bold font-bangla text-emerald-800">
                {receipt.institute.tagline}
              </p>
              <p className="text-[11px] text-slate-500">
                Web: {receipt.institute.website}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded bg-emerald-100 text-emerald-950 font-black text-xs uppercase tracking-wider border border-emerald-300">
                Money Receipt
              </span>
              <p className="text-xs font-mono font-bold text-slate-900 mt-2">
                Receipt No: {receipt.receiptNumber}
              </p>
              <p className="text-[11px] text-slate-600">
                Date: {formatDate(receipt.paymentDate)}
              </p>
            </div>
          </div>

          {/* Student & Payment Summary Grid */}
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs pb-4 border-b border-slate-200">
            <div>
              <span className="text-slate-500 block">Student Name:</span>
              <span className="font-bold text-slate-900 text-sm">
                {receipt.student.fullName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Registration Number:</span>
              <span className="font-mono font-bold text-slate-900 text-sm">
                {receipt.student.registrationNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Contact Phone:</span>
              <span className="font-semibold text-slate-800">
                {receipt.student.mobileNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Payment Method:</span>
              <span className="font-bold text-slate-800 uppercase">
                {receipt.paymentMethod}{' '}
                {receipt.transactionReference ? `(TrxID: ${receipt.transactionReference})` : ''}
              </span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="mt-5 p-4 rounded-lg bg-emerald-50 border border-emerald-300">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                Amount Received (টাকা আদায়):
              </span>
              <span className="text-2xl font-black text-emerald-900">
                {formatCurrency(receipt.amount)}
              </span>
            </div>
            <div className="text-xs font-medium text-emerald-800 italic pt-1 border-t border-emerald-200">
              Amount in words: <strong className="not-italic">{receipt.amountInWords}</strong>
            </div>
          </div>

          {/* Balance Statement */}
          <div className="mt-4 flex justify-between items-center text-xs p-3 bg-slate-50 rounded border border-slate-200">
            <div>
              <span className="text-slate-500">Total Course Payable: </span>
              <strong className="text-slate-800">{formatCurrency(receipt.financialSummary.totalPayable)}</strong>
            </div>
            <div>
              <span className="text-slate-500">Total Paid: </span>
              <strong className="text-emerald-800">{formatCurrency(receipt.financialSummary.totalPaid)}</strong>
            </div>
            <div>
              <span className="text-slate-500">Remaining Balance: </span>
              <strong className="text-red-600 font-bold">{formatCurrency(receipt.financialSummary.outstandingDue)}</strong>
            </div>
          </div>
        </div>

        {/* Footer & Signature */}
        <div className="mt-10 pt-4">
          <div className="flex justify-between items-end text-xs">
            <div className="text-[11px] text-slate-500">
              Received By: <strong className="text-slate-800">{receipt.receivedBy}</strong>
            </div>

            <div className="text-center">
              <div className="border-t border-slate-800 w-44 pt-1 font-bold text-slate-900">
                Authorized Signature
              </div>
              <p className="text-[10px] text-slate-500">কর্তৃপক্ষের স্বাক্ষর</p>
            </div>
          </div>

          <div className="mt-6 text-center text-[9px] text-slate-400 border-t border-slate-200 pt-2">
            This is an official computer-generated receipt from Forever IT Institute • www.foreveritbd.com
          </div>
        </div>
      </div>
    </div>
  );
}
