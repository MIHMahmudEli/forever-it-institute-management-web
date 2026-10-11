'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, RegistrationDocument } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import BrandLogo from '@/components/ui/BrandLogo';
import CornerRibbons from '@/components/ui/CornerRibbons';
import SectionPill from '@/components/ui/SectionPill';
import CorporateFooterBanner from '@/components/ui/CorporateFooterBanner';
import { Printer, ArrowLeft, User, GraduationCap, Coins, Check } from 'lucide-react';

export default function PrintableRegistrationForm() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [doc, setDoc] = useState<RegistrationDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleBack = () => {
    if (typeof window !== 'undefined') {
      if (window.history.length > 1) {
        router.back();
        setTimeout(() => {
          if (window.location.pathname.includes('/print/registration/')) {
            router.push('/students');
          }
        }, 120);
      } else {
        router.push('/students');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <p className="text-sm font-semibold text-slate-600">Preparing registration document for print...</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
        <div className="bg-white p-6 rounded-xl border border-slate-300 text-center max-w-md shadow-md">
          <p className="text-red-600 font-bold mb-4">{error || 'Registration document not found.'}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-[#006838] hover:bg-[#015333] text-white rounded-lg text-xs font-semibold"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

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

  const enrolledNames = doc.courses.map((c) => c.name.toLowerCase());
  const isEnrolled = (courseName: string) =>
    enrolledNames.some((name) => name.includes(courseName.toLowerCase()) || courseName.toLowerCase().includes(name));

  return (
    <div className="min-h-screen bg-slate-200 py-6 px-4 flex flex-col items-center print:p-0 print:m-0 print:bg-white print:min-h-0 print:block text-black font-sans">
      {/* Floating Toolbar (Hidden when printing) */}
      <div className="no-print w-full max-w-[210mm] mb-4 flex items-center justify-between px-2 sm:px-0">
        <button
          onClick={handleBack}
          className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
          Back to Students
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-600 font-mono bg-white px-2.5 py-1 rounded-md border border-slate-200">
            Reg: {doc.student.registrationNumber}
          </span>
          <button
            onClick={() => window.print()}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-[#006838] hover:bg-[#015333] text-white text-xs font-bold shadow-md transition-colors"
          >
            <Printer className="w-4 h-4 mr-1.5" />
            Print Official Form (A4)
          </button>
        </div>
      </div>

      {/* Printable Sheet Canvas — Fixed Exact A4 Portrait Geometry (210mm x 297mm) */}
      <div className="registration-page relative w-[210mm] h-[297mm] max-h-[297mm] min-h-[297mm] mx-auto bg-white shadow-2xl overflow-hidden box-border print:shadow-none print:m-0 print:border-none">
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

          {/* 7. Corporate Footer Banner (Clean, flanked by bottom ribbons with zero collision) */}
          <div className="w-full max-w-[162mm] mx-auto">
            <CorporateFooterBanner variant="print" />
          </div>
        </div>
      </div>
    </div>
  );
}
