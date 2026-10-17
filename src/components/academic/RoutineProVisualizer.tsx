'use client';

import React, { useMemo, useState } from 'react';
import { RoutineClass } from '@/lib/api/api-client';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  BookOpen,
  X,
  CheckCircle2,
} from 'lucide-react';

interface RoutineProVisualizerProps {
  classes: RoutineClass[];
  academicSession?: string;
  weeklyLoadMinutes?: number;
  role?: 'student' | 'teacher' | 'parent';
  title?: string;
  subtitle?: string;
}

const DAYS = [
  { val: 0, code: 'SUN', name: 'Sunday' },
  { val: 1, code: 'MON', name: 'Monday' },
  { val: 2, code: 'TUE', name: 'Tuesday' },
  { val: 3, code: 'WED', name: 'Wednesday' },
  { val: 4, code: 'THU', name: 'Thursday' },
  { val: 5, code: 'FRI', name: 'Friday' },
  { val: 6, code: 'SAT', name: 'Saturday' },
];

// Clean, consistent, elegant portal color themes (light & refined)
const THEME_ACCENTS = [
  {
    cardBg: 'bg-emerald-50/70 hover:bg-emerald-50',
    border: 'border-emerald-200/80',
    leftStripe: '#006838',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    accentText: 'text-[#006838]',
  },
  {
    cardBg: 'bg-sky-50/70 hover:bg-sky-50',
    border: 'border-sky-200/80',
    leftStripe: '#0284c7',
    badge: 'bg-sky-100 text-sky-900 border-sky-200',
    accentText: 'text-sky-700',
  },
  {
    cardBg: 'bg-indigo-50/70 hover:bg-indigo-50',
    border: 'border-indigo-200/80',
    leftStripe: '#4f46e5',
    badge: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    accentText: 'text-indigo-700',
  },
  {
    cardBg: 'bg-amber-50/70 hover:bg-amber-50',
    border: 'border-amber-200/80',
    leftStripe: '#d97706',
    badge: 'bg-amber-100 text-amber-900 border-amber-200',
    accentText: 'text-amber-800',
  },
  {
    cardBg: 'bg-purple-50/70 hover:bg-purple-50',
    border: 'border-purple-200/80',
    leftStripe: '#9333ea',
    badge: 'bg-purple-100 text-purple-900 border-purple-200',
    accentText: 'text-purple-700',
  },
  {
    cardBg: 'bg-teal-50/70 hover:bg-teal-50',
    border: 'border-teal-200/80',
    leftStripe: '#0d9488',
    badge: 'bg-teal-100 text-teal-900 border-teal-200',
    accentText: 'text-teal-700',
  },
  {
    cardBg: 'bg-rose-50/70 hover:bg-rose-50',
    border: 'border-rose-200/80',
    leftStripe: '#e11d48',
    badge: 'bg-rose-100 text-rose-900 border-rose-200',
    accentText: 'text-rose-700',
  },
];

