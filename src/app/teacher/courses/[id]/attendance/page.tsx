'use client';

import React, { useEffect, useState, use, useMemo } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, ClassSession, CourseOffering } from '@/lib/api/api-client';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Save,
  Users,
  Plus,
  RefreshCw,
  X,
  Check,
  UserCheck,
  UserX,
} from 'lucide-react';

export default function TeacherAttendanceMarkingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const offeringId = resolvedParams.id;

  const [courseOffering, setCourseOffering] = useState<CourseOffering | null>(null);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [sessionAttendance, setSessionAttendance] = useState<any>(null);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, { status: string; remarks: string }>>({});
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // New Session Modal State
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [creatingSession, setCreatingSession] = useState(false);
  const [newSessionForm, setNewSessionForm] = useState({
    title: '',
    sessionDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:00',
    classroom: 'Lab 1',
    topic: '',
  });

  useEffect(() => {
    loadCourseDetails();
    loadSessions();
  }, [offeringId]);

  const loadCourseDetails = async () => {
    try {
      const off = await api.teacherPortal.getCourse(offeringId);
      setCourseOffering(off);
      if (off.classroom) {
        setNewSessionForm((prev) => ({ ...prev, classroom: off.classroom }));
      }
    } catch (err: any) {
      console.error('Failed to load course details', err);
    }
  };

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      setErrorMessage(null);
      const res = await api.teacherPortal.getCourseSessions(offeringId);
      setSessions(res);
      if (res.length > 0) {
        // Pick today's session if available, else first session
        const todayStr = new Date().toISOString().split('T')[0];
        const todaySession = res.find((s) => s.sessionDate === todayStr);
        const targetId = todaySession ? todaySession.id : res[0].id;
        setSelectedSessionId(targetId);
        await loadSessionAttendance(targetId);
      } else {
        setSelectedSessionId('');
        setSessionAttendance(null);
      }
    } catch (err: any) {
      console.error('Failed to load course sessions', err);
      setErrorMessage(err?.message || 'Failed to load course sessions');
    } finally {
      setLoadingSessions(false);
    }
  };

  const loadSessionAttendance = async (sessionId: string) => {
    try {
      setLoadingAttendance(true);
      setSaveSuccess(false);
      setErrorMessage(null);
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
      setErrorMessage(err?.message || 'Failed to load session attendance');
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

  const setRemarks = (studentId: string, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const markAllStatus = (status: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE') => {
    setAttendanceMap((prev) => {
      const next: Record<string, any> = {};
      for (const stId of Object.keys(prev)) {
        next[stId] = { ...prev[stId], status };
      }
      return next;
    });
  };

  const saveAttendance = async () => {
    if (!selectedSessionId) return;

    try {
      setSaving(true);
      setSaveSuccess(false);
      setErrorMessage(null);

      const records = Object.entries(attendanceMap).map(([studentId, val]) => ({
        studentId,
        status: val.status,
        remarks: val.remarks?.trim() ? val.remarks.trim() : undefined,
      }));

      await api.teacherPortal.markSessionAttendance(selectedSessionId, records);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
      await loadSessionAttendance(selectedSessionId);
    } catch (err: any) {
      console.error('Failed to save attendance', err);
      setErrorMessage(err?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreatingSession(true);
      setErrorMessage(null);
      const titleToUse =
        newSessionForm.title.trim() ||
        `${courseOffering?.course?.name || 'Class'} - Session #${sessions.length + 1}`;

      const created = await api.teacherPortal.createCourseSession(offeringId, {
        title: titleToUse,
        sessionDate: newSessionForm.sessionDate,
        startTime: newSessionForm.startTime,
        endTime: newSessionForm.endTime,
        classroom: newSessionForm.classroom,
        topic: newSessionForm.topic.trim() || undefined,
      });

      setShowAddSessionModal(false);
      await loadSessions();
      if (created?.id) {
        setSelectedSessionId(created.id);
        await loadSessionAttendance(created.id);
      }
    } catch (err: any) {
      console.error('Failed to create session', err);
      setErrorMessage(err?.message || 'Failed to create session');
    } finally {
      setCreatingSession(false);
    }
  };

  const selectedSession = useMemo(() => {
    return sessions.find((s) => s.id === selectedSessionId);
  }, [sessions, selectedSessionId]);

  // Real-time Attendance Stats
  const attendanceStats = useMemo(() => {
    const list = Object.values(attendanceMap);
    const total = list.length;
    let present = 0;
    let late = 0;
    let excused = 0;
    let absent = 0;

    list.forEach((item) => {
      if (item.status === 'PRESENT') present++;
      else if (item.status === 'LATE') late++;
      else if (item.status === 'EXCUSED') excused++;
      else if (item.status === 'ABSENT') absent++;
    });

    const rate = total > 0 ? Math.round(((present + late * 0.5 + excused) / total) * 100) : 0;
    return { total, present, late, excused, absent, rate };
  }, [attendanceMap]);

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/teacher/courses"
              className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                  Class Attendance Management
                </h1>
                {courseOffering && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-[#006838] border border-emerald-200 text-[10px] font-bold">
                    {courseOffering.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {courseOffering?.course?.name
                  ? `${courseOffering.course.name} • Section ${courseOffering.section || 'A'}`
                  : 'Mark and submit per-class attendance for enrolled students'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowAddSessionModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-200 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Session</span>
            </button>
            <button
              onClick={saveAttendance}
              disabled={saving || !selectedSessionId}
              className="px-5 py-2 rounded-xl bg-[#006838] hover:bg-[#00502a] text-white text-xs font-black shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {saveSuccess && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 shadow-xs animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <p className="text-xs md:text-sm font-bold">
              Attendance records successfully recorded and saved for this session!
            </p>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-xs md:text-sm font-semibold">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-500 hover:text-red-700 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Sessions Strip */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#006838]" />
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                Scheduled Class Sessions
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                {sessions.length} sessions
              </span>
            </div>

            <button
              onClick={loadSessions}
              className="text-xs text-[#006838] font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          </div>

          {loadingSessions ? (
            <div className="h-16 bg-slate-50 animate-pulse rounded-xl" />
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <Calendar className="w-8 h-8 text-slate-400 mx-auto opacity-40" />
              <p className="text-xs font-bold text-slate-700">No Class Sessions Generated Yet</p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Create your first scheduled lecture or makeup class session to start marking attendance.
              </p>
              <button
                onClick={() => setShowAddSessionModal(true)}
                className="mt-2 px-4 py-1.5 rounded-lg bg-[#006838] text-white text-xs font-bold hover:bg-[#015333] transition-colors"
              >
                + Create Session
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {sessions.map((s) => {
                const isSelected = s.id === selectedSessionId;
                const isCompleted = s.status === 'COMPLETED';

                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSession(s.id)}
                    className={`px-3.5 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer flex flex-col items-center border ${
                      isSelected
                        ? 'bg-[#006838] text-white border-[#006838] shadow-xs'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] uppercase font-bold opacity-80">
                        Class #{s.sessionNumber}
                      </span>
                      {isCompleted && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-emerald-300' : 'bg-emerald-600'
                          }`}
                        />
                      )}
                    </div>
                    <span className="font-mono text-xs">{s.sessionDate}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Session Info Card & Live Stats */}
        {selectedSession && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm md:text-base font-black text-slate-900">
                    {selectedSession.title}
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                      selectedSession.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {selectedSession.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {selectedSession.sessionDate}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {selectedSession.startTime?.substring(0, 5)} -{' '}
                    {selectedSession.endTime?.substring(0, 5)}
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
                  {selectedSession.topic && (
                    <>
                      <span>•</span>
                      <span className="text-slate-700 font-semibold">
                        Topic: {selectedSession.topic}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 self-start md:self-auto">
                <button
                  type="button"
                  onClick={() => markAllStatus('PRESENT')}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#006838] border border-emerald-200 text-xs font-bold transition-all cursor-pointer"
                >
                  All Present
                </button>
                <button
                  type="button"
                  onClick={() => markAllStatus('ABSENT')}
                  className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold transition-all cursor-pointer"
                >
                  All Absent
                </button>
              </div>
            </div>

            {/* Attendance Status Counter Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-3 border-t border-slate-100">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Enrolled</span>
                <span className="text-base font-black text-slate-900">{attendanceStats.total}</span>
              </div>
              <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700 block">Present</span>
                <span className="text-base font-black text-[#006838]">{attendanceStats.present}</span>
              </div>
              <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-100 text-center">
                <span className="text-[10px] uppercase font-bold text-amber-700 block">Late</span>
                <span className="text-base font-black text-amber-800">{attendanceStats.late}</span>
              </div>
              <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-100 text-center">
                <span className="text-[10px] uppercase font-bold text-blue-700 block">Excused</span>
                <span className="text-base font-black text-blue-800">{attendanceStats.excused}</span>
              </div>
              <div className="bg-red-50/70 p-2.5 rounded-xl border border-red-100 text-center">
                <span className="text-[10px] uppercase font-bold text-red-700 block">Absent</span>
                <span className="text-base font-black text-red-800">{attendanceStats.absent}</span>
              </div>
            </div>
          </div>
        )}

        {/* Student Attendance Marking Table */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100 text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Contact</th>
                  <th className="py-3.5 px-4 text-center">Attendance Status</th>
                  <th className="py-3.5 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loadingAttendance ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#006838]" />
                        <span>Loading student attendance sheet...</span>
                      </div>
                    </td>
                  </tr>
                ) : !sessionAttendance?.students || sessionAttendance.students.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 space-y-1">
                      <Users className="w-8 h-8 mx-auto opacity-30 text-[#006838]" />
                      <p className="text-xs font-bold text-slate-600">No Students Enrolled</p>
                      <p className="text-[11px] text-slate-400">
                        There are no students enrolled in this course offering section yet.
                      </p>
                    </td>
                  </tr>
                ) : (
                  sessionAttendance.students.map((st: any) => {
                    const currentStatus = attendanceMap[st.studentId]?.status || 'PRESENT';

                    return (
                      <tr key={st.studentId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900">{st.fullName}</p>
                          <p className="text-[11px] font-mono text-[#006838]">
                            {st.registrationNumber}
                          </p>
                        </td>
                        <td className="py-3 px-4 text-slate-600 hidden sm:table-cell">
                          <p>{st.mobileNumber || '—'}</p>
                          <p className="text-[11px] text-slate-400">{st.email || '—'}</p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Present Button */}
                            <button
                              type="button"
                              onClick={() => setStatus(st.studentId, 'PRESENT')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                currentStatus === 'PRESENT'
                                  ? 'bg-[#006838] text-white shadow-2xs'
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
                                  ? 'bg-amber-600 text-white shadow-2xs'
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
                                  ? 'bg-blue-600 text-white shadow-2xs'
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
                                  ? 'bg-red-600 text-white shadow-2xs'
                                  : 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-800'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <input
                            type="text"
                            placeholder="Optional remark..."
                            value={attendanceMap[st.studentId]?.remarks || ''}
                            onChange={(e) => setRemarks(st.studentId, e.target.value)}
                            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs w-full max-w-xs focus:ring-2 focus:ring-[#006838] focus:bg-white focus:outline-hidden transition-all"
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

        {/* Modal: Create Class Session */}
        {showAddSessionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-900 shadow-xl relative space-y-4">
              <button
                onClick={() => setShowAddSessionModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  Schedule New Class Session
                </h3>
                <p className="text-xs text-slate-500">
                  Create a regular lecture, lab practice, or makeup session for this offering
                </p>
              </div>

              <form onSubmit={handleCreateSessionSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Session Title
                  </label>
                  <input
                    type="text"
                    placeholder={`e.g. Session #${sessions.length + 1}`}
                    value={newSessionForm.title}
                    onChange={(e) =>
                      setNewSessionForm({ ...newSessionForm, title: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#006838] focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Session Date
                    </label>
                    <input
                      type="date"
                      required
                      value={newSessionForm.sessionDate}
                      onChange={(e) =>
                        setNewSessionForm({ ...newSessionForm, sessionDate: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#006838] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Classroom / Lab
                    </label>
                    <input
                      type="text"
                      value={newSessionForm.classroom}
                      onChange={(e) =>
                        setNewSessionForm({ ...newSessionForm, classroom: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#006838] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newSessionForm.startTime}
                      onChange={(e) =>
                        setNewSessionForm({ ...newSessionForm, startTime: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#006838] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newSessionForm.endTime}
                      onChange={(e) =>
                        setNewSessionForm({ ...newSessionForm, endTime: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#006838] focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                    Topic / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Midterm Review, Hands-on Lab"
                    value={newSessionForm.topic}
                    onChange={(e) =>
                      setNewSessionForm({ ...newSessionForm, topic: e.target.value })
                    }
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#006838] focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddSessionModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creatingSession}
                    className="px-4 py-2 rounded-xl bg-[#006838] hover:bg-[#00502a] text-white font-bold text-xs transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {creatingSession ? 'Scheduling...' : 'Confirm Session'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
