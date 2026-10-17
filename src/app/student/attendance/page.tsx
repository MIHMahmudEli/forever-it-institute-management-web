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
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

export default function StudentAttendancePage() {
  const [data, setData] = useState<StudentAttendanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.studentPortal.getAttendance();
      setData(res);
    } catch (err: any) {
      setError(err?.message || 'Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const isLowAttendance = (data?.attendancePercentage ?? 100) < 75 && (data?.totalSessions ?? 0) >= 3;

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-300" />
                <span>Attendance Tracking & Compliance</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                My Attendance Report
              </h1>
              <p className="text-emerald-100/90 text-sm mt-1">
                Real-time per-class attendance log, percentage standing, and absence alerts
              </p>
            </div>
            <button
              onClick={loadAttendance}
              className="self-start md:self-auto px-4 py-2 bg-white/15 hover:bg-white/25 active:scale-95 text-white rounded-xl text-xs font-bold transition-all border border-white/20 shadow-xs cursor-pointer"
            >
              Refresh Attendance
            </button>
          </div>
        </div>

        {/* Low Attendance Alert */}
        {isLowAttendance && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3 shadow-xs animate-shake">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold">Low Attendance Notice (Below 75%)</h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Your current attendance is {data?.attendancePercentage}%. Forever IT Institute requires a minimum of 75% attendance to qualify for course completion certification and placement assistance.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Attendance Metrics KPI Cards */}
        {data && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Overall Rate */}
            <div className="col-span-2 sm:col-span-1 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Attendance Rate
              </span>
              <div className="my-2">
                <span
                  className={`text-3xl font-black ${
                    data.attendancePercentage >= 75
                      ? 'text-emerald-700'
                      : data.attendancePercentage >= 60
                      ? 'text-amber-600'
                      : 'text-red-600'
                  }`}
                >
                  {data.attendancePercentage}%
                </span>
              </div>
              <span className="text-[11px] text-slate-500">
                Goal: &ge; 75% required
              </span>
            </div>

            {/* Total Classes */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                Classes Held
              </span>
              <span className="text-3xl font-black text-slate-900 my-2">
                {data.totalSessions}
              </span>
              <span className="text-[11px] text-slate-500">Recorded sessions</span>
            </div>

            {/* Present */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-800">
                Present
              </span>
              <span className="text-3xl font-black text-emerald-700 my-2">
                {data.presentCount}
              </span>
              <span className="text-[11px] text-emerald-600 font-semibold">On time attendance</span>
            </div>

            {/* Late */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-800">
                Late
              </span>
              <span className="text-3xl font-black text-amber-600 my-2">
                {data.lateCount}
              </span>
              <span className="text-[11px] text-amber-600 font-semibold">Late arrivals (50% wt)</span>
            </div>

            {/* Absent */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-800">
                Absent
              </span>
              <span className="text-3xl font-black text-red-600 my-2">
                {data.absentCount}
              </span>
              <span className="text-[11px] text-red-600 font-semibold">Missed classes</span>
            </div>
          </div>
        )}

        {/* Chronological Session History */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
          <h3 className="text-base font-extrabold text-slate-900 mb-4">
            Session-by-Session Records
          </h3>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-xl" />
              ))}
            </div>
          ) : !data?.records || data.records.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <CheckSquare className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold">No attendance sessions recorded yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.records.map((rec) => (
                <div
                  key={rec.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 -mx-3 px-3 rounded-xl transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-extrabold text-[10px] text-slate-700">
                        {rec.offeringCode}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {rec.sessionTitle}
                      </h4>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {rec.sessionDate}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {rec.startTime.substring(0, 5)} - {rec.endTime.substring(0, 5)}
                      </span>
                      {rec.classroom && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            {rec.classroom}
                          </span>
                        </>
                      )}
                    </div>

                    {rec.remarks && (
                      <p className="text-xs text-slate-600 italic mt-0.5">
                        Remarks: {rec.remarks}
                      </p>
                    )}
                  </div>

                  {/* Status Tag */}
                  <span
                    className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shrink-0 ${
                      rec.status === 'PRESENT'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : rec.status === 'LATE'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : rec.status === 'EXCUSED'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    {rec.status}
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
