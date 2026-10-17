'use client';

import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, StudentGradesResponse } from '@/lib/api/api-client';
import GradesMarksQuizzesVisualizer from '@/components/academic/GradesMarksQuizzesVisualizer';
import {
  Award,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function ParentGradesPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [gradesData, setGradesData] = useState<StudentGradesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [gradesLoading, setGradesLoading] = useState(false);

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
      setGradesLoading(true);
      const data = await api.parentPortal.getChildGrades(studentId);
      setGradesData(data);
    } catch (err: any) {
      console.error('Failed to load child grades', err);
    } finally {
      setGradesLoading(false);
    }
  };

  const handleSelectChild = async (studentId: string) => {
    setSelectedStudentId(studentId);
    await loadGrades(studentId);
  };

  const selectedChild = useMemo(() => {
    return children.find((c) => c.student?.id === selectedStudentId);
  }, [children, selectedStudentId]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
                <Award className="w-3.5 h-3.5 text-emerald-300" />
                <span>Academic Evaluation • Grade Scheme</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                {selectedChild?.student?.fullName
                  ? `${selectedChild.student.fullName}'s Grade Report`
                  : 'Academic Grade Report'}
              </h1>
              <p className="text-emerald-100/90 text-sm mt-1">
                Course marks, midterm & finalterm component evaluations, quizzes, and weighted contributions
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

        {loading || gradesLoading ? (
          <div className="space-y-4">
            <div className="h-28 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
            <div className="h-96 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
          </div>
        ) : (
          <GradesMarksQuizzesVisualizer
            gradesData={gradesData}
            role="parent"
            childName={selectedChild?.student?.fullName}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
