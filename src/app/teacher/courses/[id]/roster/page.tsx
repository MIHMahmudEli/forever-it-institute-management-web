'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api/api-client';
import {
  Users,
  ArrowLeft,
  Mail,
  Phone,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Search,
} from 'lucide-react';

export default function TeacherCourseRosterPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const offeringId = resolvedParams.id;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRoster();
  }, [offeringId]);

  const loadRoster = async () => {
    try {
      setLoading(true);
      const res = await api.teacherPortal.getCourseRoster(offeringId);
      setData(res);
    } catch (err: any) {
      console.error('Failed to load roster', err);
    } finally {
      setLoading(false);
    }
  };

  const students = (data?.students || []).filter((s: any) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.registrationNumber.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q) ||
      s.mobileNumber.includes(q)
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex items-center gap-3">
          <Link
            href="/teacher/courses"
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900">
              Class Student Roster
            </h1>
            <p className="text-xs text-slate-500">
              {data?.offering?.course?.name} ({data?.offering?.code}) • Section: {data?.offering?.section}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center justify-between gap-3">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, reg no, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>
          <span className="text-xs font-bold text-slate-500 shrink-0">
            Total Enrolled: {students.length}
          </span>
        </div>

        {/* Student Roster Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Reg No</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4">Enrolled Date</th>
                  <th className="py-3.5 px-4 text-right">Attendance Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">Loading student roster...</td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">No students found matching your search.</td>
                  </tr>
                ) : (
                  students.map((st: any) => (
                    <tr key={st.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                        {st.registrationNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {st.fullName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div className="flex flex-col gap-0.5">
                          {st.email && (
                            <span className="flex items-center gap-1.5 text-slate-600">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {st.email}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {st.mobileNumber}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {st.enrollmentDate}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-black text-xs ${
                            st.attendancePercentage >= 75
                              ? 'bg-emerald-100 text-emerald-900'
                              : st.attendancePercentage >= 60
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-red-100 text-red-900'
                          }`}
                        >
                          {st.attendancePercentage}% ({st.totalClassesAttended}/{st.totalClassesHeld})
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
