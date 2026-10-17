'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, Enrollment, Student, Course } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  ClipboardList,
  Eye,
  UserPlus,
  GraduationCap,
  PlusCircle,
  CheckCircle,
  X,
  AlertTriangle,
} from 'lucide-react';

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Enroll Existing Student Modal State
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [coursesList, setCoursesList] = useState<Course[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [agreedFee, setAgreedFee] = useState<number>(0);
  const [discountMode, setDiscountMode] = useState<'FIXED' | 'PERCENT'>('PERCENT');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [discountFixed, setDiscountFixed] = useState<number>(0);
  const [enrollDate, setEnrollDate] = useState(new Date().toISOString().split('T')[0]);
  const [enrollStatus, setEnrollStatus] = useState<'ACTIVE' | 'PENDING'>('ACTIVE');
  const [enrollNotes, setEnrollNotes] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  // Quick Action State
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const data = await api.enrollments.getAll({
        status: statusFilter || undefined,
      });
      setEnrollments(data);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, [statusFilter]);

  const handleOpenEnrollModal = async () => {
    setEnrollError(null);
    setSelectedStudentId('');
    setSelectedCourseId('');
    setAgreedFee(0);
    setDiscountMode('PERCENT');
    setDiscountPercent(0);
    setDiscountFixed(0);
    setEnrollDate(new Date().toISOString().split('T')[0]);
    setEnrollStatus('ACTIVE');
    setEnrollNotes('');
    setEnrollModalOpen(true);

    try {
      const [studentsRes, coursesRes] = await Promise.all([
        api.students.getAll({ limit: 100 }),
        api.courses.getAll('ACTIVE'),
      ]);
      setStudentsList(studentsRes.data || []);
      setCoursesList(coursesRes || []);
    } catch (err: any) {
      setEnrollError(err.message || 'Failed to load student or course data.');
    }
  };

  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    const found = coursesList.find((c) => c.id === courseId);
    if (found) {
      setAgreedFee(Number(found.totalFee || 0));
    }
  };

  const selectedCourse = coursesList.find((c) => c.id === selectedCourseId);
  const calculatedDiscount =
    discountMode === 'PERCENT'
      ? Math.round((Number(agreedFee || 0) * Number(discountPercent || 0)) / 100)
      : Number(discountFixed || 0);

  const calculatedFinalFee = Math.max(0, Number(agreedFee || 0) - calculatedDiscount);
  const isPercentInvalid = discountMode === 'PERCENT' && discountPercent > 100;
  const isDiscountInvalid = calculatedDiscount > Number(agreedFee || 0);
  const isSubmitDisabled =
    !selectedStudentId ||
    !selectedCourseId ||
    enrolling ||
    isPercentInvalid ||
    isDiscountInvalid ||
    Number(agreedFee) <= 0;

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedCourseId) return;

    if (isPercentInvalid) {
      setEnrollError('Discount percentage cannot exceed 100%.');
      return;
    }
    if (isDiscountInvalid) {
      setEnrollError('Discount cannot exceed the agreed course fee.');
      return;
    }

    setEnrolling(true);
    setEnrollError(null);
    try {
      await api.enrollments.create({
        studentId: selectedStudentId,
        courseId: selectedCourseId,
        agreedFee,
        discount: calculatedDiscount,
        enrollmentDate: enrollDate,
        status: enrollStatus,
        notes: enrollNotes ? enrollNotes.trim() : undefined,
      });

      setEnrollModalOpen(false);
      await fetchEnrollments();
    } catch (err: any) {
      setEnrollError(err.message || 'Failed to enroll student in course.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleApproveEnrollment = async (enrollmentId: string) => {
    setApprovingId(enrollmentId);
    try {
      await api.enrollments.update(enrollmentId, { status: 'ACTIVE' });
      await fetchEnrollments();
    } catch (err: any) {
      alert(err.message || 'Failed to approve enrollment.');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <DashboardLayout title="Enrollment Ledger">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Enrollments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete registry of student course assignments, fee snapshots, and completion status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={handleOpenEnrollModal}
            className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
            Enroll Existing Student
          </button>

          <Link
            href="/students/new"
            className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors shrink-0"
          >
            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
            Enroll New Student
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-700">
          Showing {enrollments.length} Enrollment Records
        </span>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 bg-slate-50 w-full sm:w-auto"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="PENDING">PENDING</option>
        </select>
      </div>

      {/* Enrollments Data: Mobile Card List (< lg) + Desktop Table (lg+) */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Mobile Card List (< lg) */}
        <div className="block lg:hidden divide-y divide-slate-100 p-2 sm:p-3">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-3 space-y-2.5 animate-pulse">
                <div className="h-4 bg-slate-200 rounded w-36" />
                <div className="h-3 bg-slate-100 rounded w-48" />
                <div className="h-8 bg-slate-100 rounded-lg" />
              </div>
            ))
          ) : enrollments.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ClipboardList className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">No enrollments recorded.</p>
            </div>
          ) : (
            enrollments.map((e) => (
              <div key={e.id} className="p-3 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">
                      {e.student?.fullName || 'Student'}
                    </h3>
                    <p className="font-mono text-xs text-slate-400 font-semibold">
                      {e.student?.registrationNumber}
                    </p>
                  </div>
                  <StatusBadge status={e.status} />
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100/80">
                  <span className="font-mono text-[10px] text-blue-700 font-bold block">
                    {e.course?.code}
                  </span>
                  <span className="font-bold text-xs text-blue-950 block">
                    {e.course?.name}
                  </span>
                  <span className="text-[11px] text-slate-500 block mt-0.5">
                    Enrolled: {formatDate(e.enrollmentDate)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 px-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Agreed / Discount</span>
                    <span className="font-medium text-slate-700 block mt-0.5">
                      {formatCurrency(e.agreedFee)}{' '}
                      {e.discount > 0 && <span className="text-red-600 font-bold">(-{formatCurrency(e.discount)})</span>}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Final Course Fee</span>
                    <span className="text-sm font-black text-emerald-800 block mt-0.5">
                      {formatCurrency(e.finalFee)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50">
                  {e.status === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() => handleApproveEnrollment(e.id)}
                      disabled={approvingId === e.id}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                      {approvingId === e.id ? 'Approving...' : 'Approve Enrollment'}
                    </button>
                  )}

                  {e.student && (
                    <Link
                      href={`/students/${e.student.id}`}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#006838] hover:bg-[#015333] text-white text-xs font-bold transition-colors shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" /> Profile
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table (hidden on mobile, visible on lg+) */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Enrolled Course</th>
                <th className="py-3 px-4">Enrollment Date</th>
                <th className="py-3 px-4">Agreed Fee</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Final Fee</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 bg-slate-200 rounded w-28 mb-1" />
                      <div className="h-2.5 bg-slate-100 rounded w-20" />
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 bg-slate-200 rounded w-36 mb-1" />
                      <div className="h-2.5 bg-slate-100 rounded w-16" />
                    </td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-20" /></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-200 rounded w-16" /></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-14" /></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-200 rounded w-16" /></td>
                    <td className="py-3.5 px-4"><div className="h-5 bg-slate-100 rounded-full w-16" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-6 bg-slate-100 rounded w-8 ml-auto" /></td>
                  </tr>
                ))
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ClipboardList className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No enrollments recorded.</p>
                  </td>
                </tr>
              ) : (
                enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors whitespace-nowrap">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{e.student?.fullName || 'Student'}</p>
                      <p className="font-mono text-[10px] text-slate-400">
                        {e.student?.registrationNumber}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{e.course?.name}</p>
                      <p className="font-mono text-[10px] text-slate-400">{e.course?.code}</p>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{formatDate(e.enrollmentDate)}</td>
                    <td className="py-3.5 px-4 font-medium text-slate-700">
                      {formatCurrency(e.agreedFee)}
                    </td>
                    <td className="py-3.5 px-4 text-red-600">
                      {e.discount > 0 ? `-${formatCurrency(e.discount)}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-800">
                      {formatCurrency(e.finalFee)}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={e.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {e.status === 'PENDING' && (
                          <button
                            type="button"
                            onClick={() => handleApproveEnrollment(e.id)}
                            disabled={approvingId === e.id}
                            className="inline-flex items-center px-2 py-1 rounded-md text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                            title="Approve and activate enrollment"
                          >
                            <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" />
                            {approvingId === e.id ? 'Approving...' : 'Approve'}
                          </button>
                        )}

                        {e.student && (
                          <Link
                            href={`/students/${e.student.id}`}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors shadow-2xs"
                            title="View Student Profile"
                            aria-label="View Student Profile"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enroll Existing Student Modal */}
      {enrollModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-2xs transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setEnrollModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-5 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Enroll Existing Student</h3>
                <p className="text-xs text-slate-500">Assign a student to a new training program</p>
              </div>
            </div>

            {enrollError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {enrollError}
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} className="space-y-4 text-xs">
              {/* Select Student */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Select Student <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 bg-white"
                >
                  <option value="">-- Choose student --</option>
                  {studentsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.fullName} ({s.registrationNumber}) — {s.mobileNumber}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Course */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Select Course <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={selectedCourseId}
                  onChange={(e) => handleSelectCourse(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 bg-white"
                >
                  <option value="">-- Choose course --</option>
                  {coursesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name} ({c.duration}) - ৳ {Number(c.totalFee).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCourse && (
                <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-1.5 text-xs text-blue-950">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Course Category:</span>
                    <span className="font-semibold">{selectedCourse.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Duration:</span>
                    <span className="font-semibold">{selectedCourse.duration}</span>
                  </div>
                  <div className="flex justify-between border-t border-blue-200 pt-1.5">
                    <span className="font-bold text-blue-900">Official Course Fee:</span>
                    <span className="font-black text-blue-950">{formatCurrency(selectedCourse.totalFee)}</span>
                  </div>
                </div>
              )}

              {/* Agreed Fee & Enrollment Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">
                    Agreed Fee (BDT) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={agreedFee || ''}
                    onChange={(e) => setAgreedFee(Math.max(0, Number(e.target.value)))}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Enrollment Date</label>
                  <input
                    type="date"
                    required
                    value={enrollDate}
                    onChange={(e) => setEnrollDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Discount Section */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">Discount</label>
                  <div className="flex rounded-lg border border-slate-300 bg-white p-0.5 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setDiscountMode('PERCENT')}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        discountMode === 'PERCENT'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Percentage (%)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDiscountMode('FIXED')}
                      className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                        discountMode === 'FIXED'
                          ? 'bg-blue-600 text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Fixed Amount (৳)
                    </button>
                  </div>
                </div>

                {discountMode === 'PERCENT' ? (
                  <div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={discountPercent || ''}
                        onChange={(e) => setDiscountPercent(Number(e.target.value))}
                        placeholder="Discount percentage (0-100)"
                        className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 bg-white"
                      />
                      <span className="text-xs font-bold text-slate-500">%</span>
                    </div>
                    {isPercentInvalid && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                        Discount percentage cannot exceed 100%.
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type="number"
                      min={0}
                      value={discountFixed || ''}
                      onChange={(e) => setDiscountFixed(Number(e.target.value))}
                      placeholder="Discount amount in BDT"
                      className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 bg-white"
                    />
                    {isDiscountInvalid && (
                      <p className="text-[11px] font-semibold text-red-600 mt-1 flex items-center">
                        <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                        Discount cannot exceed the agreed course fee.
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                  <span className="text-slate-500">Calculated Discount:</span>
                  <span className="font-bold text-red-600">
                    -{formatCurrency(calculatedDiscount)}
                  </span>
                </div>
              </div>

              {/* Final Fee Summary */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Final Course Fee</span>
                  <span className="text-xs text-emerald-700">Agreed fee minus discount</span>
                </div>
                <span className="text-base font-black text-emerald-900">
                  {formatCurrency(calculatedFinalFee)}
                </span>
              </div>

              {/* Status & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Enrollment Status</label>
                  <select
                    value={enrollStatus}
                    onChange={(e) => setEnrollStatus(e.target.value as any)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 bg-white"
                  >
                    <option value="ACTIVE">ACTIVE (Immediate Enrollment)</option>
                    <option value="PENDING">PENDING (Review / Provisional)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">Notes (Optional)</label>
                  <input
                    type="text"
                    value={enrollNotes}
                    onChange={(e) => setEnrollNotes(e.target.value)}
                    placeholder="e.g. Special batch enrollment"
                    className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEnrollModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className="inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 shadow-sm transition-smooth disabled:opacity-50 cursor-pointer"
                >
                  <GraduationCap className="w-3.5 h-3.5 mr-1.5" />
                  {enrolling ? 'Enrolling Course...' : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
