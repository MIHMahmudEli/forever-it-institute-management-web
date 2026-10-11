'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, Enrollment } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { TableSkeleton } from '@/components/ui/skeletons';
import {
  GraduationCap,
  Clock,
  ArrowRight,
  AlertTriangle,
  X,
  Send,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Drop Modal State
  const [dropModalOpen, setDropModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [dropReason, setDropReason] = useState('');
  const [submittingDrop, setSubmittingDrop] = useState(false);
  const [dropSuccessMsg, setDropSuccessMsg] = useState<string | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);

  const loadCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.studentPortal.getCourses();
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch enrolled courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleOpenDropModal = (enr: Enrollment) => {
    setSelectedEnrollment(enr);
    setDropReason('');
    setDropError(null);
    setDropSuccessMsg(null);
    setDropModalOpen(true);
  };

  const handleCloseDropModal = () => {
    setDropModalOpen(false);
    setSelectedEnrollment(null);
  };

  const handleSubmitDrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;
    if (dropReason.trim().length < 5) {
      setDropError('Please provide a descriptive reason (at least 5 characters).');
      return;
    }

    setSubmittingDrop(true);
    setDropError(null);
    try {
      const res = await api.studentPortal.createDropRequest({
        enrollmentId: selectedEnrollment.id,
        reason: dropReason.trim(),
      });
      setDropSuccessMsg(res.message);
      loadCourses();
      setTimeout(() => {
        handleCloseDropModal();
      }, 1500);
    } catch (err: any) {
      setDropError(err.message || 'Failed to submit drop request.');
    } finally {
      setSubmittingDrop(false);
    }
  };

  return (
    <DashboardLayout title="My Enrolled Courses">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Enrolled Programs & Curriculum</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Overview of your active training batches, agreed fees, and course status.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={4} />
      ) : courses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Enrolled Courses Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You do not have any registered course enrollments at this time. Please contact institute administration for enrollment verification.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {courses.map((enr) => {
            const isDropEligible = enr.status === 'ACTIVE' && !enr.hasPendingDropRequest;

            return (
              <div
                key={enr.id}
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-500/40 transition-smooth flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md">
                      {enr.course?.code || 'CRS'}
                    </span>
                    <StatusBadge status={enr.status} />
                  </div>

                  <h2 className="text-base font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {enr.course?.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {enr.course?.description || 'Comprehensive professional training curriculum by Forever IT Institute.'}
                  </p>

                  {/* Financial & Duration Grid */}
                  <div className="mt-4 grid grid-cols-3 gap-2 p-3 rounded-lg bg-slate-50 border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Duration</span>
                      <span className="text-xs font-bold text-slate-700">{enr.course?.duration || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Course Fee</span>
                      <span className="text-xs font-bold text-slate-900">{formatCurrency(enr.finalFee)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block">Balance Due</span>
                      <span
                        className={`text-xs font-bold ${
                          (enr.dueAmount || 0) > 0 ? 'text-[#D81A22]' : 'text-emerald-700'
                        }`}
                      >
                        {formatCurrency(enr.dueAmount || 0)}
                      </span>
                    </div>
                  </div>

                  {enr.hasPendingDropRequest && (
                    <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Course drop request is pending administrative review.</span>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/student/courses/${enr.id}`}
                    className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    View Course Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>

                  {isDropEligible && (
                    <button
                      onClick={() => handleOpenDropModal(enr)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 transition-smooth"
                    >
                      Request Drop
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Course Drop Request Modal */}
      {dropModalOpen && selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <button
              onClick={handleCloseDropModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Course Drop</h3>
                <p className="text-xs text-slate-500">
                  {selectedEnrollment.course?.code} — {selectedEnrollment.course?.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
              Dropping a course requires approval from Forever IT Institute administration. Your submitted request will be reviewed shortly. Existing payment records remain intact.
            </p>

            {dropSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{dropSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitDrop}>
                {dropError && (
                  <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {dropError}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Reason for Dropping <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={dropReason}
                    onChange={(e) => setDropReason(e.target.value)}
                    placeholder="Please explain why you are requesting to drop this course (e.g., schedule conflict, personal reasons)..."
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseDropModal}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingDrop}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold text-white bg-[#006838] hover:bg-[#00532d] shadow-sm transition-smooth disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {submittingDrop ? 'Submitting...' : 'Submit Request'}
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
