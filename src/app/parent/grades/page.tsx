'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, StudentGradesResponse } from '@/lib/api/api-client';
import {
  Award,
  BookOpen,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export default function ParentGradesPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [gradesData, setGradesData] = useState<StudentGradesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const res = await api.parentPortal.getChildren();
      setChildren(res);
      if (res.length > 0) {
        const firstId = res[0].student.id;
        setSelectedStudentId(firstId);
        await loadGrades(firstId);
      }
    } catch (err: any) {
      console.error('Failed to load children', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGrades = async (studentId: string) => {
    try {
      const data = await api.parentPortal.getChildGrades(studentId);
      setGradesData(data);
    } catch (err: any) {
      console.error('Failed to load child grades', err);
    }
  };

  const handleSelectChild = async (studentId: string) => {
    setSelectedStudentId(studentId);
    await loadGrades(studentId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
                <Award className="w-3.5 h-3.5 text-emerald-300" />
                <span>Academic Performance & Grades</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Academic Grade Report</h1>
              <p className="text-emerald-100/90 text-sm mt-1">
                Course marks, assessment components, GPA, and instructor evaluations
              </p>
            </div>

            {children.length > 1 && (
              <div className="flex items-center gap-2 bg-white/15 p-1.5 rounded-2xl border border-white/20">
                {children.map((c) => (
                  <button
                    key={c.student.id}
                    onClick={() => handleSelectChild(c.student.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      c.student.id === selectedStudentId
                        ? 'bg-white text-emerald-950 shadow-sm'
                        : 'text-white hover:bg-white/10'
                    }`}
                  >
                    {c.student.fullName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {!gradesData?.courses || gradesData.courses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-slate-300">
            <Award className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-bold text-slate-800">No Grades Published Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are no published assessment grades for your child at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {gradesData.courses.map((course) => (
              <div
                key={course.offeringId}
                className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                      {course.offeringCode}
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1">{course.courseName}</h3>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200/80">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Total</p>
                      <p className="text-base font-black text-slate-900">{course.totalScore}%</p>
                    </div>
                    <div className="h-6 w-px bg-slate-200" />
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase">GPA</p>
                      <p className="text-base font-black text-emerald-700">{course.gpa.toFixed(2)}</p>
                    </div>
                    <div className="h-6 w-px bg-slate-200" />
                    <span className="px-3 py-1 rounded-full bg-emerald-700 text-white font-black text-xs">
                      {course.letterGrade}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
                  {course.assessments.map((ass) => (
                    <div
                      key={ass.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                          <span className="font-bold text-slate-700">{ass.assessmentType}</span>
                          <span>Weight: {ass.weightage}%</span>
                        </div>
                        <h4 className="font-bold text-slate-900">{ass.assessmentTitle}</h4>
                      </div>
                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="text-slate-500">Marks:</span>
                        <span className="font-black text-slate-900">
                          {ass.obtainedMarks} / {ass.totalMarks}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
