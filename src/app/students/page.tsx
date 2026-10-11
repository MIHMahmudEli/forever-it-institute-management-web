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
  Filter,
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

  return (
    <DashboardLayout title="Student Directory">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Registered Students</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, manage, search, and inspect enrolled student records ({totalCount} total).
          </p>
        </div>

        <Link
          href="/students/new"
          className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          Register New Student
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, registration number, phone, or NID..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold"
          >
            Search
          </button>
        </form>

        <div className="flex items-center space-x-2 shrink-0 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:bg-white focus:outline-hidden"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="INACTIVE">Inactive</option>
            <option value="DROPPED">Dropped</option>
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
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
                  <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
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
                            className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-700"
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-50"
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
