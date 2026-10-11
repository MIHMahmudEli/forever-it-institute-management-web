'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, PaymentReceipt } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import BrandLogo from '@/components/ui/BrandLogo';
import CornerRibbons from '@/components/ui/CornerRibbons';
import CorporateFooterBanner from '@/components/ui/CorporateFooterBanner';
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

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        router.back();
        setTimeout(() => {
          if (window.location.pathname.includes('/print/receipt/')) {
            router.push('/payments');
          }
        }, 120);
      } else {
        router.push('/payments');
      }
    }
  };

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
            onClick={handleBack}
            className="px-4 py-2 bg-[#006838] hover:bg-[#015333] text-white rounded-lg text-xs font-semibold"
          >
            Back to Payments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:py-0 print:bg-white text-black font-sans">
      {/* Floating Toolbar (Hidden when printing) */}
      <div className="no-print max-w-[190mm] mx-auto mb-4 flex items-center justify-between px-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Payments
        </button>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center px-4 py-2 rounded-lg bg-[#006838] hover:bg-[#015333] text-white text-xs font-bold shadow-md transition-colors"
        >
          <Printer className="w-4 h-4 mr-1.5" />
          Print Money Receipt
        </button>
      </div>

      {/* Printable Receipt Canvas */}
      <div className="relative max-w-[190mm] mx-auto bg-white p-6 sm:p-8 border-2 border-slate-300 print:border-none shadow-xl print:shadow-none min-h-[150mm] flex flex-col justify-between overflow-hidden">
        {/* Brand Corner Ribbons */}
        <CornerRibbons position="all-top" />

        <div className="relative z-10 space-y-4">
          {/* Header Branding */}
          <div className="pt-2 text-center">
            <BrandLogo variant="form-header" showTagline={true} />
          </div>

          {/* Receipt Title Capsule with Parallel Lines */}
          <div className="flex items-center justify-center gap-3 my-1">
            <div className="flex-1 flex flex-col gap-0.5 max-w-[100px]">
              <div className="h-0.5 bg-[#D81A22]" />
              <div className="h-1 bg-[#006838]" />
            </div>

            <div className="bg-[#006838] text-white px-6 py-1 rounded-full shadow-sm">
              <h2 className="text-sm sm:text-base font-black tracking-wider uppercase">
                Official Money Receipt
              </h2>
            </div>

            <div className="flex-1 flex flex-col gap-0.5 max-w-[100px]">
              <div className="h-0.5 bg-[#D81A22]" />
              <div className="h-1 bg-[#006838]" />
            </div>
          </div>

          {/* Receipt Meta & Numbers */}
          <div className="flex justify-between items-center text-xs px-2 py-1.5 bg-[#f0fdf4] border border-[#006838]/40 rounded-lg">
            <div>
              <span className="text-slate-600">Receipt No: </span>
              <strong className="font-mono text-slate-900 font-bold">{receipt.receiptNumber}</strong>
            </div>
            <div>
              <span className="text-slate-600">Date: </span>
              <strong className="text-slate-900 font-bold">{formatDate(receipt.paymentDate)}</strong>
            </div>
          </div>

          {/* Student Information Grid */}
          <div className="border border-[#006838] rounded-xl p-3 bg-white space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-500 block">Student Name:</span>
                <span className="font-bold text-slate-900 text-sm">{receipt.student.fullName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Registration Number:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{receipt.student.registrationNumber}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-100">
              <div>
                <span className="text-slate-500 block">Mobile No:</span>
                <span className="font-semibold text-slate-800">{receipt.student.mobileNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Payment Method:</span>
                <span className="font-bold text-[#006838] uppercase">
                  {receipt.paymentMethod}{' '}
                  {receipt.transactionReference ? `(TrxID: ${receipt.transactionReference})` : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Amount Box */}
          <div className="p-4 rounded-xl bg-[#f0fdf4] border-2 border-[#006838] shadow-xs">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-black text-[#006838] uppercase tracking-wider">
                Amount Received (টাকা আদায়):
              </span>
              <span className="text-2xl font-black text-[#006838]">
                {formatCurrency(receipt.amount)}
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-800 pt-1.5 border-t border-[#006838]/30">
              In Words: <span className="font-bold capitalize">{receipt.amountInWords}</span>
            </div>
          </div>

          {/* Balance Statement */}
          <div className="grid grid-cols-3 gap-2 text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
            <div>
              <span className="text-slate-500 block text-[11px]">Total Course Fee:</span>
              <strong className="text-slate-900 font-bold">{formatCurrency(receipt.financialSummary.totalPayable)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Total Paid To Date:</span>
              <strong className="text-[#006838] font-bold">{formatCurrency(receipt.financialSummary.totalPaid)}</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Remaining Due:</span>
              <strong className="text-[#D81A22] font-black">{formatCurrency(receipt.financialSummary.outstandingDue)}</strong>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-6 pb-2">
            <div className="flex justify-between items-end text-xs">
              <div className="text-[11px] text-slate-600">
                Received By: <strong className="text-slate-900">{receipt.receivedBy}</strong>
              </div>

              <div className="text-center">
                <div className="border-t border-slate-800 w-44 pt-1 font-bold text-slate-900">
                  Authorized Signature
                </div>
                <p className="text-[10px] text-slate-500">কর্তৃপক্ষের স্বাক্ষর</p>
              </div>
            </div>
          </div>

          {/* Corporate Footer Banner */}
          <div className="pt-3">
            <CorporateFooterBanner variant="print" />
          </div>
        </div>
      </div>
    </div>
  );
}
