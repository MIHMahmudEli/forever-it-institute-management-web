'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, StudentGradesResponse } from '@/lib/api/api-client';
import GradesMarksQuizzesVisualizer from '@/components/academic/GradesMarksQuizzesVisualizer';
import {
  Award,
  AlertCircle,
  RefreshCw,
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
        <div className="bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
                <Award className="w-3.5 h-3.5 text-emerald-300" />
                <span>Academic Evaluation • Grade Scheme</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                Academic Grade System
              </h1>
              <p className="text-emerald-100/90 text-sm mt-1">
                Course marks, midterm & finalterm component evaluations, quizzes, and weighted contributions
              </p>
            </div>
            <button
              onClick={loadGrades}
              className="self-start md:self-auto px-4 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-xl text-xs font-bold transition-all border border-white/20 shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
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
            <div className="h-28 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
            <div className="h-96 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
          </div>
        ) : (
          <GradesMarksQuizzesVisualizer
            gradesData={data}
            role="student"
          />
        )}
      </div>
    </DashboardLayout>
  );
}
