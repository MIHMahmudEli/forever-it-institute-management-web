'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, CourseOffering } from '@/lib/api/api-client';
import {
  GraduationCap,
  Users,
  CheckSquare,
  Award,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<CourseOffering[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await api.teacherPortal.getCourses();
      setCourses(res);
    } catch (err: any) {
      console.error('Failed to load teacher courses', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
            <span>Assigned Course Offerings</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">My Teaching Courses</h1>
          <p className="text-emerald-100/90 text-sm mt-1">
            Access rosters, mark session attendance, and manage student assessments and gradebooks
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-60 bg-slate-100 animate-pulse rounded-3xl" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No Courses Assigned</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              You are currently not assigned to any active course offerings. Contact an administrator for term allocations.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {courses.map((off) => (
              <div
                key={off.id}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-black">
                      {off.code}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {off.term?.name || 'Academic Term'}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900">{off.course?.name || off.code}</h3>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                    <span className="font-bold text-emerald-800">Section: {off.section}</span>
                    <span>•</span>
                    <span>Classroom: {off.classroom}</span>
                  </div>

                  <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Capacity:</span>
                      <span className="font-bold text-slate-900">{off.enrolledCount} / {off.capacity} students</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Status:</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase">
                        {off.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-3 gap-2">
                  <Link
                    href={`/teacher/courses/${off.id}/roster`}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold text-center transition-all"
                  >
                    Roster
                  </Link>
                  <Link
                    href={`/teacher/courses/${off.id}/attendance`}
                    className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-extrabold text-center transition-all"
                  >
                    Attendance
                  </Link>
                  <Link
                    href={`/teacher/courses/${off.id}/gradebook`}
                    className="p-2.5 rounded-xl bg-[#006838] hover:bg-[#00502a] text-white text-xs font-extrabold text-center transition-all shadow-xs"
                  >
                    Gradebook
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
