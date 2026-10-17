'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, CourseOffering, AcademicTerm } from '@/lib/api/api-client';
import {
  BookOpen,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  Search,
  Filter,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function StudentCourseRegistrationPage() {
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [registeringId, setRegisteringId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clash conflict modal state
  const [conflictData, setConflictData] = useState<{
    message: string;
    conflicts: any[];
  } | null>(null);

  useEffect(() => {
    loadTermsAndOfferings();
  }, []);

  const loadTermsAndOfferings = async () => {
    try {
      setLoading(true);
      const [termList, currentTerm] = await Promise.all([
        api.academicTerms.list(),
        api.academicTerms.getCurrent().catch(() => null),
      ]);

      setTerms(termList);
      const activeTermId = currentTerm?.id || (termList.length > 0 ? termList[0].id : '');
      setSelectedTermId(activeTermId);

      await fetchOfferings(activeTermId);
    } catch (err: any) {
      console.error('Failed to load terms or offerings', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfferings = async (termId?: string) => {
    try {
      const data = await api.studentPortal.getOfferings();
      setOfferings(data);
    } catch (err: any) {
      console.error('Failed to load offerings', err);
    }
  };

  const handleRegister = async (offering: CourseOffering) => {
    try {
      setRegisteringId(offering.id);
      setSuccessMessage(null);
      setErrorMessage(null);
      setConflictData(null);

      await api.studentPortal.registerOffering(offering.id);

      setSuccessMessage(
        `Successfully registered for ${offering.course?.name || offering.code} (${offering.section})!`
      );
      // Reload offerings to reflect updated seats and enrollment status
      await fetchOfferings(selectedTermId);
    } catch (err: any) {
      // Check for timetable clash 409 error
      if (err.data && err.data.conflicts && Array.isArray(err.data.conflicts)) {
        setConflictData({
          message: err.message || 'Timetable clash detected with your active routine.',
          conflicts: err.data.conflicts,
        });
      } else {
        setErrorMessage(err.message || 'Course registration failed.');
      }
    } finally {
      setRegisteringId(null);
    }
  };

  const filteredOfferings = offerings.filter((o) => {
    if (selectedTermId && o.termId !== selectedTermId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = o.course?.name?.toLowerCase().includes(q);
      const matchCode = o.code.toLowerCase().includes(q);
      const matchSection = o.section.toLowerCase().includes(q);
      const matchTeacher = o.teacher?.user?.fullName?.toLowerCase().includes(q);
      return matchName || matchCode || matchSection || matchTeacher;
    }
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
                <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
                <span>Open-Credit System • Self-Service Registration</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Course Registration
              </h1>
              <p className="text-emerald-100/90 text-sm mt-1">
                Browse published course offerings, inspect schedule slots, and register with automatic clash prevention
              </p>
            </div>
            <Link
              href="/student/routine"
              className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-900 rounded-xl text-xs font-black hover:bg-emerald-50 active:scale-95 transition-all shadow-md"
            >
              <span>View My Routine</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-bold">{successMessage}</p>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm font-bold">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-700 hover:text-red-900 cursor-pointer text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* Term Dropdown */}
            <div className="relative shrink-0">
              <select
                value={selectedTermId}
                onChange={(e) => setSelectedTermId(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="">All Academic Terms</option>
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code}) {t.isCurrent ? '• Current' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Total Results */}
            <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
              Showing {filteredOfferings.length} offering{filteredOfferings.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search course name, code, section, or teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Offerings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
            ))}
          </div>
        ) : filteredOfferings.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-dashed border-slate-300">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Offerings Available</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              There are no published course offerings matching your selected term or search filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredOfferings.map((off) => {
              const capacity = off.capacity || 30;
              const enrolled = off.enrolledCount || 0;
              const remaining = Math.max(0, capacity - enrolled);
              const percentageFilled = Math.min(100, Math.round((enrolled / capacity) * 100));
              const isFull = remaining === 0;
              const isEnrolled = Boolean(off.isEnrolled);

              return (
                <div
                  key={off.id}
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-xs hover:shadow-md ${
                    isEnrolled
                      ? 'border-emerald-300 ring-2 ring-emerald-500/20 bg-emerald-50/15'
                      : isFull
                      ? 'border-slate-200 opacity-80'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-900 font-extrabold text-xs">
                        {off.code}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {off.term?.name || 'Academic Term'}
                      </span>
                    </div>

                    {/* Course Title & Section */}
                    <h3 className="text-base font-black text-slate-900 line-clamp-1">
                      {off.course?.name || off.code}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                      <span className="font-bold text-emerald-800">{off.section}</span>
                      <span>•</span>
                      <span>{off.course?.duration || '3 Months'}</span>
                      {off.feeOverride && (
                        <>
                          <span>•</span>
                          <span className="font-bold text-slate-900">৳ {Number(off.feeOverride).toLocaleString()}</span>
                        </>
                      )}
                    </div>

                    {/* Weekly Schedules */}
                    <div className="mt-3.5 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">
                        Weekly Schedule
                      </p>
                      {off.schedules && off.schedules.length > 0 ? (
                        off.schedules.map((sch, sIdx) => (
                          <div key={sIdx} className="flex items-center justify-between text-xs text-slate-700">
                            <span className="font-bold text-slate-800">{sch.dayName.substring(0, 3)}</span>
                            <div className="flex items-center gap-1 text-slate-600">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>
                                {sch.startTime.substring(0, 5)} - {sch.endTime.substring(0, 5)}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic">Schedule to be announced</p>
                      )}
                    </div>

                    {/* Room & Teacher */}
                    <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{off.classroom || 'Main Lab'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-medium">
                          {off.teacher?.user?.fullName || 'Assigned Instructor'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Capacity Bar & Action Button */}
                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                      <span className="text-slate-600 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>Seats Capacity</span>
                      </span>
                      <span className={remaining <= 5 ? 'text-red-600 font-bold' : 'text-slate-700'}>
                        {enrolled}/{capacity} filled ({remaining} left)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          percentageFilled >= 100
                            ? 'bg-red-500'
                            : percentageFilled >= 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-600'
                        }`}
                        style={{ width: `${percentageFilled}%` }}
                      />
                    </div>

                    {/* Action Button */}
                    {isEnrolled ? (
                      <div className="w-full py-2.5 px-4 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-black text-center flex items-center justify-center gap-2 border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>Enrolled in this Section</span>
                      </div>
                    ) : isFull ? (
                      <button
                        disabled
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-200 text-slate-500 text-xs font-bold text-center cursor-not-allowed"
                      >
                        Section Full
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(off)}
                        disabled={registeringId === off.id}
                        className="w-full py-2.5 px-4 rounded-xl bg-[#006838] hover:bg-[#00502a] active:scale-98 text-white text-xs font-extrabold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {registeringId === off.id ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Register Course</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Timetable Clash Modal */}
        {conflictData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-red-200 animate-scaleUp">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-black text-slate-900">
                    Timetable Clash Detected
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    {conflictData.message}
                  </p>
                </div>
                <button
                  onClick={() => setConflictData(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Clash Details List */}
              <div className="mt-4 space-y-2.5 max-h-60 overflow-y-auto">
                {conflictData.conflicts.map((c: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-red-50/70 border border-red-200/80 text-xs text-red-900 space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>{c.conflictingCourseName} ({c.conflictingOfferingCode})</span>
                      <span className="px-2 py-0.5 rounded-md bg-red-200 text-red-950 text-[10px]">
                        Overlap
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-red-500" />
                      <span>{c.dayName}</span>
                      <span>•</span>
                      <Clock className="w-3.5 h-3.5 text-red-500" />
                      <span>{c.timeRange}</span>
                    </div>
                    {c.reason && <p className="text-slate-600 italic">{c.reason}</p>}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setConflictData(null)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Close & Choose Another Section
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
