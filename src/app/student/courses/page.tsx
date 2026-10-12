'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, Enrollment, AvailableCourse } from '@/lib/api/api-client';
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
  PlusCircle,
  Search,
  BookOpen,
  Compass,
} from 'lucide-react';

export default function StudentCoursesPage() {
  const [activeTab, setActiveTab] = useState<'enrolled' | 'browse'>('enrolled');
  const [courses, setCourses] = useState<Enrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<AvailableCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter for Available Courses
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Drop Modal State
  const [dropModalOpen, setDropModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [dropReason, setDropReason] = useState('');
  const [submittingDrop, setSubmittingDrop] = useState(false);
  const [dropSuccessMsg, setDropSuccessMsg] = useState<string | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);

  // Request Enrollment Modal State
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [courseToRequest, setCourseToRequest] = useState<AvailableCourse | null>(null);
  const [requestNotes, setRequestNotes] = useState('');
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccessMsg, setRequestSuccessMsg] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);

  // Cancel Pending Request State
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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

  const loadAvailableCourses = async () => {
    setLoadingAvailable(true);
    try {
      const data = await api.studentPortal.getAvailableCourses();
      setAvailableCourses(data);
    } catch (err: any) {
      // Handled silently or shown in tab
    } finally {
      setLoadingAvailable(false);
    }
  };

  useEffect(() => {
    loadCourses();
    loadAvailableCourses();
  }, []);

  // Drop Handlers
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

  // Request Enrollment Handlers
  const handleOpenRequestModal = (course: AvailableCourse) => {
    setCourseToRequest(course);
    setRequestNotes('');
    setRequestError(null);
    setRequestSuccessMsg(null);
    setRequestModalOpen(true);
  };

  const handleCloseRequestModal = () => {
    setRequestModalOpen(false);
    setCourseToRequest(null);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseToRequest) return;

    setSubmittingRequest(true);
    setRequestError(null);
    try {
      const res = await api.studentPortal.requestEnrollment({
        courseId: courseToRequest.id,
        notes: requestNotes.trim() || undefined,
      });
      setRequestSuccessMsg(res.message);
      await Promise.all([loadCourses(), loadAvailableCourses()]);
      setTimeout(() => {
        handleCloseRequestModal();
        setActiveTab('enrolled');
      }, 1800);
    } catch (err: any) {
      setRequestError(err.message || 'Failed to submit enrollment request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  // Cancel Request Handler
  const handleCancelPendingEnrollment = async (enrollmentId: string) => {
    if (!window.confirm('Are you sure you want to cancel this pending course enrollment request?')) {
      return;
    }
    setCancellingId(enrollmentId);
    try {
      await api.studentPortal.cancelEnrollmentRequest(enrollmentId);
      await Promise.all([loadCourses(), loadAvailableCourses()]);
    } catch (err: any) {
      alert(err.message || 'Failed to cancel enrollment request.');
    } finally {
      setCancellingId(null);
    }
  };

  // Filter available courses
  const categories = Array.from(new Set(availableCourses.map((c) => c.category || 'General')));
  const filteredAvailableCourses = availableCourses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout title="Courses & Programs">
      {/* Header & Tabs */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Courses & Curriculum</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your enrolled programs or explore and request new courses offered by Forever IT Institute.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-2xs w-full sm:w-auto gap-1 sm:gap-0">
          <button
            type="button"
            onClick={() => setActiveTab('enrolled')}
            className={`inline-flex items-center justify-center px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'enrolled'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            My Enrolled Courses ({courses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            className={`inline-flex items-center justify-center px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'browse'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5 mr-1.5" />
            Browse Available Courses ({availableCourses.length})
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* TAB 1: MY ENROLLED COURSES */}
      {activeTab === 'enrolled' && (
        <>
          {loading ? (
            <TableSkeleton rows={4} />
          ) : courses.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Enrolled Courses Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                You do not have any registered course enrollments at this time. Browse our available courses to request enrollment.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('browse')}
                className="mt-4 inline-flex items-center px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Compass className="w-4 h-4 mr-1.5" />
                Browse Available Courses
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {courses.map((enr) => {
                const isDropEligible = enr.status === 'ACTIVE' && !enr.hasPendingDropRequest;
                const isPending = enr.status === 'PENDING';

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

                      <h2 className="text-base font-bold text-slate-900">
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
                              (enr.dueAmount || 0) > 0 && enr.status !== 'DROPPED'
                                ? 'text-[#D81A22]'
                                : 'text-emerald-700'
                            }`}
                          >
                            {enr.status === 'DROPPED'
                              ? '৳ 0 (Waived)'
                              : isPending
                              ? 'Pending Settlement'
                              : formatCurrency(enr.dueAmount || 0)}
                          </span>
                        </div>
                      </div>

                      {/* Pending Enrollment Callout */}
                      {isPending && (
                        <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs flex items-start space-x-2.5">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-amber-800">Enrollment Request Under Review</p>
                            <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                              Your request was submitted on {formatDate(enr.enrollmentDate)}. Institute administration is reviewing your request for batch scheduling and activation.
                            </p>
                          </div>
                        </div>
                      )}

                      {enr.hasPendingDropRequest && (
                        <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Course drop request is pending administrative review.</span>
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      {isPending ? (
                        <button
                          type="button"
                          disabled={cancellingId === enr.id}
                          onClick={() => handleCancelPendingEnrollment(enr.id)}
                          className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {cancellingId === enr.id ? 'Cancelling...' : 'Cancel Request'}
                        </button>
                      ) : (
                        <Link
                          href={`/student/courses/${enr.id}`}
                          className="inline-flex items-center text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                        >
                          View Course Details <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      )}

                      {isDropEligible && (
                        <button
                          onClick={() => handleOpenDropModal(enr)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 transition-smooth cursor-pointer"
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
        </>
      )}

      {/* TAB 2: BROWSE AVAILABLE COURSES */}
      {activeTab === 'browse' && (
        <div>
          {/* Search & Category Filter Toolbar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search course title or code..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs text-slate-500 font-medium shrink-0">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-700 w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingAvailable ? (
            <TableSkeleton rows={4} />
          ) : filteredAvailableCourses.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No Courses Match Your Criteria</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Try searching with another keyword or resetting the category filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAvailableCourses.map((course) => {
                const enrStatus = course.enrollmentStatus;
                const isEnrolled = enrStatus === 'ACTIVE';
                const isPending = enrStatus === 'PENDING';

                return (
                  <div
                    key={course.id}
                    className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-500/40 hover:shadow-sm transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-md">
                          {course.code}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {course.category}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                        {course.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                        {course.description || 'Comprehensive professional training curriculum by Forever IT Institute.'}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Duration</span>
                          <span className="font-bold text-slate-700">{course.duration}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Course Fee</span>
                          <span className="font-black text-emerald-800 text-sm">{formatCurrency(course.totalFee)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-100">
                      {isEnrolled ? (
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                            Enrolled (Active)
                          </span>
                          {course.enrollmentId && (
                            <Link
                              href={`/student/courses/${course.enrollmentId}`}
                              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center"
                            >
                              View <ArrowRight className="w-3 h-3 ml-0.5" />
                            </Link>
                          )}
                        </div>
                      ) : isPending ? (
                        <div className="flex items-center justify-between bg-amber-50 p-2 rounded-lg border border-amber-200">
                          <span className="inline-flex items-center text-xs font-bold text-amber-800">
                            <Clock className="w-3.5 h-3.5 mr-1 text-amber-600" />
                            Request Pending Review
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveTab('enrolled')}
                            className="text-[11px] font-bold text-amber-900 underline hover:text-amber-950 cursor-pointer"
                          >
                            Details
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenRequestModal(course)}
                          className="w-full inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-xs transition-colors cursor-pointer"
                        >
                          <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
                          Request Enrollment
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Course Drop Request Modal */}
      {dropModalOpen && selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
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

      {/* Course Enrollment Request Modal */}
      {requestModalOpen && courseToRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={handleCloseRequestModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Request Course Enrollment</h3>
                <p className="text-xs text-slate-500">
                  {courseToRequest.code} — {courseToRequest.name}
                </p>
              </div>
            </div>

            <div className="mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="font-semibold text-slate-800">{courseToRequest.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration:</span>
                <span className="font-semibold text-slate-800">{courseToRequest.duration}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-1.5">
                <span className="text-slate-700 font-bold">Standard Course Fee:</span>
                <span className="font-black text-emerald-800">{formatCurrency(courseToRequest.totalFee)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Submitting this request will notify institute administration to review and activate your enrollment. Payment terms and schedule details will be finalized upon approval.
            </p>

            {requestSuccessMsg ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="font-semibold">{requestSuccessMsg}</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest}>
                {requestError && (
                  <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {requestError}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Optional Message / Schedule Preference
                  </label>
                  <textarea
                    rows={3}
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    placeholder="e.g. Interested in evening or weekend batch, or special inquiry..."
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseRequestModal}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRequest}
                    className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-sm transition-smooth disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    {submittingRequest ? 'Submitting...' : 'Submit Enrollment Request'}
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
