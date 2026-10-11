'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, PaymentReceipt } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import BrandLogo from '@/components/ui/BrandLogo';
import CornerRibbons from '@/components/ui/CornerRibbons';
import SectionPill from '@/components/ui/SectionPill';
import CorporateFooterBanner from '@/components/ui/CorporateFooterBanner';
import { Printer, ArrowLeft, User, CreditCard, PieChart } from 'lucide-react';

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
        <div className="bg-white p-6 rounded-xl border border-slate-300 text-center max-w-md shadow-md">
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
    <div className="min-h-screen bg-slate-200 py-6 px-4 flex flex-col items-center print:p-0 print:m-0 print:bg-white print:min-h-0 print:block text-black font-sans">
      {/* Floating Toolbar (Hidden when printing) */}
      <div className="no-print w-full max-w-[210mm] mb-4 flex items-center justify-between px-2 sm:px-0">
        <button
          onClick={handleBack}
          className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Payments
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600 font-mono bg-white px-2.5 py-1 rounded-md border border-slate-200">
            Receipt: {receipt.receiptNumber}
          </span>
          {receipt.status === 'COMPLETED' ? (
            <button
              onClick={() => window.print()}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-[#006838] hover:bg-[#015333] text-white text-xs font-bold shadow-md transition-colors"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Print Official Receipt (A4)
            </button>
          ) : (
            <span className="inline-flex items-center px-3.5 py-2 rounded-lg bg-red-100 text-red-800 text-xs font-bold border border-red-200 cursor-not-allowed">
              Reversed (Printing Disabled)
            </span>
          )}
        </div>
      </div>

      {/* Warning banner for reversed payment */}
      {receipt.status !== 'COMPLETED' && (
        <div className="no-print w-full max-w-[210mm] mb-3 bg-red-50 border border-red-300 text-red-800 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs">
          <span>⚠️ This payment has been REVERSED. Official receipt printing is disabled for reversed transactions.</span>
        </div>
      )}

      {/* Printable Sheet Canvas — Fixed Exact A4 Portrait Geometry (210mm x 297mm) */}
      <div className="receipt-page relative w-[210mm] h-[297mm] max-h-[297mm] min-h-[297mm] mx-auto bg-white shadow-2xl overflow-hidden box-border print:shadow-none print:m-0 print:border-none">
        {/* Distinctive Diagonal Corner Ribbons on all 4 corners (SVG, bleeding beyond canvas) */}
        <CornerRibbons position="all" />

        {/* Content Flow: Balanced distribution filling ~95-98% of A4 page */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between px-8 pt-4 pb-3 box-border">
          {/* 1. Header Branding */}
          <div className="text-center">
            <BrandLogo variant="form-header" showTagline={true} />
          </div>

          {/* 2. Official Money Receipt Title Banner with Flanking Lines */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex-1 flex flex-col gap-0.5 max-w-[95px]">
              <div className="h-0.5 bg-[#D81A22]" />
              <div className="h-1 bg-[#006838]" />
            </div>

            <div className="bg-[#006838] text-white px-8 py-1 rounded-full shadow-xs">
              <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase">
                Official Money Receipt
              </h2>
            </div>

            <div className="flex-1 flex flex-col gap-0.5 max-w-[95px]">
              <div className="h-0.5 bg-[#D81A22]" />
              <div className="h-1 bg-[#006838]" />
            </div>
          </div>

          {/* 3. Receipt Meta Strip */}
          <div className="flex justify-between items-center text-xs px-4 py-2 bg-[#f0fdf4] border border-[#006838]/40 rounded-xl">
            <div>
              <span className="text-slate-600 font-medium">Receipt No: </span>
              <strong className="font-mono text-slate-900 font-bold text-sm">{receipt.receiptNumber}</strong>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-slate-600 font-medium">Date: </span>
                <strong className="text-slate-900 font-bold">{formatDate(receipt.paymentDate)}</strong>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  receipt.status === 'COMPLETED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-red-100 text-red-800 border border-red-300'
                }`}
              >
                {receipt.status}
              </span>
            </div>
          </div>

          {/* 4. Student & Enrollment Information */}
          <div className="relative">
            <SectionPill icon={<User className="w-3.5 h-3.5" />} title="Student & Program Details" />

            <div className="border-2 border-[#006838] rounded-xl p-3.5 bg-white/70 space-y-2 text-[11.5px]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-[10.5px]">Student Full Name:</span>
                  <span className="font-bold text-slate-900 text-sm block">{receipt.student.fullName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10.5px]">Registration Number:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm block">
                    {receipt.student.registrationNumber}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10.5px]">Mobile No:</span>
                  <span className="font-semibold text-slate-900 block">{receipt.student.mobileNumber}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10.5px]">Enrolled Program:</span>
                  <span className="font-bold text-[#006838] block">
                    {receipt.course?.name || 'Professional IT Training'}
                    {receipt.course?.code ? ` (${receipt.course.code})` : ''}
                  </span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-200">
                <span className="text-slate-500 block text-[10.5px]">Present Address:</span>
                <span className="font-medium text-slate-800 block">{receipt.student.presentAddress}</span>
              </div>
            </div>
          </div>

          {/* 5. Payment Particulars */}
          <div className="relative">
            <SectionPill icon={<CreditCard className="w-3.5 h-3.5" />} title="Payment Particulars" />

            <div className="border-2 border-[#006838] rounded-xl p-3.5 bg-white/70 space-y-2 text-[11.5px]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-[10.5px]">Payment Method:</span>
                  <span className="font-bold text-[#006838] uppercase block text-sm">{receipt.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10.5px]">Transaction Reference:</span>
                  <span className="font-mono font-semibold text-slate-800 block">
                    {receipt.transactionReference || 'N/A (Direct Cash)'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-1.5 border-t border-slate-200">
                <div>
                  <span className="text-slate-500 block text-[10.5px]">Payment Purpose:</span>
                  <span className="font-medium text-slate-800 block">
                    {receipt.notes || 'Course Tuition & Registration Fee Payment'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10.5px]">Received By:</span>
                  <span className="font-semibold text-slate-900 block">{receipt.receivedBy}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Prominent Amount Received Box */}
          <div className="p-4 rounded-xl bg-[#f0fdf4] border-2 border-[#006838] shadow-xs">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-black text-[#006838] uppercase tracking-wider">
                Amount Received (টাকা আদায়):
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#006838]">
                {formatCurrency(receipt.amount)}
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-800 pt-1.5 border-t border-[#006838]/30">
              In Words: <span className="font-bold capitalize">{receipt.amountInWords}</span>
            </div>
          </div>

          {/* 7. Financial Account Statement Summary */}
          <div className="relative">
            <SectionPill icon={<PieChart className="w-3.5 h-3.5" />} title="Account Statement Summary" />

            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border-2 border-slate-200 text-center text-xs">
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Total Course Fee</span>
                <strong className="text-slate-900 font-bold text-sm block mt-0.5">
                  {formatCurrency(receipt.financialSummary.totalPayable)}
                </strong>
              </div>
              <div className="border-x border-slate-200">
                <span className="text-slate-500 block text-[11px] font-medium">Total Paid To Date</span>
                <strong className="text-[#006838] font-bold text-sm block mt-0.5">
                  {formatCurrency(receipt.financialSummary.totalPaid)}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px] font-medium">Remaining Due</span>
                <strong className="text-[#D81A22] font-black text-sm block mt-0.5">
                  {formatCurrency(receipt.financialSummary.outstandingDue)}
                </strong>
              </div>
            </div>
          </div>

          {/* 8. Date & Signatures */}
          <div>
            <div className="grid grid-cols-2 gap-8 text-center pt-2">
              <div>
                <div className="border-t-2 border-slate-700 w-44 mx-auto mb-1.5" />
                <p className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wider">
                  Cashier / Received By
                </p>
                <p className="text-[9.5px] text-slate-500 font-medium">({receipt.receivedBy})</p>
              </div>

              <div>
                <div className="border-t-2 border-slate-700 w-44 mx-auto mb-1.5" />
                <p className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wider">
                  Authorized Signature
                </p>
                <p className="text-[9.5px] text-slate-500 font-bangla">কর্তৃপক্ষের স্বাক্ষর</p>
              </div>
            </div>
          </div>

          {/* 9. Corporate Footer Banner (Clean, flanked by bottom ribbons with zero collision) */}
          <div className="w-full max-w-[162mm] mx-auto">
            <CorporateFooterBanner variant="print" />
          </div>
        </div>
      </div>
    </div>
  );
}
