'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, RegistrationDocument } from '@/lib/api/api-client';
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
  GraduationCap,
  Coins,
  Check,
  FileText,
  Smartphone,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Calendar,
  Phone,
  MapPin,
  CreditCard,
} from 'lucide-react';

export default function PrintableRegistrationForm() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [doc, setDoc] = useState<RegistrationDocument | null>(null);
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
        const data = await api.registrations.getDocument(id);
        setDoc(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load registration sheet.');
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
  const fallbackRoute = isStudent ? '/student/courses' : '/students';

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        router.back();
        setTimeout(() => {
          if (window.location.pathname.includes('/print/registration/')) {
            router.push(fallbackRoute);
          }
        }, 120);
      } else {
        router.push(fallbackRoute);
      }
    }
  };

  const handleCopyRegNumber = () => {
    if (!doc?.student.registrationNumber) return;
    navigator.clipboard.writeText(doc.student.registrationNumber);
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

  // Official 5 course categories from the registration form
  const standardCoursesCol1 = [
    'Basic Office Course',
    'Business Development',
    'Search Engine Optimization (SEO)',
  ];

  const standardCoursesCol2 = [
    'Website Development',
    'Software Development',
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#006838] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-600">Preparing registration document for print...</p>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-300 text-center max-w-md shadow-md">
          <p className="text-red-600 font-bold mb-4">{error || 'Registration document not found.'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2.5 bg-[#006838] hover:bg-[#015333] text-white rounded-xl text-xs font-semibold shadow-xs"
          >
            {isStudent ? 'Back to My Courses' : 'Back to Students'}
          </button>
        </div>
      </div>
    );
  }

  const enrolledNames = doc.courses.map((c) => c.name.toLowerCase());
  const isEnrolled = (courseName: string) =>
    enrolledNames.some((name) => name.includes(courseName.toLowerCase()) || courseName.toLowerCase().includes(name));

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
            <span className="hidden sm:inline">{isStudent ? 'My Courses' : 'Students'}</span>
            <span className="sm:hidden">Back</span>
          </button>

          {/* Center Title & Reg Number Pill */}
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 truncate hidden xs:inline">
              Registration Form
            </h1>
            <button
              onClick={handleCopyRegNumber}
              className="inline-flex items-center gap-1 font-mono text-[11px] sm:text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 px-2 sm:px-2.5 py-1 rounded-md border border-slate-200 transition-colors shrink-0"
              title="Click to copy registration number"
            >
              <span>{doc.student.registrationNumber}</span>
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
            <button
              onClick={() => window.print()}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-xl bg-[#006838] hover:bg-[#015333] active:scale-95 text-white text-xs font-bold shadow-sm transition-all"
            >
              <Printer className="w-4 h-4 mr-1.5" />
              Print Official Form (A4)
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="w-full max-w-[210mm] mx-auto px-2 sm:px-4 py-3 sm:py-5 flex flex-col items-center">
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
          {/* Student Hero Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#006838] to-[#015333] text-white shadow-md">
            <div className="flex items-center justify-between text-xs text-white/80 font-medium">
              <span>Student Registration</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/20 text-white border border-white/30">
                Official
              </span>
            </div>
            <div className="text-xl font-black text-white mt-1.5 tracking-tight">
              {doc.student.fullName}
            </div>
            <div className="flex items-center justify-between text-[11.5px] text-emerald-100/90 font-medium mt-1.5 pt-2 border-t border-white/20">
              <span>Reg: <strong className="font-mono text-white">{doc.student.registrationNumber}</strong></span>
              <span>Date: {formatDate(doc.registrationDate)}</span>
            </div>
          </div>

          {/* Student Personal Information Card */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1.5 border-b border-slate-100">
              <User className="w-4 h-4 text-[#006838]" />
              <span>Personal Information</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10.5px] text-slate-500 block">Mobile No.</span>
                <a href={`tel:${doc.student.mobileNumber}`} className="font-bold text-[#006838] block">
                  {doc.student.mobileNumber}
                </a>
              </div>
              <div>
                <span className="text-[10.5px] text-slate-500 block">NID / Birth Certificate</span>
                <span className="font-mono text-slate-800 block">
                  {doc.student.nidOrBirthCertificateNumber || '—'}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
              <div>
                <span className="text-[10.5px] text-slate-500 block">Parents' Name</span>
                <span className="font-medium text-slate-800 block">{doc.student.parentName || '—'}</span>
              </div>
              <div>
                <span className="text-[10.5px] text-slate-500 block">Parents' Mobile</span>
                <span className="font-medium text-slate-800 block">{doc.student.parentMobileNumber || '—'}</span>
              </div>
            </div>
            {doc.student.presentAddress && (
              <div className="pt-1 border-t border-slate-100">
                <span className="text-[10.5px] text-slate-500 block">Present Address</span>
                <span className="text-slate-700 block leading-relaxed">{doc.student.presentAddress}</span>
              </div>
            )}
          </div>

          {/* Enrolled Courses Card */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1.5 border-b border-slate-100">
              <GraduationCap className="w-4 h-4 text-[#006838]" />
              <span>Course Categories</span>
            </div>
            <div className="space-y-1.5">
              {[...standardCoursesCol1, ...standardCoursesCol2].map((course) => {
                const checked = isEnrolled(course);
                return (
                  <div
                    key={course}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
                      checked
                        ? 'bg-[#f0fdf4] border-[#006838]/40 text-[#006838] font-bold'
                        : 'bg-slate-50/70 border-slate-100 text-slate-500'
                    }`}
                  >
                    <span>{course}</span>
                    {checked ? (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-black uppercase tracking-wider bg-[#006838] text-white px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3 stroke-[3]" /> Enrolled
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">Available</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Information Card */}
          <div className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 pb-1.5 border-b border-slate-100">
              <Coins className="w-4 h-4 text-[#006838]" />
              <span>Payment Information</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center py-2 px-1 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-[10px] text-slate-500 block font-medium">Advance Paid</span>
                <strong className="text-[#006838] font-bold text-sm block mt-0.5">
                  {formatCurrency(doc.financials.advancePayment || 0)}
                </strong>
              </div>
              <div className="border-l border-slate-200 pl-1">
                <span className="text-[10px] text-slate-500 block font-medium">Due Balance</span>
                <strong className="text-[#D81A22] font-black text-sm block mt-0.5">
                  {formatCurrency(doc.financials.dueAmount ?? (doc.financials.totalPayable - doc.financials.advancePayment))}
                </strong>
              </div>
            </div>
            {doc.financials.amountInWords && (
              <div className="text-[11px] text-slate-600 capitalize pt-1 border-t border-slate-100">
                In Words: <strong className="text-slate-800">{doc.financials.amountInWords}</strong>
              </div>
            )}
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
              className="registration-page relative shrink-0 bg-white shadow-2xl overflow-hidden box-border print:!transform-none print:shadow-none print:m-0 print:border-none"
            >
              {/* Distinctive Diagonal Corner Ribbons on all 4 corners (SVG, bleeding beyond canvas) */}
              <CornerRibbons position="all" />

              {/* Content Flow: Balanced 7-section distribution filling ~95-98% of A4 page */}
              <div className="relative z-10 w-full h-full flex flex-col justify-between px-8 pt-4 pb-3 box-border">
                {/* 1. Header Branding */}
                <div className="text-center">
                  <BrandLogo variant="form-header" showTagline={true} />
                </div>

                {/* 2. Registration Form Title Banner with Flanking Lines */}
                <div className="flex items-center justify-center gap-3">
                  <div className="flex-1 flex flex-col gap-0.5 max-w-[95px]">
                    <div className="h-0.5 bg-[#D81A22]" />
                    <div className="h-1 bg-[#006838]" />
                  </div>

                  <div className="bg-[#006838] text-white px-8 py-1 rounded-full shadow-xs">
                    <h2 className="text-xs sm:text-sm font-black tracking-wider uppercase">
                      Student Registration Form
                    </h2>
                  </div>

                  <div className="flex-1 flex flex-col gap-0.5 max-w-[95px]">
                    <div className="h-0.5 bg-[#D81A22]" />
                    <div className="h-1 bg-[#006838]" />
                  </div>
                </div>

                {/* 3. SECTION 1: Student Information */}
                <div className="relative">
                  <SectionPill icon={<User className="w-3.5 h-3.5" />} title="Student Information" />

                  <div className="border-2 border-[#006838] rounded-xl p-3.5 bg-white/70 space-y-2 text-[11.5px]">
                    {/* Student Name */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <span className="col-span-4 font-bold text-slate-800">Student Name</span>
                      <span className="col-span-1 text-center font-bold">:</span>
                      <div className="col-span-7 border border-[#006838] rounded-md px-3 py-1.5 font-bold text-slate-900 bg-white">
                        {doc.student.fullName}
                      </div>
                    </div>

                    {/* NID / Birth Certificate */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <span className="col-span-4 font-bold text-slate-800">NID / Birth Certificate No.</span>
                      <span className="col-span-1 text-center font-bold">:</span>
                      <div className="col-span-7 border border-[#006838] rounded-md px-3 py-1.5 font-medium text-slate-900 bg-white">
                        {doc.student.nidOrBirthCertificateNumber || '—'}
                      </div>
                    </div>

                    {/* Present Address */}
                    <div className="grid grid-cols-12 items-start gap-2">
                      <span className="col-span-4 font-bold text-slate-800 pt-1.5">Present Address</span>
                      <span className="col-span-1 text-center font-bold pt-1.5">:</span>
                      <div className="col-span-7 border border-[#006838] rounded-md px-3 py-1.5 font-medium text-slate-900 bg-white min-h-[46px] leading-snug">
                        {doc.student.presentAddress}
                      </div>
                    </div>

                    {/* Mobile No. */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <span className="col-span-4 font-bold text-slate-800">Mobile No.</span>
                      <span className="col-span-1 text-center font-bold">:</span>
                      <div className="col-span-7 border border-[#006838] rounded-md px-3 py-1.5 font-bold text-slate-900 bg-white">
                        {doc.student.mobileNumber}
                      </div>
                    </div>

                    {/* Parents' Name */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <span className="col-span-4 font-bold text-slate-800">Parents&apos; Name</span>
                      <span className="col-span-1 text-center font-bold">:</span>
                      <div className="col-span-7 border border-[#006838] rounded-md px-3 py-1.5 font-medium text-slate-900 bg-white">
                        {doc.student.parentName || '—'}
                      </div>
                    </div>

                    {/* Parents' Mobile No. */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <span className="col-span-4 font-bold text-slate-800">Parents&apos; Mobile No.</span>
                      <span className="col-span-1 text-center font-bold">:</span>
                      <div className="col-span-7 border border-[#006838] rounded-md px-3 py-1.5 font-medium text-slate-900 bg-white">
                        {doc.student.parentMobileNumber || '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. SECTION 2: Course Category */}
                <div className="relative">
                  <SectionPill icon={<GraduationCap className="w-3.5 h-3.5" />} title="Course Category" />

                  <div className="border-2 border-[#006838] rounded-xl p-3.5 bg-white/70">
                    <div className="grid grid-cols-2 gap-4 text-[11.5px]">
                      {/* Column 1 */}
                      <div className="space-y-2.5">
                        {standardCoursesCol1.map((course) => {
                          const checked = isEnrolled(course);
                          return (
                            <div key={course} className="flex items-center gap-2.5">
                              <div
                                className={`w-4.5 h-4.5 rounded-md border-2 border-[#006838] flex items-center justify-center shrink-0 ${
                                  checked ? 'bg-[#006838] text-white' : 'bg-white'
                                }`}
                              >
                                {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <span className={`font-semibold ${checked ? 'text-[#006838] font-bold' : 'text-slate-800'}`}>
                                {course}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Column 2 */}
                      <div className="space-y-2.5">
                        {standardCoursesCol2.map((course) => {
                          const checked = isEnrolled(course);
                          return (
                            <div key={course} className="flex items-center gap-2.5">
                              <div
                                className={`w-4.5 h-4.5 rounded-md border-2 border-[#006838] flex items-center justify-center shrink-0 ${
                                  checked ? 'bg-[#006838] text-white' : 'bg-white'
                                }`}
                              >
                                {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <span className={`font-semibold ${checked ? 'text-[#006838] font-bold' : 'text-slate-800'}`}>
                                {course}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. SECTION 3: Payment Information */}
                <div className="relative">
                  <SectionPill icon={<Coins className="w-3.5 h-3.5" />} title="Payment Information" />

                  <div className="border-2 border-[#006838] rounded-xl p-3.5 bg-white/70 space-y-2 text-[11.5px]">
                    {/* Advance Payment */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <span className="col-span-4 font-bold text-slate-800">Advance Payment</span>
                      <span className="col-span-1 text-center font-bold">:</span>
                      <div className="col-span-4 border border-[#006838] rounded-md px-3 py-1.5 font-bold text-slate-900 bg-white">
                        {formatCurrency(doc.financials.advancePayment || 0)}
                      </div>
                    </div>

                    {/* In Words */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <span className="col-span-4 font-bold text-slate-800">In Words</span>
                      <span className="col-span-1 text-center font-bold">:</span>
                      <div className="col-span-7 border border-[#006838] rounded-md px-3 py-1.5 font-bold text-slate-900 bg-white capitalize">
                        {doc.financials.amountInWords || 'Zero Taka Only'}
                      </div>
                    </div>

                    {/* Due */}
                    <div className="grid grid-cols-12 items-center gap-2">
                      <span className="col-span-4 font-bold text-slate-800">Due</span>
                      <span className="col-span-1 text-center font-bold">:</span>
                      <div className="col-span-4 border border-[#006838] rounded-md px-3 py-1.5 font-bold text-[#D81A22] bg-white">
                        {formatCurrency(doc.financials.dueAmount ?? (doc.financials.totalPayable - doc.financials.advancePayment))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. Date & Signatures */}
                <div>
                  {/* Date line */}
                  <div className="flex items-center gap-2 mb-4 text-[11.5px]">
                    <span className="font-bold text-slate-800">Date</span>
                    <span className="font-bold">:</span>
                    <div className="border border-[#006838] rounded-md px-3 py-1 text-slate-900 font-semibold bg-white min-w-[130px]">
                      {formatDate(doc.registrationDate)}
                    </div>
                  </div>

                  {/* Signature Lines */}
                  <div className="grid grid-cols-2 gap-8 text-center pt-4">
                    <div>
                      <div className="border-t-2 border-slate-700 w-44 mx-auto mb-1.5" />
                      <p className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wider">
                        Student Signature
                      </p>
                    </div>

                    <div>
                      <div className="border-t-2 border-slate-700 w-44 mx-auto mb-1.5" />
                      <p className="text-[10.5px] font-bold text-slate-800 uppercase tracking-wider">
                        Authorized Signature
                      </p>
                    </div>
                  </div>
                </div>

                {/* 7. Corporate Footer Banner */}
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
          <button
            onClick={() => window.print()}
            className="flex-1 flex items-center justify-center py-2.5 px-4 rounded-xl bg-[#006838] hover:bg-[#015333] active:scale-98 text-white font-bold text-xs shadow-md transition-all"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print Official Form (A4)
          </button>
        </div>
      </div>
    </div>
  );
}
