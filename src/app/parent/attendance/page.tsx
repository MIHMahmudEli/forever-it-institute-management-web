'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, StudentAttendanceReport } from '@/lib/api/api-client';
import {
  CheckSquare,
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';

export default function ParentAttendancePage() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [report, setReport] = useState<StudentAttendanceReport | null>(null);
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
        await loadAttendance(firstId);
      }
    } catch (err: any) {
      console.error('Failed to load children', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAttendance = async (studentId: string) => {
    try {
      const data = await api.parentPortal.getChildAttendance(studentId);
      setReport(data);
    } catch (err: any) {
      console.error('Failed to load child attendance', err);
    }
  };

  const handleSelectChild = async (studentId: string) => {
    setSelectedStudentId(studentId);
    await loadAttendance(studentId);
  };

  const isLowAttendance = (report?.attendancePercentage ?? 100) < 75 && (report?.totalSessions ?? 0) >= 3;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-300" />
                <span>Child Attendance History</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Attendance Standing</h1>
              <p className="text-emerald-100/90 text-sm mt-1">
                Real-time tracking of class presence, tardiness, and absences
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

        {isLowAttendance && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Low Attendance Alert ({report?.attendancePercentage}%)</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Your child&apos;s attendance is currently below the required 75% institute threshold. Regular class participation is mandatory for examination eligibility.
              </p>
            </div>
          </div>
        )}

        {report && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
              <span className="text-xs font-extrabold uppercase text-slate-500">Attendance Rate</span>
              <p className="text-3xl font-black text-emerald-700 my-1">{report.attendancePercentage}%</p>
              <span className="text-[11px] text-slate-500">Overall score</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
              <span className="text-xs font-extrabold uppercase text-slate-500">Present</span>
              <p className="text-3xl font-black text-slate-900 my-1">{report.presentCount}</p>
              <span className="text-[11px] text-emerald-600 font-semibold">On-time classes</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
              <span className="text-xs font-extrabold uppercase text-slate-500">Late</span>
              <p className="text-3xl font-black text-amber-600 my-1">{report.lateCount}</p>
              <span className="text-[11px] text-amber-600 font-semibold">Late arrivals</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
              <span className="text-xs font-extrabold uppercase text-slate-500">Absent</span>
              <p className="text-3xl font-black text-red-600 my-1">{report.absentCount}</p>
              <span className="text-[11px] text-red-600 font-semibold">Unexcused missed</span>
            </div>
          </div>
        )}

        {/* Detailed Records */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 mb-4">Class Session History</h3>
          {!report?.records || report.records.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-8 text-center">No attendance sessions recorded yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {report.records.map((r) => (
                <div key={r.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-mono text-[10px] text-slate-700 font-bold">
                        {r.offeringCode}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{r.sessionTitle}</h4>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>{r.sessionDate}</span>
                      <span>•</span>
                      <span>{r.startTime.substring(0, 5)} - {r.endTime.substring(0, 5)}</span>
                      {r.classroom && <span>• {r.classroom}</span>}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      r.status === 'PRESENT'
                        ? 'bg-emerald-100 text-emerald-800'
                        : r.status === 'LATE'
                        ? 'bg-amber-100 text-amber-800'
                        : r.status === 'EXCUSED'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
