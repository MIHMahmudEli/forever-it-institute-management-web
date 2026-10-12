'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import SectionPill from '@/components/ui/SectionPill';
import { api, Course, ApiError } from '@/lib/api/api-client';
import { formatCurrency, numberToWordsBDT } from '@/lib/utils';
import {
  User,
  GraduationCap,
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
  Copy,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  X,
} from 'lucide-react';

export default function NewStudentRegistrationPage() {
  // Form and Section Refs for automatic scrolling
  const formRef = useRef<HTMLFormElement | null>(null);
  const errorBannerRef = useRef<HTMLDivElement | null>(null);
  const courseSectionRef = useRef<HTMLDivElement | null>(null);
  const paymentSectionRef = useRef<HTMLDivElement | null>(null);

  // Course catalog from API
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [nidOrBirthCertificateNumber, setNidOrBirthCertificateNumber] = useState('');
  const [presentAddress, setPresentAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentMobileNumber, setParentMobileNumber] = useState('');
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  // Course Selections
  const [selectedCourses, setSelectedCourses] = useState<
    Array<{
      courseId: string;
      agreedFee: number;
      discount: number;
      discountPercent: number | string;
    }>
  >([]);

  // Payment State
  const [advancePayment, setAdvancePayment] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'BKASH' | 'NAGAD' | 'ROCKET' | 'BANK_TRANSFER'>(
    'CASH'
  );
  const [transactionReference, setTransactionReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [registrationDate, setRegistrationDate] = useState('');

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<any | null>(null);
  const [successModalOpen, setSuccessModalOpen] = useState(false);

  // Load active courses from API
  useEffect(() => {
    setRegistrationDate(new Date().toISOString().split('T')[0]);
    async function loadCourses() {
      try {
        const data = await api.courses.getAll('ACTIVE');
        setCourses(data);
      } catch (err: any) {
        setErrorMessage('Failed to load courses from catalog.');
      } finally {
        setCoursesLoading(false);
      }
    }
    loadCourses();
  }, []);

  // Course toggle handler
  const handleToggleCourse = (course: Course) => {
    setSelectedCourses((prev) => {
      const exists = prev.find((c) => c.courseId === course.id);
      if (exists) {
        return prev.filter((c) => c.courseId !== course.id);
      } else {
        return [
          ...prev,
          {
            courseId: course.id,
            agreedFee: Number(course.totalFee),
            discount: 0,
            discountPercent: '',
          },
        ];
      }
    });
  };

  const isPercentInvalid = (percentVal: number | string | undefined): boolean => {
    if (percentVal === undefined || percentVal === '') return false;
    const p = typeof percentVal === 'number' ? percentVal : parseFloat(percentVal);
    if (isNaN(p)) return false;
    return p >= 100 || p < 0;
  };

  const handleUpdateCourseDiscountPercent = (courseId: string, rawValue: string) => {
    setSelectedCourses((prev) =>
      prev.map((c) => {
        if (c.courseId !== courseId) return c;
        if (rawValue.trim() === '') {
          return { ...c, discountPercent: '', discount: 0 };
        }
        const percent = parseFloat(rawValue);
        if (isNaN(percent)) {
          return { ...c, discountPercent: rawValue, discount: 0 };
        }
        const discountBDT = Math.max(0, Math.round((c.agreedFee * percent) / 100));
        return {
          ...c,
          discountPercent: rawValue,
          discount: discountBDT,
        };
      })
    );
  };

  // Live Financial Calculations
  const totalCourseFee = selectedCourses.reduce((sum, c) => sum + c.agreedFee, 0);
  const totalDiscount = selectedCourses.reduce((sum, c) => sum + c.discount, 0);
  const totalPayable = Math.max(0, totalCourseFee - totalDiscount);
  const hasInvalidDiscount = selectedCourses.some((c) => isPercentInvalid(c.discountPercent));
  const isAdvanceOverpaying = !hasInvalidDiscount && (advancePayment || 0) > totalPayable;
  const outstandingDue = Math.max(0, totalPayable - (advancePayment || 0));
  const amountInWords = numberToWordsBDT(advancePayment || 0);

  // Submission Handler
  const scrollToElement = (target?: HTMLElement | null) => {
    setTimeout(() => {
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (errorBannerRef.current) {
        errorBannerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 50);
  };

  const handleRegisterAnother = () => {
    setSuccessModalOpen(false);
    setSuccessData(null);
    setErrorMessage(null);
    setFullName('');
    setEmail('');
    setNidOrBirthCertificateNumber('');
    setPresentAddress('');
    setMobileNumber('');
    setParentName('');
    setParentMobileNumber('');
    setSelectedCourses([]);
    setAdvancePayment(0);
    setTransactionReference('');
    setPaymentNotes('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedCourses.length === 0) {
      const msg = 'Please select at least one course for registration.';
      setErrorMessage(msg);
      scrollToElement(courseSectionRef.current);
      return;
    }

    if (hasInvalidDiscount) {
      const msg =
        'Course discount percentage cannot reach or exceed 100%. Please ensure discount is less than 100%.';
      setErrorMessage(msg);
      scrollToElement(courseSectionRef.current);
      return;
    }

    if (isAdvanceOverpaying) {
      const msg = `Advance payment (${formatCurrency(advancePayment)}) cannot exceed the total payable fee (${formatCurrency(totalPayable)}). Registration cannot be submitted.`;
      setErrorMessage(msg);
      scrollToElement(paymentSectionRef.current);
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        fullName,
        email: email.trim() || undefined,
        nidOrBirthCertificateNumber,
        presentAddress,
        mobileNumber,
        parentName,
        parentMobileNumber,
        courses: selectedCourses.map((c) => ({
          courseId: c.courseId,
          agreedFee: c.agreedFee,
          discount: c.discount,
        })),
        advancePayment: advancePayment || 0,
        paymentMethod,
        transactionReference: transactionReference || undefined,
        registrationDate,
        notes: paymentNotes || undefined,
      };

      const result = await api.registrations.register(payload);
      setSuccessData(result);
      setSuccessModalOpen(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to submit registration. Please verify details.');
      }
      scrollToElement(errorBannerRef.current);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Student Registration">
      {/* Top Breadcrumb & Heading */}
      <div className="pb-6 border-b border-slate-200 mb-6">
        <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
          <Link href="/students" className="hover:text-emerald-700">
            Students
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-medium">New Registration</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Student Registration Form
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              FOREVER IT INSTITUTE — ভর্তি ও কোর্স নিবন্ধন ফর্ম (Registration & Enrollment Form)
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold font-bangla">
              দক্ষতা গড়ুন, গড়ুন সফল ভবিষ্যৎ
            </span>
          </div>
        </div>
      </div>

      {/* Success Modal / Banner */}
      {successData && (
        <div className="mb-8 p-6 rounded-2xl bg-emerald-50 border-2 border-emerald-500 shadow-lg text-emerald-950">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-200">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-emerald-900">
                  Student Registration Successfully Completed!
                </h3>
                <p className="text-xs text-emerald-700">
                  Registration Number:{' '}
                  <span className="font-mono font-bold text-emerald-950 text-sm">
                    {successData.registrationNumber}
                  </span>{' '}
                  • Student: <span className="font-semibold">{successData.student?.fullName}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href={`/print/registration/${successData.student?.id}`}
                className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print Registration Form
              </Link>

              {successData.payment && (
                <Link
                  href={`/print/receipt/${successData.payment?.id}`}
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-white border border-emerald-600 text-emerald-800 hover:bg-emerald-100 text-xs font-bold shadow-sm transition-all"
                >
                  <FileText className="w-4 h-4 mr-1.5" />
                  Print Money Receipt
                </Link>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="bg-white p-3 rounded-lg border border-emerald-200">
              <span className="text-slate-500 block">Total Payable:</span>
              <span className="font-bold text-slate-900 text-sm">
                {formatCurrency(successData.financials?.totalPayable)}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-200">
              <span className="text-slate-500 block">Advance Paid:</span>
              <span className="font-bold text-emerald-700 text-sm">
                {formatCurrency(successData.financials?.advancePaid)}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-200">
              <span className="text-slate-500 block">Remaining Due:</span>
              <span className="font-bold text-red-600 text-sm">
                {formatCurrency(successData.financials?.outstandingDue)}
              </span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-200">
              <span className="text-slate-500 block">Enrolled Courses:</span>
              <span className="font-bold text-slate-800 text-sm">
                {successData.enrollments?.length || 0} Programs
              </span>
            </div>
          </div>

          {/* Automatically Generated Student Login Credentials */}
          {successData.studentCredentials && (
            <div className="mt-5 p-4 rounded-xl bg-white border-2 border-emerald-600 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <KeyRound className="w-4 h-4 text-emerald-700" />
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    Student Portal Login Credentials (Handover Slip)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const text = `Forever IT Institute — Student Portal Login\nStudent: ${successData.studentCredentials?.fullName}\nRegistration No: ${successData.studentCredentials?.registrationNumber}\nUsername / Login ID: ${successData.studentCredentials?.username}\nEmail: ${successData.studentCredentials?.email}\nTemporary Password: ${successData.studentCredentials?.temporaryPassword}\nLogin Portal: ${window.location.origin}/login\n(Note: You will be asked to change password on first login)`;
                    navigator.clipboard.writeText(text);
                    setCopiedCredentials(true);
                    setTimeout(() => setCopiedCredentials(false), 2000);
                  }}
                  className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  {copiedCredentials ? 'Copied to Clipboard!' : 'Copy Credentials'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Username / Reg No</span>
                  <span className="font-mono font-bold text-slate-900">{successData.studentCredentials.username}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Account Email</span>
                  <span className="text-slate-800 font-medium truncate block">{successData.studentCredentials.email}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300">
                  <span className="text-emerald-700 block text-[10px] uppercase font-bold">Temporary Password</span>
                  <span className="font-mono font-black text-emerald-900 text-sm tracking-wider">
                    {successData.studentCredentials.temporaryPassword}
                  </span>
                </div>
              </div>

              <p className="mt-2.5 text-[11px] text-slate-500 italic">
                * Please provide these login details to the student. They can log in using either their Registration Number or Email. They will be prompted to set their permanent password on first login.
              </p>
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleRegisterAnother}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
            >
              Register Another Student
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div ref={errorBannerRef} className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start space-x-3 text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Registration Form */}
      <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION A: STUDENT INFORMATION */}
        <div className="bg-white rounded-2xl border-2 border-[#006838]/80 p-6 shadow-sm">
          <SectionPill icon={<User className="w-4 h-4" />} title="Student Information" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Student Name (শিক্ষার্থীর নাম) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Md. Mahmudul Hasan"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* NID / Birth Certificate No. */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                NID / Birth Certificate No. (জাতীয় পরিচয়পত্র / জন্ম সনদ নং){' '}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={nidOrBirthCertificateNumber}
                onChange={(e) => setNidOrBirthCertificateNumber(e.target.value)}
                placeholder="e.g. 19982691234567890"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Student Mobile No. */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mobile No. (মোবাইল নং) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="e.g. 01712345678"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Student Email Address (Optional) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address (ইমেইল - Optional for Portal Login)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. student@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Present Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Present Address (বর্তমান ঠিকানা) <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={presentAddress}
                onChange={(e) => setPresentAddress(e.target.value)}
                placeholder="e.g. House 12, Road 4, Sector 7, Uttara, Dhaka"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Parents' Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Parents&apos; / Guardian Name (পিতা / মাতার নাম) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="e.g. Md. Rafiqul Islam"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Parents' Mobile No. */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Parents&apos; Mobile No. (অভিভাবকের মোবাইল নং) <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={parentMobileNumber}
                onChange={(e) => setParentMobileNumber(e.target.value)}
                placeholder="e.g. 01812345678"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* SECTION B: COURSE CATEGORY */}
        <div ref={courseSectionRef} className="bg-white rounded-2xl border-2 border-[#006838]/80 p-6 shadow-sm">
          <SectionPill icon={<GraduationCap className="w-4 h-4" />} title="Course Category" />

          {coursesLoading ? (
            <p className="text-sm text-slate-500 py-4">Loading course catalog...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => {
                const selected = selectedCourses.find((c) => c.courseId === course.id);
                return (
                  <div
                    key={course.id}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                    onClick={() => handleToggleCourse(course)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={!!selected}
                          onChange={() => {}} // Handled by parent div click
                          className="w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{course.name}</p>
                          <p className="text-[11px] text-slate-500">
                            Code: <span className="font-mono">{course.code}</span> • Duration:{' '}
                            {course.duration}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-800 text-sm">
                        {formatCurrency(course.totalFee)}
                      </span>
                    </div>

                    {/* Discount input if selected */}
                    {selected && (
                      <div
                        className="mt-3 pt-3 border-t border-emerald-200/80 space-y-2 text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-600 font-medium">Discounts / Concession (%):</span>
                          <div className="flex items-center space-x-2">
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="99.99"
                                step="any"
                                value={selected.discountPercent}
                                onChange={(e) =>
                                  handleUpdateCourseDiscountPercent(course.id, e.target.value)
                                }
                                placeholder="0"
                                className={`w-20 pl-2 pr-6 py-1 rounded-md border text-right text-xs font-bold transition-all focus:outline-hidden ${
                                  isPercentInvalid(selected.discountPercent)
                                    ? 'border-red-400 bg-red-50 text-red-700 focus:ring-2 focus:ring-red-400'
                                    : 'border-slate-300 bg-white text-slate-800 focus:ring-2 focus:ring-emerald-600'
                                }`}
                              />
                              <span className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 font-bold pointer-events-none text-xs">
                                %
                              </span>
                            </div>
                            <div className="text-right min-w-[76px]">
                              <span className="text-[11px] font-bold text-emerald-800">
                                {selected.discount > 0 ? `-${formatCurrency(selected.discount)}` : '৳ 0'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Live calculated fee hint */}
                        {selected.discount > 0 && !isPercentInvalid(selected.discountPercent) && (
                          <div className="flex items-center justify-between text-[11px] text-slate-600 bg-emerald-100/60 px-2.5 py-1 rounded border border-emerald-200/60">
                            <span>Effective Course Fee:</span>
                            <span className="font-bold text-emerald-900">
                              {formatCurrency(Math.max(0, course.totalFee - selected.discount))}
                            </span>
                          </div>
                        )}

                        {/* Percentage warning message if >= 100% or < 0 */}
                        {isPercentInvalid(selected.discountPercent) && (
                          <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start space-x-1.5 text-[11px]">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                            <span className="font-semibold leading-tight">
                              Discount percentage cannot reach or exceed 100% ({selected.discountPercent}% entered). Must be less than 100%.
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Subtotal summary for selected courses */}
          {selectedCourses.length > 0 && (
            <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
              <span className="text-slate-600">
                Selected: <strong className="text-slate-900">{selectedCourses.length}</strong>{' '}
                Course(s)
              </span>
              <div className="flex items-center space-x-6">
                <div>
                  <span className="text-slate-500">Total Fee: </span>
                  <span className="font-semibold text-slate-800">
                    {formatCurrency(totalCourseFee)}
                  </span>
                </div>
                {totalDiscount > 0 && (
                  <div>
                    <span className="text-slate-500">Total Discount: </span>
                    <span className="font-semibold text-red-600">
                      -{formatCurrency(totalDiscount)}
                    </span>
                  </div>
                )}
                <div className="text-sm font-bold text-emerald-800">
                  <span>Net Payable: </span>
                  <span>{formatCurrency(totalPayable)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* SECTION C: PAYMENT INFORMATION */}
        <div ref={paymentSectionRef} className="bg-white rounded-2xl border-2 border-[#006838]/80 p-6 shadow-sm">
          <SectionPill icon={<CreditCard className="w-4 h-4" />} title="Payment Information" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Advance Payment Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Advance Payment (অগ্রিম জমা - BDT)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-semibold select-none">
                  ৳
                </span>
                <input
                  type="number"
                  min="0"
                  max={totalPayable}
                  value={advancePayment || ''}
                  onChange={(e) => setAdvancePayment(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className={`w-full pl-8 pr-24 py-2.5 rounded-lg border text-sm font-bold focus:outline-hidden transition-colors ${
                    isAdvanceOverpaying
                      ? 'border-amber-500 bg-amber-50/50 text-amber-900 focus:ring-2 focus:ring-amber-500'
                      : 'border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-600'
                  }`}
                />
                {totalPayable > 0 && (
                  <button
                    type="button"
                    onClick={() => setAdvancePayment(totalPayable)}
                    className="absolute inset-y-1.5 right-1.5 px-2.5 flex items-center rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200/80 transition-colors shadow-2xs cursor-pointer select-none"
                    title={`Fill full payable amount: ${formatCurrency(totalPayable)}`}
                  >
                    Pay Full
                  </button>
                )}
              </div>

              {/* Sub-label showing Net Payable fee and full settlement status */}
              <div className="flex items-center justify-between text-[11px] mt-1.5 px-0.5 text-slate-500">
                <span>
                  Net Payable: <strong className="text-slate-800 font-semibold">{formatCurrency(totalPayable)}</strong>
                </span>
                {totalPayable > 0 && advancePayment === totalPayable && (
                  <span className="text-emerald-700 font-semibold flex items-center">
                    ✓ Full Fee Settled
                  </span>
                )}
              </div>

              {/* Warning when Advance Payment > Total Payable Fee */}
              {isAdvanceOverpaying && (
                <div className="mt-2 p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-start space-x-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold">Overpayment Warning</p>
                    <p className="mt-0.5 text-amber-800">
                      Advance payment ({formatCurrency(advancePayment)}) cannot exceed total payable fee ({formatCurrency(totalPayable)}).
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Payment Method (মাধ্যম)
              </label>
              <select
                value={paymentMethod}
                onChange={(e: any) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              >
                <option value="CASH">Cash (নগদ)</option>
                <option value="BKASH">bKash (বিকাশ)</option>
                <option value="NAGAD">Nagad (নগদ)</option>
                <option value="ROCKET">Rocket (রকেট)</option>
                <option value="BANK_TRANSFER">Bank Transfer (ব্যাংক)</option>
              </select>
            </div>

            {/* Registration / Payment Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registration Date (তারিখ)
              </label>
              <input
                type="date"
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Transaction Reference (if mobile banking/bank) */}
            {paymentMethod !== 'CASH' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Transaction Reference (TrxID)
                </label>
                <input
                  type="text"
                  value={transactionReference}
                  onChange={(e) => setTransactionReference(e.target.value)}
                  placeholder="e.g. BK9X87Y21A"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            )}

            {/* Remaining Due Box */}
            <div className={`p-4 rounded-xl border ${
              isAdvanceOverpaying ? 'bg-amber-50 border-amber-300' : 'bg-red-50 border-red-200'
            }`}>
              <span className={`text-xs font-medium block ${
                isAdvanceOverpaying ? 'text-amber-800' : 'text-red-700'
              }`}>
                Remaining Due (বকেয়া):
              </span>
              <span className={`text-xl font-black ${
                isAdvanceOverpaying ? 'text-amber-700' : 'text-red-600'
              }`}>
                {formatCurrency(outstandingDue)}
              </span>
              {isAdvanceOverpaying && (
                <span className="text-[10px] text-amber-700 font-semibold block mt-1">
                  ⚠️ Advance exceeds payable fee
                </span>
              )}
            </div>

            {/* Amount in Words Box */}
            <div className="sm:col-span-2 lg:col-span-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 block mb-1">
                Amount in Words (কথায়):
              </span>
              <p className="text-sm font-bold text-slate-800 italic">
                {amountInWords}
              </p>
            </div>
          </div>
        </div>

        {/* Overpayment Warning banner before action buttons */}
        {isAdvanceOverpaying && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 flex items-center space-x-2.5 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              Registration submission disabled: Advance payment of {formatCurrency(advancePayment)} exceeds total payable fee of {formatCurrency(totalPayable)}. Total paid cannot exceed total course fee.
            </span>
          </div>
        )}

        {/* Invalid Discount Warning banner before action buttons */}
        {hasInvalidDiscount && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-300 text-red-900 flex items-center space-x-2.5 text-xs">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-semibold">
              Registration submission disabled: Course discount percentage cannot reach or exceed 100%. All discounts must be less than 100%.
            </span>
          </div>
        )}

        {/* Error message banner before action buttons */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-900 flex items-start space-x-3 text-xs animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Registration Cannot Be Submitted</p>
              <p className="text-red-800 mt-0.5 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-4 border-t border-slate-200">
          <Link
            href="/students"
            className="w-full sm:w-auto text-center px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            onClick={() => {
              if (formRef.current && !formRef.current.checkValidity()) {
                const firstInvalid = formRef.current.querySelector(':invalid') as HTMLElement;
                if (firstInvalid) {
                  firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  firstInvalid.focus();
                }
              }
            }}
            disabled={submitting || selectedCourses.length === 0 || isAdvanceOverpaying || hasInvalidDiscount}
            title={
              hasInvalidDiscount
                ? 'Course discount percentage cannot reach or exceed 100%. Submission is disabled.'
                : isAdvanceOverpaying
                ? `Advance payment (${formatCurrency(advancePayment)}) cannot exceed total payable fee (${formatCurrency(totalPayable)}). Submission is disabled.`
                : selectedCourses.length === 0
                ? 'Please select at least one course'
                : 'Complete Registration & Generate Receipt'
            }
            className={`w-full sm:w-auto px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center ${
              submitting || selectedCourses.length === 0 || isAdvanceOverpaying || hasInvalidDiscount
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                : 'bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white shadow-md shadow-emerald-900/30 cursor-pointer'
            }`}
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Complete Registration & Generate Receipt</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Success Modal Popup */}
      {successModalOpen && successData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-4 sm:p-7 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setSuccessModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Close Popup"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 pr-8">
              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">
                    Student Registration Successfully Completed!
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Registration Number:{' '}
                    <span className="font-mono font-bold text-emerald-800 text-sm">
                      {successData.registrationNumber}
                    </span>{' '}
                    • Student: <strong className="text-slate-900">{successData.student?.fullName}</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Print Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-4">
              <Link
                href={`/print/registration/${successData.student?.id}`}
                target="_blank"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4 mr-1.5" />
                Print Registration Form
              </Link>

              {successData.payment && (
                <Link
                  href={`/print/receipt/${successData.payment?.id}`}
                  target="_blank"
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-emerald-600 text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow-xs transition-colors"
                >
                  <FileText className="w-4 h-4 mr-1.5" />
                  Print Money Receipt
                </Link>
              )}
            </div>

            {/* Financial Summary Grid */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Payable</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {formatCurrency(successData.financials?.totalPayable)}
                </span>
              </div>
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-200">
                <span className="text-emerald-700 block text-[10px] uppercase font-semibold">Advance Paid</span>
                <span className="font-bold text-emerald-800 text-sm mt-0.5 block">
                  {formatCurrency(successData.financials?.advancePaid)}
                </span>
              </div>
              <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                <span className="text-amber-700 block text-[10px] uppercase font-semibold">Remaining Due</span>
                <span className="font-bold text-red-600 text-sm mt-0.5 block">
                  {formatCurrency(successData.financials?.outstandingDue)}
                </span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Enrolled Courses</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">
                  {successData.enrollments?.length || 0} Programs
                </span>
              </div>
            </div>

            {/* Student Portal Login Credentials (Handover Slip) */}
            {successData.studentCredentials && (
              <div className="mt-5 p-4 rounded-xl bg-slate-50/80 border-2 border-emerald-600/70 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-200">
                  <div className="flex items-center space-x-2">
                    <KeyRound className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Student Portal Login Credentials (Handover Slip)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Forever IT Institute — Student Portal Login\nStudent: ${successData.studentCredentials?.fullName}\nRegistration No: ${successData.studentCredentials?.registrationNumber}\nUsername / Login ID: ${successData.studentCredentials?.username}\nEmail: ${successData.studentCredentials?.email}\nTemporary Password: ${successData.studentCredentials?.temporaryPassword}\nLogin Portal: ${window.location.origin}/login\n(Note: You will be asked to change password on first login)`;
                      navigator.clipboard.writeText(text);
                      setCopiedCredentials(true);
                      setTimeout(() => setCopiedCredentials(false), 2000);
                    }}
                    className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 transition-colors cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    {copiedCredentials ? 'Copied to Clipboard!' : 'Copy Credentials'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Username / Reg No</span>
                    <span className="font-mono font-bold text-slate-900">{successData.studentCredentials.username}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Account Email</span>
                    <span className="text-slate-800 font-medium truncate block">{successData.studentCredentials.email}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300">
                    <span className="text-emerald-700 block text-[10px] uppercase font-bold">Temporary Password</span>
                    <span className="font-mono font-black text-emerald-900 text-sm tracking-wider">
                      {successData.studentCredentials.temporaryPassword}
                    </span>
                  </div>
                </div>

                <p className="mt-2.5 text-[11px] text-slate-500 italic">
                  * Please provide these login details to the student. They can log in using either their Registration Number or Email. They will be prompted to set their permanent password on first login.
                </p>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRegisterAnother}
                className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
              >
                Register Another Student
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSuccessModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
                <Link
                  href={`/students/${successData.student?.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition-colors"
                >
                  View Student Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
