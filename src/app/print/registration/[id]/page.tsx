'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, RegistrationDocument } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Printer, ArrowLeft } from 'lucide-react';

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
        <div className="bg-white p-6 rounded-xl border border-slate-300 text-center max-w-md">
          <p className="text-red-600 font-bold mb-4">{error || 'Registration document not found.'}</p>
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

  const standardCategories = [
    'Basic Office Course',
    'Business Development',
    'Search Engine Optimization (SEO)',
    'Website Development',
    'Software Development',
  ];

  const enrolledCategoryNames = doc.courses.map((c) => c.name.toLowerCase());

  return (
    <div className="min-h-screen bg-slate-100 py-6 print:py-0 print:bg-white text-black font-sans">
      {/* Floating Toolbar (Hidden when printing) */}
      <div className="no-print max-w-[210mm] mx-auto mb-4 flex items-center justify-between px-4">
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
          Print Registration Form (A4)
        </button>
      </div>

      {/* Printable Sheet Canvas — Scaled for A4 Paper */}
      <div className="max-w-[210mm] mx-auto bg-white p-8 sm:p-12 border border-slate-300 print:border-none shadow-lg print:shadow-none min-h-[297mm] flex flex-col justify-between">
        <div>
          {/* Institute Header */}
          <div className="text-center pb-4 border-b-2 border-emerald-900">
            <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-emerald-900 uppercase">
              {doc.institute.name}
            </h1>
            <p className="text-sm font-bold font-bangla text-emerald-800 mt-0.5">
              {doc.institute.tagline}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Professional IT & Business Development Training • Web: {doc.institute.website}
            </p>
            <div className="mt-3 inline-block px-4 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-xs font-bold text-emerald-950 uppercase tracking-widest">
              Student Registration & Admission Form
            </div>
          </div>

          {/* Registration Meta Line */}
          <div className="flex justify-between items-center py-3 border-b border-slate-200 text-xs font-semibold text-slate-800">
            <div>
              <span>Registration No: </span>
              <strong className="font-mono text-sm text-emerald-900 underline">
                {doc.student.registrationNumber}
              </strong>
            </div>
            <div>
              <span>Registration Date: </span>
              <strong className="text-sm">{formatDate(doc.registrationDate)}</strong>
            </div>
          </div>

          {/* SECTION 1: Student Information Table */}
          <div className="mt-5">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 bg-slate-100 px-2 py-1 border-l-4 border-emerald-800">
              1. Student Details (শিক্ষার্থীর তথ্য)
            </h2>

            <table className="w-full text-xs border border-slate-300 border-collapse">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="w-1/3 p-2 bg-slate-50 font-bold text-slate-700 border-r border-slate-300">
                    Student Name (শিক্ষার্থীর নাম)
                  </td>
                  <td className="p-2 font-bold text-slate-900 text-sm">
                    {doc.student.fullName}
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 bg-slate-50 font-bold text-slate-700 border-r border-slate-300">
                    NID / Birth Certificate No. (জাতীয় পরিচয়পত্র / জন্ম সনদ নং)
                  </td>
                  <td className="p-2 font-mono font-semibold text-slate-900">
                    {doc.student.nidOrBirthCertificateNumber}
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 bg-slate-50 font-bold text-slate-700 border-r border-slate-300">
                    Present Address (বর্তমান ঠিকানা)
                  </td>
                  <td className="p-2 text-slate-800">{doc.student.presentAddress}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 bg-slate-50 font-bold text-slate-700 border-r border-slate-300">
                    Mobile No. (মোবাইল নং)
                  </td>
                  <td className="p-2 font-bold text-slate-900">{doc.student.mobileNumber}</td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 bg-slate-50 font-bold text-slate-700 border-r border-slate-300">
                    Parents&apos; / Guardian Name (পিতা / মাতার নাম)
                  </td>
                  <td className="p-2 font-semibold text-slate-800">{doc.student.parentName}</td>
                </tr>
                <tr>
                  <td className="p-2 bg-slate-50 font-bold text-slate-700 border-r border-slate-300">
                    Parents&apos; Mobile No. (অভিভাবকের মোবাইল নং)
                  </td>
                  <td className="p-2 font-semibold text-slate-800">
                    {doc.student.parentMobileNumber}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* SECTION 2: Course Categories Matching the Physical Form */}
          <div className="mt-6">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 bg-slate-100 px-2 py-1 border-l-4 border-emerald-800">
              2. Selected Course Categories (কোর্স বিবরণ)
            </h2>

            <div className="border border-slate-300 rounded-xs p-3 space-y-2">
              {standardCategories.map((cat, idx) => {
                const isSelected = enrolledCategoryNames.some((c) => c.includes(cat.toLowerCase().slice(0, 10)));
                return (
                  <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-none">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-4 h-4 border-2 flex items-center justify-center font-bold text-xs ${
                          isSelected ? 'border-emerald-800 bg-emerald-800 text-white' : 'border-slate-400 bg-white'
                        }`}
                      >
                        {isSelected ? '✓' : ''}
                      </div>
                      <span className={`font-semibold ${isSelected ? 'text-emerald-950 font-bold' : 'text-slate-700'}`}>
                        {cat}
                      </span>
                    </div>

                    {isSelected && (
                      <span className="text-[11px] font-bold text-emerald-900 uppercase">
                        [ Enrolled ]
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Payment & Accounting Details */}
          <div className="mt-6">
            <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2 bg-slate-100 px-2 py-1 border-l-4 border-emerald-800">
              3. Payment Information (পেমেন্ট তথ্য)
            </h2>

            <table className="w-full text-xs border border-slate-300 border-collapse">
              <tbody>
                <tr className="border-b border-slate-300">
                  <td className="w-1/3 p-2 bg-slate-50 font-bold text-slate-700 border-r border-slate-300">
                    Total Course Fee (মোট ফি)
                  </td>
                  <td className="p-2 font-bold text-slate-900">
                    {formatCurrency(doc.financials.totalPayable)}
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 bg-slate-50 font-bold text-slate-700 border-r border-slate-300">
                    Advance Payment (অগ্রিম জমা)
                  </td>
                  <td className="p-2 font-black text-emerald-900 text-sm">
                    {formatCurrency(doc.financials.advancePayment)}
                  </td>
                </tr>
                <tr className="border-b border-slate-300">
                  <td className="p-2 bg-slate-50 font-bold text-slate-700 border-r border-slate-300">
                    Amount in Words (কথায়)
                  </td>
                  <td className="p-2 font-semibold italic text-slate-800">
                    {doc.financials.amountInWords}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 bg-slate-50 font-bold text-slate-700 border-r border-slate-300">
                    Remaining Due (বকেয়া)
                  </td>
                  <td className="p-2 font-bold text-red-700 text-sm">
                    {formatCurrency(doc.financials.dueAmount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 4: Signatures & Declarations Footer */}
        <div className="mt-12 pt-6">
          <div className="grid grid-cols-2 gap-12 text-center text-xs">
            <div>
              <div className="border-t-2 border-slate-800 w-3/4 mx-auto pt-2 font-bold text-slate-900">
                Student Signature
              </div>
              <p className="text-[10px] text-slate-500 font-bangla mt-0.5">শিক্ষার্থীর স্বাক্ষর</p>
            </div>

            <div>
              <div className="border-t-2 border-slate-800 w-3/4 mx-auto pt-2 font-bold text-slate-900">
                Authorized Signature
              </div>
              <p className="text-[10px] text-slate-500 font-bangla mt-0.5">কর্তৃপক্ষের স্বাক্ষর</p>
            </div>
          </div>

          <div className="mt-8 text-center text-[10px] text-slate-400 border-t border-slate-200 pt-2">
            Generated digitally via Forever IT Institute Management System • {doc.institute.website}
          </div>
        </div>
      </div>
    </div>
  );
}
