'use client';

import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';

export default function NewStudentRegistrationPage() {

  // Course catalog from API
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Form State
  const [fullName, setFullName] = useState('');
  const [nidOrBirthCertificateNumber, setNidOrBirthCertificateNumber] = useState('');
  const [presentAddress, setPresentAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentMobileNumber, setParentMobileNumber] = useState('');

  // Course Selections
  const [selectedCourses, setSelectedCourses] = useState<
    Array<{ courseId: string; agreedFee: number; discount: number }>
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
        return [...prev, { courseId: course.id, agreedFee: Number(course.totalFee), discount: 0 }];
      }
    });
  };

  const handleUpdateCourseDiscount = (courseId: string, discount: number) => {
    setSelectedCourses((prev) =>
      prev.map((c) => (c.courseId === courseId ? { ...c, discount: Math.max(0, discount) } : c))
    );
  };

  // Live Financial Calculations
  const totalCourseFee = selectedCourses.reduce((sum, c) => sum + c.agreedFee, 0);
  const totalDiscount = selectedCourses.reduce((sum, c) => sum + c.discount, 0);
  const totalPayable = Math.max(0, totalCourseFee - totalDiscount);
  const outstandingDue = Math.max(0, totalPayable - (advancePayment || 0));
  const amountInWords = numberToWordsBDT(advancePayment || 0);

  // Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedCourses.length === 0) {
      setErrorMessage('Please select at least one course for registration.');
      return;
    }

    if (advancePayment > totalPayable) {
      setErrorMessage('Advance payment cannot exceed the total payable amount.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        fullName,
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
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to submit registration. Please verify details.');
      }
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

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                setSuccessData(null);
                // Reset form
                setFullName('');
                setNidOrBirthCertificateNumber('');
                setPresentAddress('');
                setMobileNumber('');
                setParentName('');
                setParentMobileNumber('');
                setSelectedCourses([]);
                setAdvancePayment(0);
                setTransactionReference('');
                setPaymentNotes('');
              }}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 underline"
            >
              Register Another Student
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-start space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
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
        <div className="bg-white rounded-2xl border-2 border-[#006838]/80 p-6 shadow-sm">
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
                        className="mt-3 pt-3 border-t border-emerald-200/80 flex items-center justify-between text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-slate-600">Discounts / Concession:</span>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-500">৳</span>
                          <input
                            type="number"
                            min="0"
                            max={course.totalFee}
                            value={selected.discount}
                            onChange={(e) =>
                              handleUpdateCourseDiscount(course.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-24 px-2 py-1 rounded border border-slate-300 text-right text-xs focus:ring-1 focus:ring-emerald-600 font-semibold"
                          />
                        </div>
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
        <div className="bg-white rounded-2xl border-2 border-[#006838]/80 p-6 shadow-sm">
          <SectionPill icon={<CreditCard className="w-4 h-4" />} title="Payment Information" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Advance Payment Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Advance Payment (অগ্রিম জমা - BDT)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 font-semibold">
                  ৳
                </span>
                <input
                  type="number"
                  min="0"
                  max={totalPayable}
                  value={advancePayment}
                  onChange={(e) => setAdvancePayment(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
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
            <div className="bg-red-50 p-4 rounded-xl border border-red-200">
              <span className="text-xs font-medium text-red-700 block">Remaining Due (বকেয়া):</span>
              <span className="text-xl font-black text-red-600">
                {formatCurrency(outstandingDue)}
              </span>
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

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-4 border-t border-slate-200">
          <Link
            href="/students"
            className="px-5 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting || selectedCourses.length === 0}
            className="px-6 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-sm font-bold shadow-md shadow-emerald-900/30 transition-all flex items-center disabled:opacity-50"
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
    </DashboardLayout>
  );
}
