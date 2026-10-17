'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, ClassSession } from '@/lib/api/api-client';
import {
  CheckSquare,
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Save,
  Users,
} from 'lucide-react';

export default function TeacherAttendanceMarkingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const offeringId = resolvedParams.id;

  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [sessionAttendance, setSessionAttendance] = useState<any>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: string; remarks: string }>>({});
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    loadSessions();
  }, [offeringId]);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const res = await api.teacherPortal.getCourseSessions(offeringId);
      setSessions(res);
      if (res.length > 0) {
        setSelectedSessionId(res[0].id);
        await loadSessionAttendance(res[0].id);
      }
    } catch (err: any) {
      console.error('Failed to load course sessions', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadSessionAttendance = async (sessionId: string) => {
    try {
      setLoadingAttendance(true);
      setSaveSuccess(false);
      const res = await api.attendance.getSession(sessionId);
      setSessionAttendance(res);

      // Pre-fill state map
      const map: Record<string, { status: string; remarks: string }> = {};
      (res.students || []).forEach((st: any) => {
        map[st.studentId] = {
          status: st.status || 'PRESENT',
          remarks: st.remarks || '',
        };
      });
      setAttendanceMap(map);
    } catch (err: any) {
      console.error('Failed to load session attendance', err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleSelectSession = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    await loadSessionAttendance(sessionId);
  };

  const setStatus = (studentId: string, status: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const markAllPresent = () => {
    setAttendanceMap((prev) => {
      const next: Record<string, any> = {};
      for (const stId of Object.keys(prev)) {
        next[stId] = { ...prev[stId], status: 'PRESENT' };
      }
      return next;
    });
  };

  const saveAttendance = async () => {
    try {
      setSaving(true);
      setSaveSuccess(false);

      const records = Object.entries(attendanceMap).map(([studentId, val]) => ({
        studentId,
        status: val.status,
        remarks: val.remarks || null,
      }));

      await api.teacherPortal.markSessionAttendance(selectedSessionId, records);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      await loadSessionAttendance(selectedSessionId);
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/courses"
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900">
                Class Attendance Management
              </h1>
              <p className="text-xs text-slate-500">
                Mark, update, and submit attendance for scheduled offering sessions
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={markAllPresent}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              Mark All Present
            </button>
            <button
              onClick={saveAttendance}
              disabled={saving || !selectedSessionId}
              className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00502a] text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-sm font-bold">Attendance successfully saved and submitted!</p>
          </div>
        )}

        {/* Session Selector Strip */}
        <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
              Select Class Session
            </span>
            <span className="text-xs text-slate-500">
              Total {sessions.length} sessions
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {sessions.map((s) => {
              const isSelected = s.id === selectedSessionId;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSelectSession(s.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex flex-col items-center ${
                    isSelected
                      ? 'bg-[#006838] text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <span className="text-[10px] uppercase tracking-wide opacity-80">
                    Session #{s.sessionNumber}
                  </span>
                  <span className="font-extrabold">{s.sessionDate}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Session Info Card */}
        {selectedSession && (
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">{selectedSession.title}</h3>
              <div className="flex items-center gap-3 text-xs text-slate-600 mt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {selectedSession.sessionDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {selectedSession.startTime?.substring(0, 5)} - {selectedSession.endTime?.substring(0, 5)}
                </span>
                {selectedSession.classroom && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {selectedSession.classroom}
                    </span>
                  </>
                )}
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-extrabold text-slate-700 self-start sm:self-center">
              Status: {selectedSession.status}
            </span>
          </div>
        )}

        {/* Students Marking Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-center">Attendance Status</th>
                  <th className="py-3.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loadingAttendance ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">Loading student attendance list...</td>
                  </tr>
                ) : !sessionAttendance?.students || sessionAttendance.students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">No students enrolled in this offering.</td>
                  </tr>
                ) : (
                  sessionAttendance.students.map((st: any) => {
                    const currentStatus = attendanceMap[st.studentId]?.status || 'PRESENT';

                    return (
                      <tr key={st.studentId} className="hover:bg-slate-50/50">
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-slate-900">{st.fullName}</p>
                          <p className="text-[11px] font-mono text-emerald-800">{st.registrationNumber}</p>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          <p>{st.mobileNumber}</p>
                          <p className="text-[11px] text-slate-400">{st.email}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Present Button */}
                            <button
                              type="button"
                              onClick={() => setStatus(st.studentId, 'PRESENT')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                currentStatus === 'PRESENT'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800'
                              }`}
                            >
                              Present
                            </button>

                            {/* Late Button */}
                            <button
                              type="button"
                              onClick={() => setStatus(st.studentId, 'LATE')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                currentStatus === 'LATE'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-800'
                              }`}
                            >
                              Late
                            </button>

                            {/* Excused Button */}
                            <button
                              type="button"
                              onClick={() => setStatus(st.studentId, 'EXCUSED')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                currentStatus === 'EXCUSED'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-800'
                              }`}
                            >
                              Excused
                            </button>

                            {/* Absent Button */}
                            <button
                              type="button"
                              onClick={() => setStatus(st.studentId, 'ABSENT')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                currentStatus === 'ABSENT'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-800'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <input
                            type="text"
                            placeholder="Optional note..."
                            value={attendanceMap[st.studentId]?.remarks || ''}
                            onChange={(e) =>
                              setAttendanceMap((prev) => ({
                                ...prev,
                                [st.studentId]: {
                                  ...prev[st.studentId],
                                  remarks: e.target.value,
                                },
                              }))
                            }
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs w-full max-w-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
