'use client';

import React, { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, RoutineResponse, RoutineDay, RoutineClass } from '@/lib/api/api-client';
import RoutineProVisualizer from '@/components/academic/RoutineProVisualizer';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  AlertCircle,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react';

export default function StudentRoutinePage() {
  const [data, setData] = useState<RoutineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'routinepro' | 'agenda'>('routinepro');

  useEffect(() => {
    loadRoutine();
  }, []);

  const loadRoutine = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.studentPortal.getRoutine();
      setData(res);
      // Default to today (index 0)
      setSelectedDayIndex(0);
    } catch (err: any) {
      setError(err?.message || 'Failed to load routine');
    } finally {
      setLoading(false);
    }
  };

  // Extract deduplicated weekly classes with dayOfWeek for RoutinePro visualizer
  const weeklyClasses = useMemo(() => {
    if (!data?.rollingWindow) return [];
    const map = new Map<string, RoutineClass>();
    data.rollingWindow.forEach((day) => {
      day.classes.forEach((cls) => {
        const key = `${cls.offeringCode || cls.courseName}-${day.dayOfWeek}-${cls.startTime}`;
        if (!map.has(key)) {
          map.set(key, {
            ...cls,
            dayOfWeek: day.dayOfWeek,
          });
        }
      });
    });
    return Array.from(map.values());
  }, [data]);

  const selectedDay: RoutineDay | undefined = data?.rollingWindow?.[selectedDayIndex];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                <span>Weekly Schedule • Asia/Dhaka (UTC+6)</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                My Class Routine
              </h1>
              <p className="text-emerald-100/90 text-sm mt-1">
                Visual weekly timetable and rolling 7-day academic routine
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
                  onClick={() => setViewMode('agenda')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewMode === 'agenda'
                      ? 'bg-white text-emerald-950 shadow-sm'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Daily Agenda</span>
                </button>
              </div>

              <button
                onClick={loadRoutine}
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
            {/* View 1: RoutinePro Grid View */}
            {viewMode === 'routinepro' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <RoutineProVisualizer
                  classes={weeklyClasses}
                  academicSession="FALL 2026-2027"
                  role="student"
                  title="My Academic Routine"
                />
              </div>
            )}

            {/* View 2: Daily Agenda Strip & Cards View */}
            {viewMode === 'agenda' && data?.rollingWindow && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 7-Day Date Strip Switcher */}
                <div className="bg-white rounded-2xl p-2.5 shadow-sm border border-slate-200 overflow-x-auto scrollbar-none">
                  <div className="flex items-center gap-2 min-w-max">
                    {data.rollingWindow.map((day, idx) => {
                      const isSelected = selectedDayIndex === idx;
                      const dayDate = new Date(day.date + 'T00:00:00');
                      const displayMonth = dayDate.toLocaleDateString('en-US', { month: 'short' });
                      const displayDayNum = dayDate.getDate();

                      return (
                        <button
                          key={day.date}
                          onClick={() => setSelectedDayIndex(idx)}
                          className={`flex flex-col items-center justify-center px-4 py-3 rounded-xl transition-all cursor-pointer text-center relative ${
                            isSelected
                              ? 'bg-[#006838] text-white shadow-md shadow-emerald-900/20 scale-[1.02]'
                              : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`text-[11px] font-bold uppercase tracking-wider ${
                                isSelected ? 'text-emerald-200' : 'text-slate-500'
                              }`}
                            >
                              {day.isToday ? 'Today' : day.dayName.substring(0, 3)}
                            </span>
                            {day.isToday && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            )}
                          </div>
                          <span className="text-lg font-black my-0.5">
                            {displayDayNum} {displayMonth}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : day.classesCount > 0
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {day.classesCount} {day.classesCount === 1 ? 'Class' : 'Classes'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Day View */}
                {selectedDay && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">
                          {selectedDay.isToday ? "Today's Schedule" : `${selectedDay.dayName} Schedule`}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          ({selectedDay.date})
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        {selectedDay.classesCount} session{selectedDay.classesCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {selectedDay.classesCount === 0 ? (
                      <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-slate-300">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                          <Calendar className="w-6 h-6" />
                        </div>
                        <h3 className="text-base font-bold text-slate-800">No Classes Scheduled</h3>
                        <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                          You have no academic class sessions scheduled for this day. Enjoy your free time or review past material!
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedDay.classes.map((cls, idx) => (
                          <div
                            key={idx}
                            className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-3">
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200/60 text-xs font-extrabold tracking-wide">
                                  {cls.offeringCode}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                                  <span>
                                    {cls.startTime} - {cls.endTime}
                                  </span>
                                </div>
                              </div>

                              <h3 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                                {cls.courseName}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                                <span className="font-semibold text-slate-700">Section: {cls.section}</span>
                                {cls.sessionNumber && (
                                  <>
                                    <span>•</span>
                                    <span className="text-emerald-700 font-semibold">
                                      Session #{cls.sessionNumber}
                                    </span>
                                  </>
                                )}
                              </div>

                              {cls.topic && (
                                <p className="mt-2.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                  <span className="font-bold text-slate-700">Topic: </span>
                                  {cls.topic}
                                </p>
                              )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col gap-2">
                              <div className="flex items-center justify-between text-xs text-slate-600">
                                <div className="flex items-center gap-1.5 truncate">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate font-medium">{cls.classroom}</span>
                                </div>
                                <div className="flex items-center gap-1.5 truncate">
                                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate font-medium">{cls.teacherName}</span>
                                </div>
                              </div>

                              {cls.attendanceStatus && (
                                <div className="mt-1 flex items-center justify-between">
                                  <span className="text-[11px] text-slate-500 font-medium">My Attendance:</span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                      cls.attendanceStatus === 'PRESENT'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : cls.attendanceStatus === 'LATE'
                                        ? 'bg-amber-100 text-amber-800'
                                        : cls.attendanceStatus === 'EXCUSED'
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                  >
                                    {cls.attendanceStatus}
                                  </span>
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
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
