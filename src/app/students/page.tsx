'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, Student } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  Users,
  Search,
  UserPlus,
  Eye,
  Printer,
  ChevronLeft,
  ChevronRight,
  Phone,
  GraduationCap,
  X,
  CreditCard,
} from 'lucide-react';

export default function StudentsListPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await api.students.getAll({
        search: search || undefined,
        status: status || undefined,
        page,
        limit: 10,
      });
      setStudents(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalCount(res.meta.total);
    } catch {
      // Handled silently with empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, status]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleClearSearch = () => {
    setSearch('');
    setPage(1);
  };

  return (
    <DashboardLayout title="Student Directory">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 pb-3 sm:pb-5 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-bold text-slate-900 tracking-tight">
              Registered Students
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-[#006838] border border-emerald-200">
              {totalCount}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 hidden sm:block">
            Browse, manage, search, and inspect enrolled student records.
          </p>
        </div>

        <Link
          href="/students/new"
          className="inline-flex items-center px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white shadow-xs transition-all shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          <span>New Student</span>
        </Link>
      </div>

      {/* Search & Status Filter Section */}
      <div className="space-y-2.5 mb-5">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search student, reg #, phone, NID..."
            className="w-full pl-10 pr-20 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden shadow-2xs transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-18 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-bold transition-all shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Horizontal Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { label: 'All', value: '' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'Completed', value: 'COMPLETED' },
            { label: 'Inactive', value: 'INACTIVE' },
            { label: 'Dropped', value: 'DROPPED' },
          ].map((tab) => {
            const isSelected = status === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatus(tab.value);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MOBILE VIEW: Discrete Touch-Friendly Cards (< lg) */}
      {/* ------------------------------------------------------------- */}
      <div className="block lg:hidden space-y-3">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs space-y-3 animate-pulse"
            >
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-slate-200" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-200 rounded w-36" />
                  <div className="h-3 bg-slate-100 rounded w-24" />
                </div>
              </div>
              <div className="h-10 bg-slate-100 rounded-xl" />
              <div className="h-8 bg-slate-100 rounded-xl" />
            </div>
          ))
        ) : students.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <Users className="w-9 h-9 mx-auto text-slate-300 mb-2" />
            <p className="font-bold text-sm text-slate-800">No students found</p>
            <p className="text-xs text-slate-500 mt-0.5">
              Try adjusting your search query or status filter.
            </p>
          </div>
        ) : (
          students.map((student) => (
            <div
              key={student.id}
              className="p-3.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all space-y-3"
            >
              {/* Card Header: Avatar, Name, Reg Number, Status */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-[#004225] text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                    {student.fullName?.charAt(0) || 'S'}
                  </div>
                  <div className="min-w-0">
                    <Link
                      href={`/students/${student.id}`}
                      className="font-bold text-sm text-slate-900 hover:text-emerald-700 transition-colors truncate block"
                    >
                      {student.fullName}
                    </Link>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                        {student.registrationNumber}
                      </span>
                    </div>
                  </div>
                </div>
                <StatusBadge status={student.status} />
              </div>

              {/* Card Meta: Phone & Due Balance */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2 px-2.5 bg-slate-50/80 rounded-xl border border-slate-100 items-center">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a
                    href={`tel:${student.mobileNumber}`}
                    className="font-semibold text-slate-700 hover:text-emerald-700 truncate"
                  >
                    {student.mobileNumber}
                  </a>
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-slate-400 text-[11px]">Due:</span>
                  <span
                    className={`font-black text-xs px-2 py-0.5 rounded-md ${
                      student.financials && student.financials.outstandingDue > 0
                        ? 'bg-red-50 text-red-600 border border-red-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {student.financials && student.financials.outstandingDue > 0
                      ? formatCurrency(student.financials.outstandingDue)
                      : '৳ 0 (Paid)'}
                  </span>
                </div>
              </div>

              {/* Enrolled Programs List */}
              {student.enrollments && student.enrollments.length > 0 && (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <div className="flex items-center gap-1 flex-wrap">
                    {student.enrollments.slice(0, 2).map((e) => (
                      <span
                        key={e.id}
                        className="px-2 py-0.5 rounded-lg bg-emerald-50/80 border border-emerald-100 text-[10.5px] font-semibold text-emerald-800 truncate max-w-[150px]"
                      >
                        {e.course?.name || 'Program'}
                      </span>
                    ))}
                    {student.enrollments.length > 2 && (
                      <span className="px-1.5 py-0.5 rounded-md bg-slate-100 text-[10px] font-bold text-slate-600">
                        +{student.enrollments.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Card Footer Actions */}
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <Link
                  href={`/print/registration/${student.id}`}
                  className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold active:scale-95 transition-all"
                >
                  <Printer className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                  <span>Print Form</span>
                </Link>
                <Link
                  href={`/students/${student.id}`}
                  className="inline-flex items-center justify-center px-3.5 py-1.5 rounded-xl bg-[#006838] hover:bg-[#015333] active:scale-95 text-white text-xs font-bold shadow-xs transition-all"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  <span>Profile</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                </Link>
              </div>
            </div>
          ))
        )}

        {/* Mobile Pagination */}
        {totalPages > 1 && (
          <div className="p-3 bg-white rounded-2xl border border-slate-200 flex items-center justify-between text-xs text-slate-600 shadow-2xs mt-3">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 disabled:opacity-40 hover:bg-slate-100 text-slate-700 font-bold active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
            </button>
            <span className="font-bold text-slate-700">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 disabled:opacity-40 hover:bg-slate-100 text-slate-700 font-bold active:scale-95 transition-all cursor-pointer"
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DESKTOP VIEW: Full Data Table (hidden on mobile, visible on lg+) */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                <th className="py-3 px-4">Reg Number</th>
                <th className="py-3 px-4">Student & Parents</th>
                <th className="py-3 px-4">Mobile / NID</th>
                <th className="py-3 px-4">Enrolled Courses</th>
                <th className="py-3 px-4">Payable / Paid</th>
                <th className="py-3 px-4">Due Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-200 rounded w-20" /></td>
                    <td className="py-3.5 px-4">
                      <div className="h-3.5 bg-slate-200 rounded w-32 mb-1.5" />
                      <div className="h-2.5 bg-slate-100 rounded w-24" />
                    </td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-100 rounded w-24" /></td>
                    <td className="py-3.5 px-4"><div className="h-5 bg-slate-100 rounded w-28" /></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-200 rounded w-24" /></td>
                    <td className="py-3.5 px-4"><div className="h-3.5 bg-slate-200 rounded w-16" /></td>
                    <td className="py-3.5 px-4"><div className="h-5 bg-slate-100 rounded-full w-16" /></td>
                    <td className="py-3.5 px-4 text-right"><div className="h-6 bg-slate-100 rounded w-16 ml-auto" /></td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No students found matching your query.</p>
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors whitespace-nowrap">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                      {student.registrationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{student.fullName}</p>
                      <p className="text-[11px] text-slate-500">Parent: {student.parentName}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-medium text-slate-800">{student.mobileNumber}</p>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-[130px]">
                        NID: {student.nidOrBirthCertificateNumber}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {(student.enrollments || []).map((e) => (
                          <span
                            key={e.id}
                            className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-700 whitespace-nowrap"
                          >
                            {e.course?.name || 'Program'}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium">
                      <span className="text-slate-800">
                        {formatCurrency(student.financials?.totalPayable)}
                      </span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="text-emerald-700 font-semibold">
                        {formatCurrency(student.financials?.totalPaid)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      {student.financials && student.financials.outstandingDue > 0 ? (
                        <span className="text-red-600">
                          {formatCurrency(student.financials.outstandingDue)}
                        </span>
                      ) : (
                        <span className="text-emerald-700">৳ 0 (Paid)</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={student.status} />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          href={`/students/${student.id}`}
                          className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="View Student Profile"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/print/registration/${student.id}`}
                          className="p-1.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors"
                          title="Print Registration Form"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3.5 sm:p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <span>
              Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
