'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, StudentGradesResponse } from '@/lib/api/api-client';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  TrendingUp,
  Percent,
} from 'lucide-react';

export default function StudentGradesPage() {
  const [data, setData] = useState<StudentGradesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGrades();
  }, []);

  const loadGrades = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.studentPortal.getGrades();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load grades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
                <Award className="w-3.5 h-3.5 text-emerald-300" />
                <span>Published Academic Progress • Bangladesh Standard Scale</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                My Academic Grades
              </h1>
              <p className="text-emerald-100/90 text-sm mt-1">
                Continuous assessment scores, component weightages, teacher remarks, and overall course GPAs
              </p>
            </div>
            <button
              onClick={loadGrades}
              className="self-start md:self-auto px-4 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-xl text-xs font-bold transition-all border border-white/20 shadow-xs cursor-pointer"
            >
              Refresh Grades
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-56 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
            ))}
          </div>
        ) : !data?.courses || data.courses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Published Grades Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Your instructors have not published any assessment components or grades yet. Check back after your exams or assignments are graded!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.courses.map((course) => (
              <div
                key={course.offeringId}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm overflow-hidden"
              >
                {/* Course Header Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-extrabold tracking-wide">
                      {course.offeringCode}
                    </span>
                    <h2 className="text-lg font-black text-slate-900 mt-2">
                      {course.courseName}
                    </h2>
                  </div>

                  {/* Overall GPA & Letter Grade */}
                  <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-200/70">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Weighted Total
                      </p>
                      <p className="text-lg font-black text-slate-900">
                        {course.totalScore}%
                      </p>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        GPA (4.0 Scale)
                      </p>
                      <p className="text-lg font-black text-emerald-700">
                        {course.gpa.toFixed(2)}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-slate-200" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Letter Grade
                      </p>
                      <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-700 text-white font-black text-sm">
                        {course.letterGrade}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Assessments Breakdown Table / Cards */}
                <div className="mt-5">
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
                    Assessment Components ({course.assessments.length})
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {course.assessments.map((ass) => (
                      <div
                        key={ass.id}
                        className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-slate-700 text-[10px] uppercase">
                              {ass.assessmentType}
                            </span>
                            <span className="font-semibold text-slate-500 text-[11px]">
                              Weight: {ass.weightage}%
                            </span>
                          </div>
                          <h5 className="text-sm font-bold text-slate-900">{ass.assessmentTitle}</h5>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-200/60">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 font-medium">Marks Obtained:</span>
                            <span className="font-extrabold text-slate-900">
                              {ass.obtainedMarks} / {ass.totalMarks}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-slate-500 font-medium">Weighted Contribution:</span>
                            <span className="font-black text-emerald-700">
                              +{ass.weightedContribution}%
                            </span>
                          </div>
                          {ass.feedback && (
                            <p className="mt-2 text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100 italic">
                              &ldquo;{ass.feedback}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
