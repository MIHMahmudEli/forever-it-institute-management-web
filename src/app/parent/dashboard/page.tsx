'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, Student } from '@/lib/api/api-client';
import {
  HeartHandshake,
  Users,
  Calendar,
  CheckSquare,
  Award,
  Receipt,
  ArrowRight,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export default function ParentDashboardPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [childDashboard, setChildDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const res = await api.parentPortal.getChildren();
      setChildren(res);
      if (res.length > 0) {
        const firstStudentId = res[0].student.id;
        setSelectedStudentId(firstStudentId);
        await loadChildData(firstStudentId);
      }
    } catch (err: any) {
      console.error('Failed to load parent children', err);
    } finally {
      setLoading(false);
    }
  };

  const loadChildData = async (studentId: string) => {
    try {
      setLoadingDashboard(true);
      const data = await api.parentPortal.getChildDashboard(studentId);
      setChildDashboard(data);
    } catch (err: any) {
      console.error('Failed to load child dashboard data', err);
    } finally {
      setLoadingDashboard(false);
    }
  };

  const handleSelectChild = async (studentId: string) => {
    setSelectedStudentId(studentId);
    await loadChildData(studentId);
  };

  const currentChild = children.find((c) => c.student.id === selectedStudentId)?.student;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-300" />
                <span>Parent & Guardian Portal • Forever IT Institute</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Family Academic Portal
              </h1>
              <p className="text-emerald-100/90 text-sm mt-1">
                Monitor your child&apos;s academic progress, attendance records, weekly routine, and fee ledger
              </p>
            </div>

            {/* Child Selector Tabs */}
            {children.length > 1 && (
              <div className="flex items-center gap-2 bg-white/15 p-1.5 rounded-2xl border border-white/20">
                {children.map((c) => {
                  const isSelected = c.student.id === selectedStudentId;
                  return (
                    <button
                      key={c.student.id}
                      onClick={() => handleSelectChild(c.student.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-white text-emerald-950 shadow-sm'
                          : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {c.student.fullName}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Selected Child Info & Quick Links */}
        {currentChild && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Viewing Student
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-0.5">
                {currentChild.fullName}
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                Reg No: {currentChild.registrationNumber} • Phone: {currentChild.mobileNumber}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={`/parent/routine?studentId=${selectedStudentId}`}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Routine</span>
              </Link>
              <Link
                href={`/parent/attendance?studentId=${selectedStudentId}`}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <CheckSquare className="w-3.5 h-3.5 text-slate-500" />
                <span>Attendance</span>
              </Link>
              <Link
                href={`/parent/grades?studentId=${selectedStudentId}`}
                className="px-3.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Award className="w-3.5 h-3.5 text-emerald-700" />
                <span>Grades</span>
              </Link>
              <Link
                href={`/parent/payments?studentId=${selectedStudentId}`}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Receipt className="w-3.5 h-3.5 text-slate-500" />
                <span>Fee Ledger</span>
              </Link>
            </div>
          </div>
        )}

        {/* Dashboard Metrics */}
        {childDashboard && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Attendance Rate
              </span>
              <span
                className={`text-3xl font-black my-2 ${
                  childDashboard.attendancePercentage >= 75
                    ? 'text-emerald-700'
                    : 'text-amber-600'
                }`}
              >
                {childDashboard.attendancePercentage}%
              </span>
              <span className="text-[11px] text-slate-500">
                {childDashboard.totalClassesAttended} of {childDashboard.totalClassesHeld} classes attended
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Enrolled Courses
              </span>
              <span className="text-3xl font-black text-slate-900 my-2">
                {childDashboard.enrollments?.length ?? 0}
              </span>
              <span className="text-[11px] text-slate-500">Active programs</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Total Agreed Fee
              </span>
              <span className="text-2xl font-black text-slate-900 my-2">
                ৳ {Number(childDashboard.financialSummary?.totalAgreedFee || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">
                Paid: ৳ {Number(childDashboard.financialSummary?.totalPaid || 0).toLocaleString()}
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                Remaining Due
              </span>
              <span
                className={`text-2xl font-black my-2 ${
                  childDashboard.financialSummary?.dueBalance > 0 ? 'text-amber-600' : 'text-emerald-700'
                }`}
              >
                ৳ {Number(childDashboard.financialSummary?.dueBalance || 0).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500">
                {childDashboard.financialSummary?.dueBalance === 0 ? 'All dues cleared' : 'Outstanding payment'}
              </span>
            </div>
          </div>
        )}

        {/* Enrolled Courses & Academic Standings */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 mb-4">
            Academic Standings by Course
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : !childDashboard?.coursesWithGrades || childDashboard.coursesWithGrades.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-6 text-center">
              No published grades available for this student yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {childDashboard.coursesWithGrades.map((c: any) => (
                <div
                  key={c.offeringId}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-black">
                      {c.offeringCode}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{c.courseName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Evaluated Score: {c.totalScore}%
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full bg-emerald-700 text-white font-black text-sm">
                      {c.letterGrade}
                    </span>
                    <p className="text-xs text-slate-600 font-bold mt-1">GPA: {c.gpa.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
