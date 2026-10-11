'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, Enrollment } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { ClipboardList, Search, UserPlus } from 'lucide-react';

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

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

  return (
    <DashboardLayout title="Enrollment Ledger">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Course Enrollments</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete registry of student course assignments, fee snapshots, and completion status.
          </p>
        </div>

        <Link
          href="/students/new"
          className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5 mr-1.5" />
          Enroll New Student
        </Link>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 mb-6 shadow-xs flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-700">
          Showing {enrollments.length} Enrollment Records
        </span>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-700 bg-slate-50"
        >
          <option value="">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="CANCELLED">CANCELLED</option>
          <option value="PENDING">PENDING</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Enrolled Course</th>
                <th className="py-3 px-4">Enrollment Date</th>
                <th className="py-3 px-4">Agreed Fee</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Final Fee</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Loading enrollments...</p>
                  </td>
                </tr>
              ) : enrollments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <ClipboardList className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No enrollments recorded.</p>
                  </td>
                </tr>
              ) : (
                enrollments.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
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
                      {e.student && (
                        <Link
                          href={`/students/${e.student.id}`}
                          className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold border border-slate-200"
                        >
                          View Student
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
