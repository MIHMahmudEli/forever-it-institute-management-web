'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api/api-client';
import {
  GraduationCap,
  Users,
  Calendar,
  Clock,
  MapPin,
  CheckSquare,
  Award,
  ArrowRight,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export default function TeacherDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.teacherPortal.getDashboard();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load teacher dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
                <span>Instructor Workspace • Forever IT Institute</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Welcome back, {data?.teacher?.user?.fullName || 'Instructor'}!
              </h1>
              <p className="text-emerald-100/90 text-sm mt-1">
                {data?.teacher?.designation} • {data?.teacher?.department} Department ({data?.teacher?.teacherId})
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/teacher/timetable"
                className="px-4 py-2.5 rounded-xl bg-white text-emerald-900 text-xs font-black shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>My Routine</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Assigned Courses
            </span>
            <span className="text-3xl font-black text-slate-900 my-2">
              {data?.activeOfferingsCount ?? 0}
            </span>
            <span className="text-[11px] text-slate-500">Active offerings this term</span>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Enrolled Students
            </span>
            <span className="text-3xl font-black text-emerald-700 my-2">
              {data?.totalStudentsEnrolled ?? 0}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold">Across all your sections</span>
          </div>

          <div className="col-span-2 md:col-span-1 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Classes Today
            </span>
            <span className="text-3xl font-black text-slate-900 my-2">
              {data?.todaySessionsCount ?? 0}
            </span>
            <span className="text-[11px] text-slate-500">Scheduled for today</span>
          </div>
        </div>

        {/* Today's Classes Section */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-700" />
              <h2 className="text-base font-extrabold text-slate-900">Today&apos;s Class Sessions</h2>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : !data?.todaySessions || data.todaySessions.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-500">No classes scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.todaySessions.map((ses: any) => (
                <div
                  key={ses.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-black">
                        {ses.offering?.code}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{ses.title}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{ses.startTime?.substring(0, 5)} - {ses.endTime?.substring(0, 5)}</span>
                      <span>•</span>
                      <span>{ses.classroom || ses.offering?.classroom || 'Classroom'}</span>
                    </div>
                  </div>

                  <Link
                    href={`/teacher/courses/${ses.offeringId}/attendance?session=${ses.id}`}
                    className="self-start sm:self-center px-4 py-2 bg-[#006838] hover:bg-[#00502a] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Take Attendance</span>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Course Offerings List */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-extrabold text-slate-900">My Assigned Courses</h2>
            <Link
              href="/teacher/courses"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(data?.offerings || []).map((off: any) => (
              <div
                key={off.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 transition-all flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-black">
                    {off.code}
                  </span>
                  <h3 className="text-base font-black text-slate-900 mt-2 group-hover:text-emerald-700 transition-colors">
                    {off.course?.name || off.code}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">Section: {off.section}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/teacher/courses/${off.id}/roster`}
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                  >
                    Roster
                  </Link>
                  <Link
                    href={`/teacher/courses/${off.id}/gradebook`}
                    className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all"
                  >
                    Gradebook
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
