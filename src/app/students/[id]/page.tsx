'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, Student, Payment, PaymentMethod } from '@/lib/api/api-client';
import { formatCurrency, formatDate, numberToWordsBDT } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { StudentDetailsSkeleton } from '@/components/ui/skeletons';
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
  Copy,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';
import ReversalDetailsModal from '@/components/ui/ReversalDetailsModal';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Reversal Details Modal State
  const [reversalDetailsModalOpen, setReversalDetailsModalOpen] = useState(false);
  const [selectedReversalPayment, setSelectedReversalPayment] = useState<Payment | null>(null);

  // New Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH' as any);
  const [transactionRef, setTransactionRef] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentSuccessReceiptId, setPaymentSuccessReceiptId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Provision Account Modal State
  const [provisionModalOpen, setProvisionModalOpen] = useState(false);
  const [provisionEmail, setProvisionEmail] = useState('');
  const [provisioning, setProvisioning] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);
  const [generatedCredentials, setGeneratedCredentials] = useState<any | null>(null);
  const [copiedCreds, setCopiedCreds] = useState(false);

  // Regenerate Credentials State
  const [regenerateModalOpen, setRegenerateModalOpen] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [regenerateError, setRegenerateError] = useState<string | null>(null);

  const getEnrollmentBalance = (enrollmentId: string) => {
    if (!student) return { paid: 0, finalFee: 0, due: 0, status: 'ACTIVE', courseName: '' };
    const enrollment = student.enrollments?.find((e) => e.id === enrollmentId);
    if (!enrollment) return { paid: 0, finalFee: 0, due: 0, status: 'ACTIVE', courseName: '' };

    const finalFee = Number(enrollment.finalFee || 0);
    const paid = (student.payments || [])
      .filter((p) => p.enrollmentId === enrollment.id && p.status === 'COMPLETED')
      .reduce((sum, p) => sum + Number(p.amount), 0);
    const due =
      enrollment.status === 'DROPPED' || enrollment.status === 'CANCELLED'
        ? 0
        : Math.max(0, finalFee - paid);

    return {
      paid,
      finalFee,
      due,
      status: enrollment.status,
      courseName: enrollment.course?.name || 'Course',
    };
  };

  const totalPayable = student?.financials?.totalPayable ?? 0;
  const totalPaid = student?.financials?.totalPaid ?? 0;
  const outstandingDue = student?.financials?.outstandingDue ?? 0;
  const isFullyPaid =
    !student ||
    (student.enrollments?.length ?? 0) === 0 ||
    outstandingDue <= 0 ||
    (totalPayable > 0 && totalPaid >= totalPayable);

  const selectedEnrollmentBalance = selectedEnrollmentId
    ? getEnrollmentBalance(selectedEnrollmentId)
    : null;

  const maxAllowedPayment = selectedEnrollmentBalance
    ? Math.min(selectedEnrollmentBalance.due, outstandingDue)
    : outstandingDue;

  const isOverpaying = paymentAmount > maxAllowedPayment;

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const data = await api.students.getOne(id);
      setStudent(data);
      if (data.enrollments && data.enrollments.length > 0) {
        // Find first enrollment with due balance if any
        const firstWithDue = data.enrollments.find((e) => {
          const paid = (data.payments || [])
            .filter((p: any) => p.enrollmentId === e.id && p.status === 'COMPLETED')
            .reduce((s: number, p: any) => s + Number(p.amount), 0);
          return Number(e.finalFee) - paid > 0 && e.status !== 'DROPPED' && e.status !== 'CANCELLED';
        });
        setSelectedEnrollmentId(firstWithDue ? firstWithDue.id : data.enrollments[0].id);
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

    if (isOverpaying) {
      setPaymentError(
        `Payment amount (${formatCurrency(paymentAmount)}) exceeds maximum remaining due (${formatCurrency(maxAllowedPayment)}). Total Paid to Date cannot exceed Total Payable Fee.`
      );
      return;
    }

    if (maxAllowedPayment <= 0) {
      setPaymentError('The selected course has no outstanding balance remaining.');
      return;
    }

    setPaymentSubmitting(true);
    setPaymentError(null);
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
      setPaymentError(err.message || 'Failed to record payment.');
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const handleProvisionAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setProvisioning(true);
    setProvisionError(null);
    try {
      const res = await api.students.provisionAccount(student.id, provisionEmail.trim() || undefined);
      setGeneratedCredentials(res.studentCredentials);
      fetchStudent();
    } catch (err: any) {
      setProvisionError(err.message || 'Failed to provision portal account.');
    } finally {
      setProvisioning(false);
    }
  };

  const handleRegenerateCredentials = async () => {
    if (!student) return;

    setRegenerating(true);
    setRegenerateError(null);
    try {
      const res = await api.students.regenerateCredentials(student.id);
      setGeneratedCredentials(res.studentCredentials);
      setRegenerateModalOpen(false);
      setProvisionModalOpen(true);
      fetchStudent();
    } catch (err: any) {
      setRegenerateError(err.message || 'Failed to regenerate credentials.');
    } finally {
      setRegenerating(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Student Details">
        <StudentDetailsSkeleton />
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
          {student.user ? (
            <button
              onClick={() => {
                setRegenerateModalOpen(true);
                setRegenerateError(null);
              }}
              className="inline-flex items-center px-3.5 py-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Regenerate temporary credentials for forgotten password"
            >
              <KeyRound className="w-3.5 h-3.5 mr-1.5 text-amber-700" />
              Reset Credentials
            </button>
          ) : (
            <button
              onClick={() => {
                setProvisionModalOpen(true);
                setGeneratedCredentials(null);
                setProvisionError(null);
                setProvisionEmail('');
              }}
              className="inline-flex items-center px-3.5 py-2 rounded-lg bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-smooth cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 mr-1.5" />
              Create Portal Account
            </button>
          )}

          <Link
            href={`/print/registration/${student.id}`}
            className="inline-flex items-center px-3.5 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 mr-1.5" />
            Print Form
          </Link>

          <button
            onClick={() => {
              if (isFullyPaid) return;
              setPaymentError(null);
              setPaymentSuccessReceiptId(null);
              const currentBal = selectedEnrollmentId ? getEnrollmentBalance(selectedEnrollmentId) : null;
              if (!currentBal || currentBal.due <= 0) {
                const firstWithDue = student.enrollments?.find((e) => getEnrollmentBalance(e.id).due > 0);
                if (firstWithDue) {
                  setSelectedEnrollmentId(firstWithDue.id);
                  setPaymentAmount(Math.min(getEnrollmentBalance(firstWithDue.id).due, outstandingDue));
                } else {
                  setPaymentAmount(0);
                }
              }
              setPaymentModalOpen(true);
            }}
            disabled={isFullyPaid}
            title={
              isFullyPaid
                ? 'Total Payable Fee and Total Paid to Date are equal. No outstanding due to collect.'
                : 'Record new payment'
            }
            className={`inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold transition-smooth ${
              isFullyPaid
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
            }`}
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
              <span className="text-slate-400 block font-medium">Portal Account:</span>
              {student.user ? (
                <div className="flex items-center justify-between mt-1">
                  <span className="font-semibold text-emerald-700 flex items-center">
                    <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600 shrink-0" />
                    <span>Active ({student.user.username || student.user.email})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setRegenerateModalOpen(true);
                      setRegenerateError(null);
                    }}
                    className="text-[11px] font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 px-2.5 py-1 rounded-md border border-amber-200 transition-colors shadow-2xs cursor-pointer shrink-0 ml-2"
                    title="Regenerate temporary credentials"
                  >
                    Reset Credentials
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-1">
                  <span className="font-semibold text-amber-700 flex items-center">
                    Not Provisioned
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setProvisionModalOpen(true);
                      setGeneratedCredentials(null);
                      setProvisionError(null);
                      setProvisionEmail('');
                    }}
                    className="text-[11px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-md border border-teal-200 transition-colors shadow-2xs cursor-pointer shrink-0 ml-2"
                  >
                    Create Account
                  </button>
                </div>
              )}
            </div>

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
                if (isFullyPaid) return;
                setPaymentError(null);
                setPaymentSuccessReceiptId(null);
                const currentBal = selectedEnrollmentId ? getEnrollmentBalance(selectedEnrollmentId) : null;
                if (!currentBal || currentBal.due <= 0) {
                  const firstWithDue = student.enrollments?.find((e) => getEnrollmentBalance(e.id).due > 0);
                  if (firstWithDue) {
                    setSelectedEnrollmentId(firstWithDue.id);
                    setPaymentAmount(Math.min(getEnrollmentBalance(firstWithDue.id).due, outstandingDue));
                  } else {
                    setPaymentAmount(outstandingDue);
                  }
                } else {
                  setPaymentAmount(Math.min(currentBal.due, outstandingDue));
                }
                setPaymentModalOpen(true);
              }}
              disabled={isFullyPaid}
              title={
                isFullyPaid
                  ? 'Total Payable Fee and Total Paid to Date are equal. No outstanding due to collect.'
                  : 'Collect remaining due balance'
              }
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-smooth ${
                isFullyPaid
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 shadow-none'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs'
              }`}
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
                <th className="py-2.5 px-3 text-right">
                  <span className="inline-flex items-center justify-end gap-1.5 text-slate-700">
                    <Printer className="w-3.5 h-3.5 text-slate-500" />
                    <span>Receipt Action</span>
                  </span>
                </th>
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
                      {p.status === 'COMPLETED' ? (
                        <Link
                          href={`/print/receipt/${p.id}`}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 transition-colors shadow-2xs"
                          title="Print Money Receipt"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Receipt</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedReversalPayment(p);
                            setReversalDetailsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold border border-red-200 transition-colors shadow-2xs text-xs"
                          title="View Reversal Reason & Audit Record"
                        >
                          <Info className="w-3.5 h-3.5" />
                          <span>Reversal Reason</span>
                        </button>
                      )}
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
                {paymentError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs">Payment Error</p>
                      <p className="text-[11px] text-red-600 mt-0.5">{paymentError}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Select Program / Enrollment
                  </label>
                  <select
                    value={selectedEnrollmentId}
                    onChange={(e) => {
                      const newId = e.target.value;
                      setSelectedEnrollmentId(newId);
                      setPaymentError(null);
                      const bal = getEnrollmentBalance(newId);
                      if (bal.due > 0) {
                        setPaymentAmount(Math.min(bal.due, outstandingDue));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800"
                  >
                    {(student.enrollments || []).map((e) => {
                      const bal = getEnrollmentBalance(e.id);
                      const isSettled = bal.due <= 0;
                      return (
                        <option key={e.id} value={e.id}>
                          {e.course?.name} — Fee: {formatCurrency(e.finalFee)} | Due: {formatCurrency(bal.due)} {isSettled ? '(Settled)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedEnrollmentBalance && selectedEnrollmentBalance.due <= 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-bold">Course Fully Settled</p>
                      <p className="mt-0.5 text-blue-800">
                        "{selectedEnrollmentBalance.courseName}" has no outstanding balance remaining (Paid: {formatCurrency(selectedEnrollmentBalance.paid)} of {formatCurrency(selectedEnrollmentBalance.finalFee)}).
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      Payment Amount (BDT) *
                    </label>
                    {maxAllowedPayment > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setPaymentAmount(maxAllowedPayment);
                          setPaymentError(null);
                        }}
                        className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold underline"
                      >
                        Set Max Due ({formatCurrency(maxAllowedPayment)})
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={maxAllowedPayment > 0 ? maxAllowedPayment : undefined}
                    required
                    value={paymentAmount || ''}
                    onChange={(e) => {
                      setPaymentAmount(parseFloat(e.target.value) || 0);
                      setPaymentError(null);
                    }}
                    placeholder={`e.g. ${maxAllowedPayment > 0 ? maxAllowedPayment : 5000}`}
                    className={`w-full px-3 py-2 rounded-lg border font-bold text-sm ${
                      isOverpaying
                        ? 'border-amber-500 bg-amber-50/50 text-amber-900 focus:ring-amber-500'
                        : 'border-slate-300 text-slate-900'
                    }`}
                  />
                  {paymentAmount > 0 && !isOverpaying && (
                    <p className="text-[11px] text-slate-500 italic mt-1">
                      {numberToWordsBDT(paymentAmount)}
                    </p>
                  )}
                  {isOverpaying && (
                    <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-amber-900 mt-2 flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <p className="font-bold">Overpayment Warning</p>
                        <p className="mt-0.5 text-amber-800">
                          Total Paid to Date cannot exceed Total Payable Fee. Entered amount ({formatCurrency(paymentAmount)}) exceeds maximum remaining due ({formatCurrency(maxAllowedPayment)}). This payment cannot be recorded.
                        </p>
                      </div>
                    </div>
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
                    onClick={() => {
                      setPaymentModalOpen(false);
                      setPaymentError(null);
                    }}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      paymentSubmitting ||
                      paymentAmount <= 0 ||
                      isOverpaying ||
                      maxAllowedPayment <= 0
                    }
                    className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {paymentSubmitting ? 'Recording...' : 'Submit Payment'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Provision Portal Account Modal */}
      {provisionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={() => setProvisionModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {student.user ? 'Student Portal Credentials' : 'Provision Student Portal Account'}
                </h3>
                <p className="text-xs text-slate-500">{student.fullName} ({student.registrationNumber})</p>
              </div>
            </div>

            {generatedCredentials ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                  <div className="flex items-center space-x-2 font-bold mb-2 text-emerald-800">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>
                      {student.user ? 'Credentials Regenerated Successfully!' : 'Portal Account Created Successfully!'}
                    </span>
                  </div>
                  <p>Hand over these credentials to the student. They will be required to change their temporary password upon login before accessing the portal.</p>
                </div>

                <div className="grid grid-cols-1 gap-2.5 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Username / Reg No:</span>
                    <span className="font-mono font-bold text-slate-900">{generatedCredentials.username}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center">
                    <span className="text-slate-500 font-semibold">Login Email:</span>
                    <span className="font-medium text-slate-900">{generatedCredentials.email}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-300 flex justify-between items-center">
                    <span className="text-emerald-800 font-bold">Temporary Password:</span>
                    <span className="font-mono font-black text-emerald-900 text-sm tracking-wider">
                      {generatedCredentials.temporaryPassword}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const text = `Forever IT Institute — Student Portal Login\nStudent: ${generatedCredentials.fullName}\nRegistration No: ${generatedCredentials.registrationNumber}\nUsername / Login ID: ${generatedCredentials.username}\nEmail: ${generatedCredentials.email}\nTemporary Password: ${generatedCredentials.temporaryPassword}\nLogin Portal: ${window.location.origin}/login\n(Note: You will be asked to change password on first login)`;
                      navigator.clipboard.writeText(text);
                      setCopiedCreds(true);
                      setTimeout(() => setCopiedCreds(false), 2000);
                    }}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-900 hover:bg-emerald-200 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    {copiedCreds ? 'Copied to Clipboard!' : 'Copy Credentials'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setProvisionModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 text-white hover:bg-slate-900 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProvisionAccount} className="space-y-4">
                {provisionError && (
                  <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {provisionError}
                  </div>
                )}

                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                  A new Student login account will be created using Registration Number <strong>{student.registrationNumber}</strong> as the username with a secure temporary password.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Student Personal Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={provisionEmail}
                    onChange={(e) => setProvisionEmail(e.target.value)}
                    placeholder="e.g. student@gmail.com (Leave blank for default email)"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    If left blank, an official default email will be assigned: {student.registrationNumber.toLowerCase()}@student.foreveritbd.com
                  </span>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setProvisionModalOpen(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={provisioning}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 shadow-sm transition-smooth disabled:opacity-50"
                  >
                    <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                    {provisioning ? 'Generating Account...' : 'Generate Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Confirm Regenerate Credentials Modal */}
      {regenerateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative text-center animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto mb-3.5">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Regenerate Portal Credentials?</h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              This will generate a new temporary password for <strong className="text-slate-800">{student.fullName}</strong> ({student.registrationNumber}). The student will be required to change this password immediately upon their next login.
            </p>
            {regenerateError && (
              <div className="mt-3 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs text-left">
                {regenerateError}
              </div>
            )}
            <div className="flex justify-center gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setRegenerateModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={regenerating}
                onClick={handleRegenerateCredentials}
                className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 shadow-xs cursor-pointer"
              >
                {regenerating ? 'Regenerating...' : 'Yes, Regenerate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reversal Audit Details Modal */}
      <ReversalDetailsModal
        payment={selectedReversalPayment}
        isOpen={reversalDetailsModalOpen}
        onClose={() => {
          setReversalDetailsModalOpen(false);
          setSelectedReversalPayment(null);
        }}
        studentName={student.fullName}
        studentRegNo={student.registrationNumber}
      />
    </DashboardLayout>
  );
}
