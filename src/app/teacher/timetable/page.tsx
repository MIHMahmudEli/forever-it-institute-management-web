'use client';

import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, RoutineClass } from '@/lib/api/api-client';
import RoutineProVisualizer from '@/components/academic/RoutineProVisualizer';
import {
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Sparkles,
  List,
} from 'lucide-react';

const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function TeacherTimetablePage() {
  const [routine, setRoutine] = useState<RoutineClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'routinepro' | 'cards'>('routinepro');

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.teacherPortal.getTimetable();
      setRoutine(res.routine || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load teaching schedule');
    } finally {
      setLoading(false);
    }
  };

  // Group by day of week for the cards view
  const routineByDay = useMemo(() => {
    return DAYS.map((dayName, dayIndex) => {
      const classes = routine.filter((r) => r.dayOfWeek === dayIndex);
      return {
        dayName,
        dayIndex,
        classes,
      };
    });
  }, [routine]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                <span>Weekly Schedule • Asia/Dhaka (UTC+6)</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Teaching Schedule</h1>
              <p className="text-emerald-100/90 text-sm mt-1">
                Visual weekly timetable of assigned courses, classroom locations, and time slots
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
              {/* View Switcher */}
              <div className="flex items-center bg-white/15 p-1 rounded-2xl border border-white/20 backdrop-blur-md">
                <button
                  onClick={() => setViewMode('routinepro')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'routinepro'
                      ? 'bg-white text-emerald-950 shadow-sm'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Weekly Routine</span>
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'cards'
                      ? 'bg-white text-emerald-950 shadow-sm'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Day-by-Day</span>
                </button>
              </div>

              <button
                onClick={loadTimetable}
                className="px-4 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-xl text-xs font-bold transition-all border border-white/20 shadow-xs cursor-pointer"
              >
                Refresh
              </button>
            </div>
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
            <div className="h-64 bg-slate-900/10 animate-pulse rounded-3xl" />
          </div>
        ) : (
          <div>
            {/* View 1: RoutinePro Visualizer */}
            {viewMode === 'routinepro' && (
              <div className="animate-in fade-in duration-200">
                <RoutineProVisualizer
                  classes={routine}
                  academicSession="FALL 2026-2027"
                  role="teacher"
                  title="Instructor Teaching Schedule"
                />
              </div>
            )}

            {/* View 2: Cards List by Day */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-200">
                {routineByDay.map((day) => (
                  <div
                    key={day.dayName}
                    className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                        <h3 className="text-sm font-black text-slate-800 tracking-wide">
                          {day.dayName}
                        </h3>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {day.classes.length} class{day.classes.length !== 1 ? 'es' : ''}
                        </span>
                      </div>

                      {day.classes.length === 0 ? (
                        <p className="text-xs text-slate-400 italic py-6 text-center">
                          No teaching sessions
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {day.classes.map((cls, idx) => (
                            <div
                              key={idx}
                              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 text-[10px] font-extrabold">
                                  {cls.offeringCode}
                                </span>
                                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>
                                    {cls.startTime.substring(0, 5)} - {cls.endTime.substring(0, 5)}
                                  </span>
                                </div>
                              </div>

                              <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                                {cls.courseName}
                              </h4>

                              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                                <span>
                                  Section: {cls.section ? cls.section.replace(/^(section|sec)\s*[-:]?\s*/i, '') : 'A'}
                                </span>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  <span>{cls.classroom}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
