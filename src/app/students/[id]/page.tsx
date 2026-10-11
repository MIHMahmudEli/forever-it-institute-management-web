'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, Student, PaymentMethod } from '@/lib/api/api-client';
import { formatCurrency, formatDate, numberToWordsBDT } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  User,
  GraduationCap,
  CreditCard,
  Printer,
  PlusCircle,
  ArrowLeft,
  X,
  Phone,
  Home,
  CheckCircle,
} from 'lucide-react';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH' as any);
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentSuccessReceiptId, setPaymentSuccessReceiptId] = useState<string | null>(null);

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const data = await api.students.getOne(id);
      setStudent(data);
      if (data.enrollments && data.enrollments.length > 0) {
        setSelectedEnrollmentId(data.enrollments[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load student details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchStudent();
    }
  }, [id]);

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student || paymentAmount <= 0) return;

    setPaymentSubmitting(true);
    try {
      const res = await api.payments.create({
        studentId: student.id,
        enrollmentId: selectedEnrollmentId || undefined,
        amount: paymentAmount,
        paymentMethod,
        transactionReference: transactionRef || undefined,
        notes: paymentNotes || undefined,
      });

      setPaymentSuccessReceiptId(res.id);
      fetchStudent(); // Refresh data
    } catch (err: any) {
      alert(err.message || 'Failed to record payment.');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Student Details">
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm text-slate-500">Loading student profile...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !student) {
    return (
      <DashboardLayout title="Student Details">
        <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
          <p className="text-red-600 font-bold mb-4">{error || 'Student not found.'}</p>
          <Link
            href="/students"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-slate-800 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
            Back to Directory
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Student: ${student.fullName}`}>
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl font-bold text-slate-900">{student.fullName}</h1>
              <StatusBadge status={student.status} />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Registration Number: <strong className="text-slate-800">{student.registrationNumber}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/print/registration/${student.id}`}
            className="inline-flex items-center px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print Form
          </Link>

          <button
            onClick={() => {
              setPaymentModalOpen(true);
              setPaymentSuccessReceiptId(null);
            }}
            className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
            Record Payment
          </button>
        </div>
      </div>

      {/* Profile & Financial Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-1">
          <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center">
            <User className="w-4 h-4 mr-2 text-emerald-700" />
            Personal & Contact Information
          </h2>

          <div className="space-y-3.5 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">NID / Birth Certificate:</span>
              <span className="font-mono font-semibold text-slate-800">
                {student.nidOrBirthCertificateNumber}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Mobile Number:</span>
              <span className="font-semibold text-slate-800 flex items-center mt-0.5">
                <Phone className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {student.mobileNumber}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Present Address:</span>
              <span className="text-slate-800 flex items-start mt-0.5">
                <Home className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0 mt-0.5" />
                {student.presentAddress}
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <span className="text-slate-400 block font-medium">Parents&apos; Name:</span>
              <span className="font-semibold text-slate-800">{student.parentName}</span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Parents&apos; Mobile:</span>
              <span className="font-semibold text-slate-800">{student.parentMobileNumber}</span>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
              Registered on: {formatDate(student.createdAt)}
            </div>
          </div>
        </div>

        {/* Financial Balance Summary (2 cols) */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center">
              <CreditCard className="w-4 h-4 mr-2 text-emerald-700" />
              Financial Balance Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 block">Total Payable Fee</span>
                <span className="text-2xl font-bold text-slate-900 mt-1 block">
                  {formatCurrency(student.financials?.totalPayable)}
                </span>
                <span className="text-[10px] text-slate-400">Across enrolled courses</span>
              </div>

              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
                <span className="text-xs text-emerald-800 block">Total Paid to Date</span>
                <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                  {formatCurrency(student.financials?.totalPaid)}
                </span>
                <span className="text-[10px] text-emerald-700">Verified receipts</span>
              </div>

              <div className="bg-red-50 p-4 rounded-xl border border-red-200">
                <span className="text-xs text-red-700 block">Outstanding Due</span>
                <span className="text-2xl font-black text-red-600 mt-1 block">
                  {formatCurrency(student.financials?.outstandingDue)}
                </span>
                <span className="text-[10px] text-red-600">Pending settlement</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">
              Outstanding Balance:{' '}
              <strong className="text-slate-900 font-mono">
                {formatCurrency(student.financials?.outstandingDue)}
              </strong>
            </span>
            <button
              onClick={() => {
                setPaymentAmount(student.financials?.outstandingDue || 0);
                setPaymentModalOpen(true);
              }}
              className="px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-semibold"
            >
              Collect Due Amount
            </button>
          </div>
        </div>
      </div>

      {/* Enrolled Courses Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 mb-8">
        <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center">
          <GraduationCap className="w-4 h-4 mr-2 text-blue-700" />
          Enrolled Programs & Fee Snapshots ({student.enrollments?.length || 0})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3">Course Code</th>
                <th className="py-2.5 px-3">Course Name</th>
                <th className="py-2.5 px-3">Duration</th>
                <th className="py-2.5 px-3">Agreed Fee</th>
                <th className="py-2.5 px-3">Discount</th>
                <th className="py-2.5 px-3">Final Fee</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(student.enrollments || []).map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono font-bold text-slate-700">
                    {enrollment.course?.code}
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {enrollment.course?.name}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{enrollment.course?.duration}</td>
                  <td className="py-3 px-3 font-medium text-slate-800">
                    {formatCurrency(enrollment.agreedFee)}
                  </td>
                  <td className="py-3 px-3 text-red-600 font-medium">
                    {enrollment.discount > 0 ? `-${formatCurrency(enrollment.discount)}` : '৳ 0'}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-800">
                    {formatCurrency(enrollment.finalFee)}
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge status={enrollment.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
        <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 mb-4 flex items-center">
          <CreditCard className="w-4 h-4 mr-2 text-emerald-700" />
          Payment Transactions & Receipts ({student.payments?.length || 0})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3">Receipt No</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Method</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Received By</th>
                <th className="py-2.5 px-3 text-right">Receipt Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(!student.payments || student.payments.length === 0) ? (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No payment transactions recorded for this student.
                  </td>
                </tr>
              ) : (
                student.payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-800">
                      {p.receiptNumber}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{formatDate(p.paymentDate)}</td>
                    <td className="py-3 px-3 uppercase font-medium text-slate-700">
                      {p.paymentMethod}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-700">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3 px-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="py-3 px-3 text-slate-500">{p.receivedBy || 'Staff'}</td>
                    <td className="py-3 px-3 text-right">
                      <Link
                        href={`/print/receipt/${p.id}`}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold border border-slate-300"
                      >
                        Print Receipt
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {paymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">Record Student Payment</h3>
              <button
                onClick={() => setPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSuccessReceiptId ? (
              <div className="py-4 text-center space-y-4">
                <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-slate-900 text-base">Payment Recorded Successfully!</h4>
                <p className="text-xs text-slate-500">
                  The student balance has been updated and a unique receipt has been issued.
                </p>
                <div className="pt-2 flex justify-center space-x-3">
                  <Link
                    href={`/print/receipt/${paymentSuccessReceiptId}`}
                    className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-bold text-xs"
                  >
                    Print Receipt Now
                  </Link>
                  <button
                    onClick={() => setPaymentModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Program / Enrollment
                  </label>
                  <select
                    value={selectedEnrollmentId}
                    onChange={(e) => setSelectedEnrollmentId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  >
                    {(student.enrollments || []).map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.course?.name} ({formatCurrency(e.finalFee)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Payment Amount (BDT) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-900 text-sm"
                  />
                  {paymentAmount > 0 && (
                    <p className="text-[11px] text-slate-500 italic mt-1">
                      {numberToWordsBDT(paymentAmount)}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e: any) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  >
                    <option value="CASH">Cash</option>
                    <option value="BKASH">bKash</option>
                    <option value="NAGAD">Nagad</option>
                    <option value="ROCKET">Rocket</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                  </select>
                </div>

                {paymentMethod !== 'CASH' && (
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Transaction ID (TrxID)
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="e.g. 8XA98Y12"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                    />
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Notes / Remarks</label>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="e.g. Second installment"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setPaymentModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={paymentSubmitting || paymentAmount <= 0}
                    className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold disabled:opacity-50"
                  >
                    {paymentSubmitting ? 'Recording...' : 'Submit Payment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