function format12h(timeStr: string): string {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  let h = parseInt(parts[0], 10);
  const m = parts[1] || '00';
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m.padStart(2, '0')} ${ampm}`;
}

export default function RoutineProVisualizer({
  classes = [],
  academicSession,
  role = 'student',
  title = 'Weekly Routine',
  subtitle,
}: RoutineProVisualizerProps) {
  const [activeModalClass, setActiveModalClass] = useState<RoutineClass | null>(null);

  // Dynamic course colors mapping
  const courseThemeMap = useMemo(() => {
    const map = new Map<string, typeof THEME_ACCENTS[0]>();
    let colorIdx = 0;
    classes.forEach((c) => {
      const key = c.offeringCode || c.courseName;
      if (!map.has(key)) {
        map.set(key, THEME_ACCENTS[colorIdx % THEME_ACCENTS.length]);
        colorIdx++;
      }
    });
    return map;
  }, [classes]);

  // Dynamically calculate time rows based on classes (min: 08:00 AM, max: 07:00 PM or later)
  const timeRows = useMemo(() => {
    let minHour = 8;
    let maxHour = 19;
    classes.forEach((c) => {
      if (c.startTime) {
        const h = parseInt(c.startTime.split(':')[0], 10);
        if (!isNaN(h)) {
          if (h < minHour) minHour = Math.max(7, h);
          if (h > maxHour) maxHour = Math.min(22, h);
        }
      }
    });
    const rows: { label: string; hour: number }[] = [];
    for (let h = minHour; h <= maxHour; h++) {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const displayH = h % 12 === 0 ? 12 : h % 12;
      rows.push({
        hour: h,
        label: `${String(displayH).padStart(2, '0')}:00 ${ampm}`,
      });
    }
    return rows;
  }, [classes]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Clean, Elegant Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#006838] flex items-center justify-center font-bold shadow-2xs">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
            <p className="text-[11px] text-slate-500 font-medium">
              {subtitle || 'Visual weekly routine and time distribution'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {academicSession && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-lg bg-emerald-50 text-[#006838] text-[11px] font-bold border border-emerald-200/60">
              {academicSession}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>
              {classes.length} {classes.length === 1 ? 'class' : 'classes'} / week
            </span>
          </span>
        </div>
      </div>

      {/* Routine Timetable Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Days Header Row */}
          <div className="grid grid-cols-[80px_repeat(7,1fr)] bg-slate-50/90 border-b border-slate-200 text-center">
            <div className="py-2.5 font-bold text-[11px] uppercase tracking-wider text-slate-400 border-r border-slate-200/80 flex items-center justify-center">
              TIME
            </div>
            {DAYS.map((day, idx) => {
              const dayClasses = classes.filter((c) => c.dayOfWeek === day.val);
              const hasClasses = dayClasses.length > 0;
              return (
                <div
                  key={day.code}
                  className={`py-2 px-1 text-center ${
                    idx < 6 ? 'border-r border-slate-200/60' : ''
                  }`}
                >
                  <span
                    className={`text-xs font-bold tracking-wider ${
                      hasClasses ? 'text-slate-800' : 'text-slate-400'
                    }`}
                  >
                    {day.code}
                  </span>
                  {hasClasses ? (
                    <span className="block text-[9.5px] text-[#006838] font-semibold mt-0.5">
                      {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                    </span>
                  ) : (
                    <span className="block text-[9.5px] text-slate-400 font-medium mt-0.5">
                      —
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time Rows & Class Placements */}
          <div>
            {timeRows.map((timeRow, rIdx) => {
              const classesInHour = classes.filter((cls) => {
                const startHour = parseInt(cls.startTime?.split(':')[0], 10);
                return startHour === timeRow.hour;
              });

              return (
                <div
                  key={timeRow.hour}
                  className={`grid grid-cols-[80px_repeat(7,1fr)] min-h-[76px] ${
                    rIdx < timeRows.length - 1 ? 'border-b border-slate-100' : ''
                  }`}
                >
                  {/* Left Time Label */}
                  <div className="px-2 pt-2 text-right pr-3 font-mono font-medium text-[11px] text-slate-400 border-r border-slate-200/80 bg-slate-50/40 select-none">
                    {timeRow.label}
                  </div>

                  {/* Day Columns */}
                  {DAYS.map((day, dIdx) => {
                    const matchingClasses = classesInHour.filter(
                      (cls) => cls.dayOfWeek === day.val
                    );

                    return (
                      <div
                        key={day.code}
                        className={`p-1.5 flex flex-col justify-start gap-1.5 ${
                          dIdx < 6 ? 'border-r border-slate-100' : ''
                        } hover:bg-slate-50/40 transition-colors`}
                      >
                        {matchingClasses.map((cls, cIdx) => {
                          const theme =
                            courseThemeMap.get(cls.offeringCode || cls.courseName) ||
                            THEME_ACCENTS[0];

                          return (
                            <div
                              key={cIdx}
                              onClick={() => setActiveModalClass(cls)}
                              className={`group/card rounded-xl p-2 border transition-all duration-150 flex flex-col justify-between cursor-pointer hover:shadow-xs active:scale-[0.99] ${theme.cardBg} ${theme.border}`}
                              style={{
                                borderLeft: `3px solid ${theme.leftStripe}`,
                              }}
                            >
                              {/* Course Title & Code */}
                              <div className="space-y-0.5">
                                <h4 className="text-[11px] font-bold uppercase text-slate-900 tracking-tight leading-snug line-clamp-2">
                                  {cls.courseName}
                                </h4>
                                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-600 font-mono">
                                  <Clock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                  <span>
                                    {format12h(cls.startTime)} - {format12h(cls.endTime)}
                                  </span>
                                </div>

                                {role !== 'teacher' && cls.teacherName && (
                                  <p className="text-[9.5px] text-slate-500 font-medium truncate pt-0.5">
                                    {cls.teacherName}
                                  </p>
                                )}
                              </div>

                              {/* Section & Room */}
                              <div className="pt-1 mt-1 border-t border-slate-200/50 flex items-center justify-between text-[9px] font-mono font-semibold text-slate-500">
                                <span className="uppercase">
                                  {cls.section ? `SEC ${cls.section}` : 'SEC A'}
                                </span>
                                <span className="uppercase">
                                  {cls.classroom ? `RM ${cls.classroom}` : 'RM TBD'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {classes.length === 0 && (
            <div className="p-12 text-center text-slate-500 space-y-1.5">
              <Calendar className="w-8 h-8 mx-auto opacity-30 text-[#006838]" />
              <p className="text-xs font-bold text-slate-600">No scheduled classes found</p>
              <p className="text-[11px] text-slate-400">
                Enroll or assign courses to automatically generate your weekly routine.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Clean, Subtle Footer */}
      <div className="px-5 py-2.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
        <span>Campus Academic Schedule</span>
        <span>Asia/Dhaka (UTC+6)</span>
      </div>

      {/* Clean Modal for Class Details */}
      {activeModalClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 text-slate-900 shadow-xl relative space-y-4">
            <button
              onClick={() => setActiveModalClass(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#006838] border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                {activeModalClass.offeringCode}
              </span>
              <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                {activeModalClass.courseName}
              </h3>
              <p className="text-[11px] text-slate-500">
                Section: <span className="font-semibold text-slate-700">{activeModalClass.section}</span>
                {activeModalClass.sessionNumber && (
                  <span> • Session #{activeModalClass.sessionNumber}</span>
                )}
              </p>
            </div>

            <div className="space-y-2.5 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
              <div className="flex items-center gap-2.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[9.5px] uppercase font-bold">Timing</span>
                  <span className="font-semibold text-slate-800">
                    {format12h(activeModalClass.startTime)} - {format12h(activeModalClass.endTime)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <MapPin className="w-3.5 h-3.5 text-sky-700 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[9.5px] uppercase font-bold">Classroom / Lab</span>
                  <span className="font-semibold text-slate-800">
                    {activeModalClass.classroom || 'Main Lab'}
                  </span>
                </div>
              </div>

              {activeModalClass.teacherName && (
                <div className="flex items-center gap-2.5">
                  <User className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold">Instructor</span>
                    <span className="font-semibold text-slate-800">{activeModalClass.teacherName}</span>
                  </div>
                </div>
              )}

              {activeModalClass.topic && (
                <div className="flex items-start gap-2.5 pt-1 border-t border-slate-200/60">
                  <BookOpen className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[9.5px] uppercase font-bold">Topic</span>
                    <span className="text-slate-700 font-medium">{activeModalClass.topic}</span>
                  </div>
                </div>
              )}

              {activeModalClass.attendanceStatus && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-400 text-[9.5px] uppercase font-bold">Attendance</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {activeModalClass.attendanceStatus}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setActiveModalClass(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
