'use client';

import React, { useMemo, useState, useRef } from 'react';
import { RoutineClass } from '@/lib/api/api-client';
import {
  Calendar,
  Clock,
  Printer,
  Sparkles,
  Maximize2,
  Minimize2,
  MapPin,
  User,
  BookOpen,
  Info,
  X,
  ExternalLink,
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

// Aesthetic Neon/Modern Palettes matching RoutinePro screenshot
const THEME_ACCENTS = [
  {
    stripe: 'bg-[#00a8ff]',
    border: 'border-[#00a8ff]/40',
    glow: 'shadow-[0_0_15px_rgba(0,168,255,0.15)]',
    textAccent: 'text-[#00a8ff]',
    tag: 'bg-[#00a8ff]/15 text-[#38bdf8] border-[#00a8ff]/30',
    barColor: '#00a8ff',
  },
  {
    stripe: 'bg-[#00e599]',
    border: 'border-[#00e599]/40',
    glow: 'shadow-[0_0_15px_rgba(0,229,153,0.15)]',
    textAccent: 'text-[#00e599]',
    tag: 'bg-[#00e599]/15 text-[#34d399] border-[#00e599]/30',
    barColor: '#00e599',
  },
  {
    stripe: 'bg-[#a855f7]',
    border: 'border-[#a855f7]/40',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.15)]',
    textAccent: 'text-[#c084fc]',
    tag: 'bg-[#a855f7]/15 text-[#c084fc] border-[#a855f7]/30',
    barColor: '#a855f7',
  },
  {
    stripe: 'bg-[#f59e0b]',
    border: 'border-[#f59e0b]/40',
    glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]',
    textAccent: 'text-[#fbbf24]',
    tag: 'bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30',
    barColor: '#f59e0b',
  },
  {
    stripe: 'bg-[#ec4899]',
    border: 'border-[#ec4899]/40',
    glow: 'shadow-[0_0_15px_rgba(236,72,153,0.15)]',
    textAccent: 'text-[#f472b6]',
    tag: 'bg-[#ec4899]/15 text-[#f472b6] border-[#ec4899]/30',
    barColor: '#ec4899',
  },
  {
    stripe: 'bg-[#06b6d4]',
    border: 'border-[#06b6d4]/40',
    glow: 'shadow-[0_0_15px_rgba(6,182,212,0.15)]',
    textAccent: 'text-[#22d3ee]',
    tag: 'bg-[#06b6d4]/15 text-[#22d3ee] border-[#06b6d4]/30',
    barColor: '#06b6d4',
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

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  return h * 60 + m;
}

