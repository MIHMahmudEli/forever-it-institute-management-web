'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, PaymentReceipt } from '@/lib/api/api-client';
import { useAuth } from '@/lib/auth/auth-context';
import { formatCurrency, formatDate } from '@/lib/utils';
import BrandLogo from '@/components/ui/BrandLogo';
import CornerRibbons from '@/components/ui/CornerRibbons';
import SectionPill from '@/components/ui/SectionPill';
import CorporateFooterBanner from '@/components/ui/CorporateFooterBanner';
import {
  Printer,
  ArrowLeft,
  User,
  CreditCard,
  PieChart,
  AlertTriangle,
  FileText,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';

export default function PrintablePaymentReceipt() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [receipt, setReceipt] = useState<PaymentReceipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Responsive & Zoom State
  const [activeTab, setActiveTab] = useState<'document' | 'summary'>('document');
  const [scale, setScale] = useState(1);
  const [zoomPercent, setZoomPercent] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

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

  useEffect(() => {
    const handleResize = () => {
      if (typeof window === 'undefined') return;
      const w = window.innerWidth;
      if (w < 840) {
        // 210mm ≈ 794px at 96 DPI. Provide 24px total horizontal margin
        const availableWidth = Math.max(280, w - 24);
        const autoScale = Math.min(1, Math.max(0.32, availableWidth / 794));
        setScale(autoScale);
      } else {
        setScale(1);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { user } = useAuth();
  const isStudent = user?.role === 'STUDENT';
  const fallbackRoute = isStudent ? '/student/payments' : '/payments';

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        router.back();
        setTimeout(() => {
          if (window.location.pathname.includes('/print/receipt/')) {
            router.push(fallbackRoute);
          }
        }, 120);
      } else {
        router.push(fallbackRoute);
      }
    }
  };

  const handleCopyReceiptNumber = () => {
    if (!receipt?.receiptNumber) return;
    navigator.clipboard.writeText(receipt.receiptNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const effectiveScale = zoomPercent !== null ? zoomPercent / 100 : scale;
  const currentZoomDisplay = Math.round(effectiveScale * 100);

  const handleZoomIn = () => {
    const cur = zoomPercent ?? Math.round(scale * 100);
    setZoomPercent(Math.min(150, cur + 15));
  };

  const handleZoomOut = () => {
    const cur = zoomPercent ?? Math.round(scale * 100);
    setZoomPercent(Math.max(30, cur - 15));
  };

  const handleZoomFit = () => {
    setZoomPercent(null);
  };

  const handleZoomActual = () => {
    setZoomPercent(100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#006838] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Generating receipt for printing...</p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-300 text-center max-w-md shadow-md">
          <p className="text-red-600 font-bold mb-4">{error || 'Receipt not found.'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2.5 bg-[#006838] hover:bg-[#015333] text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            {isStudent ? 'Back to My Payments' : 'Back to Payments'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 sm:bg-slate-200 flex flex-col items-center print:p-0 print:m-0 print:bg-white print:min-h-0 print:block text-black font-sans">
      {/* Sticky App Bar (Hidden when printing) */}
      <header className="no-print sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs pt-[env(safe-area-inset-top)]">
        <div className="max-w-[210mm] mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-4">
          {/* Back button */}
          <button
            onClick={handleBack}
            className="inline-flex items-center justify-center px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4 mr-1 sm:mr-1.5 shrink-0" />
            <span className="hidden sm:inline">{isStudent ? 'My Payments' : 'Payments'}</span>
            <span className="sm:hidden">Back</span>
          </button>

          {/* Center Title & Receipt Pill */}
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate hidden xs:inline">
              Money Receipt
            </h1>
            <button
              onClick={handleCopyReceiptNumber}
              className="inline-flex items-center gap-1 font-mono text-[11px] sm:text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-2 sm:px-2.5 py-1 rounded-md border border-slate-200 transition-colors shrink-0"
              title="Click to copy receipt number"
            >
              <span>{receipt.receiptNumber}</span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-600" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400" />
              )}
            </button>
          </div>

          {/* Desktop Print Button & View Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Switcher Tabs (on mobile/tablet) */}
            <div className="inline-flex sm:hidden p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium">
              <button
                onClick={() => setActiveTab('document')}
                className={`px-2 py-1 rounded-md flex items-center gap-1 text-[11px] font-bold transition-all ${
                  activeTab === 'document'
                    ? 'bg-white text-[#006838] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Sheet</span>
              </button>
              <button
                onClick={() => setActiveTab('summary')}
                className={`px-2 py-1 rounded-md flex items-center gap-1 text-[11px] font-bold transition-all ${
                  activeTab === 'summary'
                    ? 'bg-white text-[#006838] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>Mobile</span>
              </button>
            </div>

            {/* Desktop Print Action */}
            {receipt.status === 'COMPLETED' ? (
              <button
                onClick={() => window.print()}
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#006838] hover:bg-[#015333] active:scale-95 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print Official Receipt (A4)
              </button>
            ) : (
              <span className="hidden sm:inline-flex items-center px-3.5 py-1.5 rounded-xl bg-red-100 text-red-800 text-xs font-bold border border-red-200">
                Reversed
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-[210mm] mx-auto px-2 sm:px-4 py-3 sm:py-5 flex flex-col items-center">
        {/* Warning banner for reversed payment */}
        {receipt.status !== 'COMPLETED' && (
          <div className="no-print w-full mb-3 bg-red-50 border border-red-300 text-red-900 px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-xl text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-xs">
            <div className="flex items-start sm:items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-bold block text-red-900">
                  This Payment Collection Was REVERSED
                </span>
                <p className="text-[11px] text-red-800 mt-0.5">
                  Reversal Reason: <strong className="font-semibold text-red-950">"{receipt.reversalReason || 'No reason specified'}"</strong>
                  {receipt.reversedBy && ` • Reversed By: ${receipt.reversedBy}`}
                  {receipt.reversedAt && ` • ${formatDate(receipt.reversedAt)}`}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-100/90 px-2.5 py-1 rounded-md border border-red-200 shrink-0">
              Printing Disabled
            </span>
          </div>
        )}

        {/* Mobile Zoom Toolbar (visible when activeTab === 'document' on mobile screens) */}
        {activeTab === 'document' && (
          <div className="no-print w-full flex sm:hidden items-center justify-between gap-1.5 mb-2.5 px-1 py-1.5 bg-white/90 backdrop-blur-sm rounded-xl border border-slate-200 shadow-xs text-xs">
            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomFit}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  zoomPercent === null
                    ? 'bg-[#006838] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Maximize2 className="w-3 h-3 inline mr-1" />
                Fit Screen
              </button>
              <button
                onClick={handleZoomActual}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                  zoomPercent === 100
                    ? 'bg-[#006838] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                100% Size
              </button>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleZoomOut}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[11px] font-bold text-slate-700 w-9 text-center">
                {currentZoomDisplay}%
              </span>
              <button
                onClick={handleZoomIn}
                className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: Mobile Summary Cards (< sm and activeTab === 'summary') */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`no-print w-full space-y-3 pb-24 sm:hidden ${
            activeTab === 'summary' ? 'block' : 'hidden'
          }`}
        >
          {/* Amount Hero Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#006838] to-[#015333] text-white shadow-md">
            <div className="flex items-center justify-between text-xs text-white/80 font-medium">
              <span>Amount Received (টাকা আদায়)</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  receipt.status === 'COMPLETED'
                    ? 'bg-emerald-400/25 text-emerald-100 border border-emerald-300/30'
                    : 'bg-red-500/30 text-red-100 border border-red-300/30'
                }`}
              >
                {receipt.status}
              </span>
            </div>
            <div className="text-3xl font-black text-white mt-1.5 tracking-tight">
              {formatCurrency(receipt.amount)}
            </div>
            <div className="text-[11.5px] text-emerald-100/90 font-medium mt-1.5 capitalize pt-2 border-t border-white/20">
              In Words: <span className="font-bold text-white">{receipt.amountInWords}</span>
            </div>
          </div>

          {/* Student & Course Card */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1.5 border-b border-slate-100">
              <User className="w-4 h-4 text-[#006838]" />
              <span>Student & Program Details</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10.5px] text-slate-500 block">Student Name</span>
                <span className="font-bold text-slate-900 text-sm block">{receipt.student.fullName}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-slate-500 block">Registration No</span>
                <span className="font-mono font-bold text-slate-900 block">{receipt.student.registrationNumber}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <span className="text-[10.5px] text-slate-500 block">Mobile Number</span>
                <a href={`tel:${receipt.student.mobileNumber}`} className="font-semibold text-[#006838] block">
                  {receipt.student.mobileNumber}
                </a>
              </div>
              <div>
                <span className="text-[10.5px] text-slate-500 block">Enrolled Program</span>
                <span className="font-bold text-slate-800 block">
                  {receipt.course?.name || 'Professional IT Training'}
                </span>
              </div>
            </div>
            {receipt.student.presentAddress && (
              <div className="pt-1 border-t border-slate-100">
                <span className="text-[10.5px] text-slate-500 block">Present Address</span>
                <span className="text-slate-700 block">{receipt.student.presentAddress}</span>
              </div>
            )}
          </div>

          {/* Payment Particulars Card */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1.5 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-[#006838]" />
              <span>Payment Particulars</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10.5px] text-slate-500 block">Payment Method</span>
                <span className="font-bold text-[#006838] uppercase block">{receipt.paymentMethod}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-slate-500 block">Transaction Reference</span>
                <span className="font-mono text-slate-800 block">{receipt.transactionReference || 'Direct Cash'}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <span className="text-[10.5px] text-slate-500 block">Payment Date</span>
                <span className="font-semibold text-slate-800 block">{formatDate(receipt.paymentDate)}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-slate-500 block">Received By</span>
                <span className="font-semibold text-slate-800 block">{receipt.receivedBy}</span>
              </div>
            </div>
            {receipt.notes && (
              <div className="pt-1 border-t border-slate-100">
                <span className="text-[10.5px] text-slate-500 block">Payment Purpose / Notes</span>
                <span className="text-slate-700 block">{receipt.notes}</span>
              </div>
            )}
          </div>

          {/* Account Statement Summary Card */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1.5 border-b border-slate-100">
              <PieChart className="w-4 h-4 text-[#006838]" />
              <span>Account Statement Summary</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center py-2 px-1 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">Total Fee</span>
                <strong className="text-slate-900 font-bold text-xs block mt-0.5">
                  {formatCurrency(receipt.financialSummary.totalPayable)}
                </strong>
              </div>
              <div className="border-x border-slate-200 px-1">
                <span className="text-[10px] text-slate-500 block font-medium">Paid To Date</span>
                <strong className="text-[#006838] font-bold text-xs block mt-0.5">
                  {formatCurrency(receipt.financialSummary.totalPaid)}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">Remaining Due</span>
                <strong className="text-[#D81A22] font-black text-xs block mt-0.5">
                  {formatCurrency(receipt.financialSummary.outstandingDue)}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: Scaled Official A4 Canvas (Document Mode or Desktop or Print) */}
        {/* ------------------------------------------------------------- */}
        <div
          className={`w-full flex justify-center overflow-x-auto pb-24 sm:pb-8 print:p-0 print:m-0 print:overflow-visible ${
            activeTab === 'document' ? 'block' : 'hidden sm:block'
          } print:!block`}
        >
          {/* Responsive Scaling Outer Wrapper (reserves exact scaled dimensions without page overflow) */}
          <div
            style={{
              width: effectiveScale < 0.98 ? `${Math.round(794 * effectiveScale)}px` : 'auto',
              height: effectiveScale < 0.98 ? `${Math.round(1123 * effectiveScale)}px` : 'auto',
            }}
            className="relative mx-auto transition-all duration-150 print:!w-auto print:!h-auto print:!m-0"
          >
            {/* Printable Sheet Canvas — Fixed Exact A4 Portrait Geometry (210mm x 297mm) */}
            <div
              style={{
                transform: effectiveScale < 0.98 ? `scale(${effectiveScale})` : 'none',
                transformOrigin: 'top left',
                width: '210mm',
                height: '297mm',
                maxHeight: '297mm',
                minHeight: '297mm',
              }}
              className="receipt-page relative shrink-0 bg-white shadow-2xl overflow-hidden box-border print:!transform-none print:shadow-none print:m-0 print:border-none"
            >
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

                {/* 9. Corporate Footer Banner */}
                <div className="w-full max-w-[162mm] mx-auto">
                  <CorporateFooterBanner variant="print" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Sticky Bottom Action Bar on Mobile Viewports (< sm) */}
      <div className="no-print block sm:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-xl z-40 pb-[max(12px,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <button
            onClick={() => setActiveTab(activeTab === 'document' ? 'summary' : 'document')}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center justify-center shrink-0 active:scale-95 transition-all"
            title="Toggle View Mode"
          >
            {activeTab === 'document' ? (
              <Smartphone className="w-4 h-4 text-[#006838]" />
            ) : (
              <FileText className="w-4 h-4 text-[#006838]" />
            )}
          </button>

          {/* Primary Print Button */}
          {receipt.status === 'COMPLETED' ? (
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#006838] hover:bg-[#015333] active:scale-98 text-white font-bold text-xs shadow-md transition-all"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Print Official Receipt (A4)
            </button>
          ) : (
            <div className="flex-1 text-center py-2.5 px-3 rounded-xl bg-red-100 text-red-800 font-bold text-xs border border-red-200">
              Payment Reversed (Printing Disabled)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
