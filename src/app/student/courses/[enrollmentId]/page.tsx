'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, Enrollment, DropRequest } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { TableSkeleton } from '@/components/ui/skeletons';
import {
  GraduationCap,
  ArrowLeft,
  Calendar,
  Receipt,
  CircleDollarSign,
  AlertTriangle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';

export default function StudentCourseDetailPage() {
  const params = useParams();
  const enrollmentId = params.enrollmentId as string;

  const [enrollment, setEnrollment] = useState<(Enrollment & { dropRequests?: DropRequest[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourse = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.studentPortal.getCourse(enrollmentId);
      setEnrollment(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enrollmentId) {
      loadCourse();
    }
  }, [enrollmentId]);

  return (
    <DashboardLayout title="Course Enrollment Details">
      <div className="mb-6">
        <Link
          href="/student/courses"
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to My Courses
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/70 border border-emerald-300/60 px-2.5 py-1 rounded-md">
              {enrollment?.course?.code || 'CRS'}
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {enrollment?.course?.name || 'Course Details'}
            </h1>
          </div>
          {enrollment && <StatusBadge status={enrollment.status} />}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={3} />
      ) : !enrollment ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-8 text-center">
          <p className="text-xs text-slate-500">Course enrollment record not found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Info Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Course Overview Card */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Curriculum Overview</h2>
              <p className="text-xs text-slate-600 leading-relaxed">
                {enrollment.course?.description ||
                  'Specialized practical curriculum designed and certified by Forever IT Institute.'}
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Category</span>
                  <span className="text-xs font-bold text-slate-800">{enrollment.course?.category || 'IT Training'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Duration</span>
                  <span className="text-xs font-bold text-slate-800">{enrollment.course?.duration || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-slate-400 block">Enrolled Date</span>
                  <span className="text-xs font-bold text-slate-800">{formatDate(enrollment.enrollmentDate)}</span>
                </div>
              </div>
            </div>

            {/* Financial Ledger for this Course */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-3">Course Financial Ledger</h2>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                  <span>Standard Agreed Fee:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(enrollment.agreedFee)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                  <span>Waiver / Discount:</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(enrollment.discount)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                  <span>Final Payable Fee:</span>
                  <span className="font-bold text-slate-900">{formatCurrency(enrollment.finalFee)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-600">
                  <span>Total Amount Paid:</span>
                  <span className="font-bold text-emerald-700">{formatCurrency(enrollment.paidAmount || 0)}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="font-bold text-slate-900">Remaining Balance:</span>
                  <span
                    className={`font-black ${
                      (enrollment.dueAmount || 0) > 0 ? 'text-[#D81A22]' : 'text-emerald-700'
                    }`}
                  >
                    {formatCurrency(enrollment.dueAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payments for this Course */}
          <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
              <Receipt className="w-4 h-4 mr-2 text-emerald-700" />
              Receipts Issued for this Course
            </h2>

            {(enrollment.payments || []).length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No payments recorded specifically for this course.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Receipt #</th>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Payment Method</th>
                      <th className="px-4 py-2.5">Amount</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enrollment.payments?.map((pmt) => (
                      <tr key={pmt.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-slate-900">{pmt.receiptNumber}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(pmt.paymentDate)}</td>
                        <td className="px-4 py-3 text-slate-600">{pmt.paymentMethod}</td>
                        <td className="px-4 py-3 font-bold text-emerald-700">{formatCurrency(pmt.amount)}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={pmt.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/print/receipt/${pmt.id}`}
                            target="_blank"
                            className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors"
                          >
                            Print Receipt
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Drop Request History */}
          {(enrollment.dropRequests || []).length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-amber-600" />
                Drop Request History
              </h2>
              <div className="space-y-3">
                {enrollment.dropRequests?.map((dr) => (
                  <div key={dr.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-700">
                        Requested on {formatDate(dr.requestDate)}
                      </span>
                      <StatusBadge status={dr.status} />
                    </div>
                    <p className="text-slate-600">
                      <span className="font-semibold text-slate-800">Reason:</span> {dr.reason}
                    </p>
                    {dr.adminNotes && (
                      <p className="mt-2 text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-800">Institute Notes:</span> {dr.adminNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