export default function RoutineProVisualizer({
  classes = [],
  academicSession = 'FALL 2026-2027',
  role = 'student',
  title = 'Academic Routine',
  subtitle,
}: RoutineProVisualizerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'ALL'>('ALL');
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

  // Calculate total weekly class minutes
  const totalWeeklyMinutes = useMemo(() => {
    return classes.reduce((sum, cls) => {
      const start = timeToMinutes(cls.startTime);
      const end = timeToMinutes(cls.endTime);
      return sum + Math.max(0, end - start);
    }, 0);
  }, [classes]);

  const totalHours = Math.floor(totalWeeklyMinutes / 60);
  const remMinutes = totalWeeklyMinutes % 60;
  const waitingLabel =
    totalHours > 0
      ? `${totalHours}H ${remMinutes > 0 ? `${remMinutes}M` : ''}`
      : `${totalWeeklyMinutes}M`;

  // Dynamically calculate time rows based on classes (min: 08:00 AM, max: 07:00 PM or later)
  const timeRows = useMemo(() => {
    let minHour = 8;
    let maxHour = 19;
    classes.forEach((c) => {
      if (c.startTime) {
        const h = parseInt(c.startTime.split(':')[0], 10);
        if (!isNaN(h)) {
          if (h < minHour) minHour = Math.max(6, h);
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

  // Filter days
  const filteredDays = useMemo(() => {
    if (selectedDayFilter === 'ALL') {
      return DAYS;
    }
    return DAYS.filter((d) => d.val === selectedDayFilter);
  }, [selectedDayFilter]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      ref={containerRef}
      className={`routine-pro-wrapper transition-all duration-300 font-sans ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-[#070b12] text-white p-6 overflow-auto'
          : 'bg-[#080d1a] text-slate-100 rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden'
      }`}
    >
      {/* RoutinePro Top Bar Header */}
      <div className="p-6 md:p-8 border-b border-slate-800/80 bg-[#060a14] relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left Stats: Weekly Load / Time */}
          <div className="space-y-0.5">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              WEEKLY LOAD / TIME
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl md:text-4xl font-black text-white tracking-tight">
                {waitingLabel}
              </span>
              <span className="text-xs font-bold text-slate-400">
                ({classes.length} {classes.length === 1 ? 'class' : 'classes'} / week)
              </span>
            </div>
          </div>

          {/* Center Action Toolbar & Day Filters */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
            {/* Day Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto max-w-full">
              <button
                onClick={() => setSelectedDayFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  selectedDayFilter === 'ALL'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                ALL
              </button>
              {DAYS.map((d) => (
                <button
                  key={d.val}
                  onClick={() => setSelectedDayFilter(d.val)}
                  className={`px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedDayFilter === d.val
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {d.code}
                </button>
              ))}
            </div>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700/60 shadow-xs"
              title="Print Schedule"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer border border-slate-700/60 shadow-xs"
              title={isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Right Stats: Academic Session */}
          <div className="space-y-0.5 text-left sm:text-right">
            <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
              ACADEMIC SESSION
            </span>
            <div className="text-xl md:text-2xl font-black text-[#00e599] tracking-wide">
              {academicSession}
            </div>
          </div>
        </div>
      </div>

      {/* RoutinePro Timetable Board */}
      <div className="p-4 md:p-8 overflow-x-auto">
        <div
          className={selectedDayFilter === 'ALL' ? 'min-w-[850px]' : 'min-w-full'}
        >
          {/* Days Header Row */}
          <div
            className="grid border-b border-slate-800/80 pb-4 mb-4 gap-2"
            style={{
              gridTemplateColumns:
                selectedDayFilter === 'ALL'
                  ? '90px repeat(7, minmax(110px, 1fr))'
                  : '90px minmax(260px, 1fr)',
            }}
          >
            <div className="text-center font-bold text-xs uppercase text-slate-500 flex items-center justify-center">
              TIME
            </div>
            {filteredDays.map((day) => {
              const dayClasses = classes.filter((c) => c.dayOfWeek === day.val);
              const hasClasses = dayClasses.length > 0;
              return (
                <div key={day.code} className="text-center py-1">
                  <span
                    className={`text-sm md:text-base font-black tracking-widest ${
                      hasClasses ? 'text-white' : 'text-slate-500'
                    }`}
                  >
                    {day.code}
                  </span>
                  {hasClasses && (
                    <span className="block text-[10px] text-emerald-400 font-bold uppercase mt-0.5">
                      {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Time Rows & Class Placements */}
          <div className="space-y-4">
            {timeRows.map((timeRow) => {
              // Find classes that start in this hour window (e.g., 10:00 to 10:59)
              const classesInHour = classes.filter((cls) => {
                const startHour = parseInt(cls.startTime?.split(':')[0], 10);
                return startHour === timeRow.hour;
              });

              return (
                <div
                  key={timeRow.hour}
                  className="grid min-h-[96px] border-b border-slate-800/40 relative group gap-2"
                  style={{
                    gridTemplateColumns:
                      selectedDayFilter === 'ALL'
                        ? '90px repeat(7, minmax(110px, 1fr))'
                        : '90px minmax(260px, 1fr)',
                  }}
                >
                  {/* Y-Axis Time Label (Left) */}
                  <div className="pr-3 pt-2 font-bold text-xs text-slate-400 font-mono tracking-wider select-none">
                    {timeRow.label}
                  </div>

                  {/* Day Columns for this time slot */}
                  {filteredDays.map((day) => {
                    const matchingClasses = classesInHour.filter(
                      (cls) => cls.dayOfWeek === day.val
                    );

                    return (
                      <div
                        key={day.code}
                        className="px-1.5 py-1 border-l border-slate-800/30 min-h-[96px] flex flex-col justify-start gap-2 relative"
                      >
                        {matchingClasses.map((cls, cIdx) => {
                          const theme =
                            courseThemeMap.get(cls.offeringCode || cls.courseName) ||
                            THEME_ACCENTS[0];

                          return (
                            <div
                              key={cIdx}
                              onClick={() => setActiveModalClass(cls)}
                              className={`relative group/card bg-[#0b1322] hover:bg-[#111c33] rounded-2xl p-3.5 border border-slate-800 transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-lg cursor-pointer hover:scale-[1.02] ${theme.glow}`}
                              style={{
                                borderLeft: `3.5px solid ${theme.barColor}`,
                              }}
                            >
                              {/* Top: Course Title & Time */}
                              <div className="space-y-1">
                                <h4 className="text-xs md:text-[13px] font-black uppercase text-white tracking-wide leading-snug line-clamp-2">
                                  {cls.courseName}
                                </h4>
                                <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-300 font-mono">
                                  <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                  <span>
                                    {format12h(cls.startTime)} - {format12h(cls.endTime)}
                                  </span>
                                </div>

                                {role !== 'teacher' && cls.teacherName && (
                                  <p className="text-[10px] text-slate-400 font-semibold truncate pt-0.5">
                                    {cls.teacherName}
                                  </p>
                                )}
                              </div>

                              {/* Bottom: Section & Room */}
                              <div className="pt-2 mt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-mono font-bold">
                                <span className="uppercase text-slate-300 tracking-wider">
                                  {cls.section || 'SEC A'}
                                </span>
                                <span className="uppercase text-slate-400 tracking-wider">
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
            <div className="p-16 text-center text-slate-500 space-y-2">
              <Calendar className="w-10 h-10 mx-auto opacity-30 text-emerald-400" />
              <p className="text-sm font-bold text-slate-400">No scheduled classes found</p>
              <p className="text-xs text-slate-600">
                Enroll or assign courses to automatically generate your visual RoutinePro timetable.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* RoutinePro Branding & Footer */}
      <div className="p-4 md:p-6 border-t border-slate-800/80 bg-[#060a14] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-extrabold uppercase tracking-widest text-[11px] text-slate-300">
            GENERATED VIA FOREVER IT INSTITUTE • ROUTINEPRO
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono">
          <span>TIMEZONE: ASIA/DHAKA (UTC+6)</span>
          <span>•</span>
          <span>CAMPUS PORTAL</span>
        </div>
      </div>

      {/* Modal Dialog for Card Details */}
      {activeModalClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
          <div className="bg-[#0b1322] border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl relative space-y-5">
            <button
              onClick={() => setActiveModalClass(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider">
                {activeModalClass.offeringCode}
              </span>
              <h3 className="text-xl font-black text-white mt-2 leading-tight">
                {activeModalClass.courseName}
              </h3>
              <p className="text-xs text-slate-400">
                Section: <span className="font-bold text-white">{activeModalClass.section}</span>
                {activeModalClass.sessionNumber && (
                  <span> • Session #{activeModalClass.sessionNumber}</span>
                )}
              </p>
            </div>

            <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Class Timing</span>
                  <span className="font-bold text-slate-200">
                    {format12h(activeModalClass.startTime)} - {format12h(activeModalClass.endTime)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Classroom / Lab</span>
                  <span className="font-bold text-slate-200">
                    {activeModalClass.classroom || 'Main Lab Room'}
                  </span>
                </div>
              </div>

              {activeModalClass.teacherName && (
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Course Instructor</span>
                    <span className="font-bold text-slate-200">{activeModalClass.teacherName}</span>
                  </div>
                </div>
              )}

              {activeModalClass.topic && (
                <div className="flex items-start gap-3 pt-1 border-t border-slate-800">
                  <BookOpen className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Session Topic</span>
                    <span className="text-slate-300 font-medium">{activeModalClass.topic}</span>
                  </div>
                </div>
              )}

              {activeModalClass.attendanceStatus && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-800">
                  <span className="text-slate-400 text-[10px] uppercase font-bold">Attendance Record</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {activeModalClass.attendanceStatus}
                  </span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveModalClass(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-all"
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
