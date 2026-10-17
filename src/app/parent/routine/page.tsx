'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api } from '@/lib/api/api-client';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  HeartHandshake,
  AlertCircle,
} from 'lucide-react';

const DAYS = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

export default function ParentRoutinePage() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [routine, setRoutine] = useState<any[]>([]);
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
        await loadTimetable(firstId);
      }
    } catch (err: any) {
      console.error('Failed to load children', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTimetable = async (studentId: string) => {
    try {
      const res = await api.parentPortal.getChildTimetable(studentId);
      setRoutine(res.routine || []);
    } catch (err: any) {
      console.error('Failed to load child routine', err);
    }
  };

  const handleSelectChild = async (studentId: string) => {
    setSelectedStudentId(studentId);
    await loadTimetable(studentId);
  };

  const routineByDay = DAYS.map((dayName, dayIndex) => {
    const classes = routine.filter((r) => r.dayOfWeek === dayIndex);
    return {
      dayName,
      dayIndex,
      classes,
    };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
                <Calendar className="w-3.5 h-3.5 text-emerald-300" />
                <span>Student Academic Routine • Asia/Dhaka</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Child Class Routine</h1>
              <p className="text-emerald-100/90 text-sm mt-1">
                Weekly scheduled timetable, classroom locations, and instructors
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                  <p className="text-xs text-slate-400 italic py-6 text-center">No scheduled classes</p>
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
                            <span>{cls.startTime.substring(0, 5)} - {cls.endTime.substring(0, 5)}</span>
                          </div>
                        </div>

                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                          {cls.courseName}
                        </h4>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{cls.teacherName}</span>
                          </div>
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
      </div>
    </DashboardLayout>
  );
}
