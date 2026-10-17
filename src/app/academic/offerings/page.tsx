'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import {
  api,
  CourseOffering,
  AcademicTerm,
  Course,
  TeacherProfile,
} from '@/lib/api/api-client';
import {
  Layers,
  Plus,
  Calendar,
  Clock,
  MapPin,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Trash2,
  Search,
  Filter,
  UserCheck,
  UserPlus,
  Edit2,
  GraduationCap,
  Sparkles,
  List,
  SlidersHorizontal,
} from 'lucide-react';
import OfferedSectionsTable from '@/components/academic/OfferedSectionsTable';

const DAYS = [
  { val: 0, label: 'Sunday' },
  { val: 1, label: 'Monday' },
  { val: 2, label: 'Tuesday' },
  { val: 3, label: 'Wednesday' },
  { val: 4, label: 'Thursday' },
  { val: 5, label: 'Friday' },
  { val: 6, label: 'Saturday' },
];

export default function AcademicOfferingsPage() {
  const [viewMode, setViewMode] = useState<'standard' | 'manage'>('standard');
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [instructorFilter, setInstructorFilter] = useState<'ALL' | 'ASSIGNED' | 'UNASSIGNED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal State: Create Offering
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCourseId, setFormCourseId] = useState('');
  const [formTermId, setFormTermId] = useState('');
  const [formTeacherId, setFormTeacherId] = useState('');
  const [formSection, setFormSection] = useState('Section A');
  const [formClassroom, setFormClassroom] = useState('Lab 1');
  const [formCapacity, setFormCapacity] = useState(30);
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formFeeOverride, setFormFeeOverride] = useState('');
  const [formSchedules, setFormSchedules] = useState<
    { dayOfWeek: number; startTime: string; endTime: string; classroom: string }[]
  >([{ dayOfWeek: 0, startTime: '10:00', endTime: '12:00', classroom: 'Lab 1' }]);
  const [submitting, setSubmitting] = useState(false);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  // Modal State: Quick Assign / Change Instructor
  const [assignModalOffering, setAssignModalOffering] = useState<CourseOffering | null>(null);
  const [assignTeacherId, setAssignTeacherId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [termList, courseList, teacherList] = await Promise.all([
        api.academicTerms.list(),
        api.courses.getAll(),
        api.teachers.list(),
      ]);

      setTerms(termList);
      setCourses(courseList);
      setTeachers(teacherList);

      const currentTerm = termList.find((t) => t.isCurrent) || termList[0];
      if (currentTerm) {
        setSelectedTermId(currentTerm.id);
        setFormTermId(currentTerm.id);
        setFormStartDate(currentTerm.startDate);
        setFormEndDate(currentTerm.endDate);
      }

      await loadOfferings(currentTerm?.id);
    } catch (err: any) {
      console.error('Failed to load initial data', err);
    } finally {
      setLoading(false);
    }
  };

  const loadOfferings = async (termId?: string) => {
    try {
      const data = await api.courseOfferings.list(termId ? { termId } : undefined);
      setOfferings(data);
    } catch (err: any) {
      console.error('Failed to load offerings', err);
    }
  };

  const handleTermChange = async (termId: string) => {
    setSelectedTermId(termId);
    await loadOfferings(termId);
  };

  const addScheduleSlot = () => {
    setFormSchedules((prev) => [
      ...prev,
      { dayOfWeek: 2, startTime: '10:00', endTime: '12:00', classroom: formClassroom },
    ]);
  };

  const removeScheduleSlot = (index: number) => {
    setFormSchedules((prev) => prev.filter((_, idx) => idx !== index));
  };

  const updateScheduleSlot = (index: number, field: string, val: any) => {
    setFormSchedules((prev) =>
      prev.map((slot, idx) => (idx === index ? { ...slot, [field]: val } : slot))
    );
  };

  const handleCreateOffering = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      setSubmitting(true);
      await api.courseOfferings.create({
        courseId: formCourseId,
        termId: formTermId,
        teacherId: formTeacherId || undefined,
        section: formSection,
        classroom: formClassroom,
        capacity: Number(formCapacity),
        startDate: formStartDate,
        endDate: formEndDate,
        feeOverride: formFeeOverride ? Number(formFeeOverride) : undefined,
        schedules: formSchedules,
      });

      setSuccessMsg('Course offering created successfully.');
      setIsModalOpen(false);
      await loadOfferings(selectedTermId);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create course offering');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (id: string) => {
    if (!confirm('Publishing this offering will automatically generate all dated class sessions. Continue?')) {
      return;
    }
    try {
      setPublishingId(id);
      await api.courseOfferings.publish(id);
      setSuccessMsg('Course offering published and class sessions generated.');
      await loadOfferings(selectedTermId);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to publish offering');
    } finally {
      setPublishingId(null);
    }
  };

  const openAssignModal = (offering: CourseOffering) => {
    setAssignModalOffering(offering);
    setAssignTeacherId(offering.teacherId || '');
    setErrorMsg(null);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalOffering) return;
    try {
      setAssigning(true);
      await api.courseOfferings.update(assignModalOffering.id, {
        teacherId: assignTeacherId || null,
      });

      const selectedTeacher = teachers.find((t) => t.id === assignTeacherId);
      setSuccessMsg(
        selectedTeacher
          ? `Instructor ${selectedTeacher.user?.fullName} assigned to ${assignModalOffering.code}.`
          : `Instructor unassigned from ${assignModalOffering.code}.`
      );

      setAssignModalOffering(null);
      await loadOfferings(selectedTermId);
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to assign instructor');
    } finally {
      setAssigning(false);
    }
  };

  const filteredOfferings = offerings.filter((off) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      off.code.toLowerCase().includes(q) ||
      (off.course?.name || '').toLowerCase().includes(q) ||
      off.section.toLowerCase().includes(q) ||
      (off.teacher?.user?.fullName || '').toLowerCase().includes(q) ||
      (off.classroom || '').toLowerCase().includes(q);

    if (instructorFilter === 'ASSIGNED') {
      return matchesSearch && !!off.teacherId;
    }
    if (instructorFilter === 'UNASSIGNED') {
      return matchesSearch && !off.teacherId;
    }
    return matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
                <Layers className="w-3.5 h-3.5 text-emerald-300" />
                <span>Academic Management • Course Offerings</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Course Offerings</h1>
              <p className="text-emerald-100/90 text-sm mt-1">
                Configure scheduled course sections, assign instructors, set weekly routines, and manage student registration capacity.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
              <div className="bg-white/15 p-1 rounded-xl flex items-center border border-white/20">
                <button
                  type="button"
                  onClick={() => setViewMode('standard')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'standard'
                      ? 'bg-white text-emerald-950 shadow-xs'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <List className="w-3.5 h-3.5" />
                  <span>Offered Sections</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('manage')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    viewMode === 'manage'
                      ? 'bg-white text-emerald-950 shadow-xs'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Management View</span>
                </button>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-white text-emerald-900 text-xs font-black shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Create Course Offering</span>
              </button>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STANDARD UNIVERSITY OFFERED SECTIONS TABLE */}
        {viewMode === 'standard' && (
          <OfferedSectionsTable
            offerings={offerings}
            terms={terms}
            selectedTermName={terms.find((t) => t.id === selectedTermId)?.name || '2026-2027, Fall'}
            onTermChange={(tName) => {
              const found = terms.find((t) => t.name === tName);
              if (found) handleTermChange(found.id);
            }}
            isAdmin={true}
            onAssignInstructor={openAssignModal}
            onPublish={handlePublish}
            publishingId={publishingId}
          />
        )}

        {/* MANAGEMENT VIEW */}
        {viewMode === 'manage' && (
          <>
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-500 uppercase">Term:</span>
              <select
                value={selectedTermId}
                onChange={(e) => handleTermChange(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="">All Terms</option>
                {terms.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.code}) {t.isCurrent ? '• Current' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-500 uppercase">Instructor:</span>
              <select
                value={instructorFilter}
                onChange={(e: any) => setInstructorFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="ALL">All Instructors</option>
                <option value="ASSIGNED">Assigned Only</option>
                <option value="UNASSIGNED">Unassigned Only</option>
              </select>
            </div>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search offering code, course, room, or teacher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Mobile View: Cards */}
        <div className="block md:hidden space-y-3">
          {loading ? (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border">Loading offerings...</div>
          ) : filteredOfferings.length === 0 ? (
            <div className="p-8 text-center text-slate-400 bg-white rounded-2xl border">No course offerings found.</div>
          ) : (
            filteredOfferings.map((off) => (
              <div
                key={off.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {off.code}
                    </span>
                    <h3 className="font-bold text-slate-900 mt-1 text-sm">{off.course?.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      {off.section} • Room: {off.classroom}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      off.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-900'
                        : off.status === 'DRAFT'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {off.status}
                  </span>
                </div>

                {/* Instructor Block */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
                    <div>
                      <p className="text-[10px] font-extrabold uppercase text-slate-400">Assigned Instructor</p>
                      <p className="text-xs font-bold text-slate-800">
                        {off.teacher?.user?.fullName || <span className="text-amber-700 italic">Not Assigned</span>}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => openAssignModal(off)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <UserCheck className="w-3 h-3" />
                    <span>{off.teacherId ? 'Change' : 'Assign'}</span>
                  </button>
                </div>

                {/* Schedules */}
                <div className="text-[11px] text-slate-600 space-y-1">
                  <p className="text-[10px] font-extrabold uppercase text-slate-400">Weekly Schedule</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(off.schedules || []).map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                        {s.dayName.substring(0, 3)}: {s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="font-semibold text-slate-600">
                    Seats: {off.enrolledCount} / {off.capacity}
                  </span>
                  {off.status === 'DRAFT' && (
                    <button
                      onClick={() => handlePublish(off.id)}
                      disabled={publishingId === off.id}
                      className="px-3 py-1 rounded-lg bg-emerald-700 text-white text-xs font-bold shadow-xs"
                    >
                      {publishingId === off.id ? 'Publishing...' : 'Publish'}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-4">Offering Code</th>
                  <th className="py-3.5 px-4">Course Name</th>
                  <th className="py-3.5 px-4">Section & Room</th>
                  <th className="py-3.5 px-4">Instructor</th>
                  <th className="py-3.5 px-4">Weekly Schedule</th>
                  <th className="py-3.5 px-4 text-center">Enrollment</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">Loading offerings...</td>
                  </tr>
                ) : filteredOfferings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">No course offerings found for this term.</td>
                  </tr>
                ) : (
                  filteredOfferings.map((off) => (
                    <tr key={off.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                        {off.code}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900">{off.course?.name}</p>
                        <p className="text-[10px] text-slate-400">{off.term?.name}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-800">{off.section}</p>
                        <p className="text-[11px] text-slate-500">{off.classroom}</p>
                      </td>

                      {/* Instructor Column with Click-to-Assign */}
                      <td className="py-3.5 px-4 text-slate-700">
                        {off.teacher ? (
                          <div className="flex items-center gap-1.5 group">
                            <div>
                              <p className="font-bold text-slate-900">{off.teacher.user?.fullName}</p>
                              <p className="text-[10px] text-slate-400">{off.teacher.department} • {off.teacher.teacherId}</p>
                            </div>
                            <button
                              onClick={() => openAssignModal(off)}
                              className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                              title="Change Instructor"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => openAssignModal(off)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200 transition-all cursor-pointer shadow-2xs"
                          >
                            <UserPlus className="w-3 h-3 text-amber-600" />
                            <span>Assign Instructor</span>
                          </button>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {(off.schedules || []).map((s, idx) => (
                            <div key={idx} className="text-[11px] text-slate-600 flex items-center gap-1.5">
                              <span className="font-bold">{s.dayName.substring(0, 3)}:</span>
                              <span>{s.startTime.substring(0, 5)} - {s.endTime.substring(0, 5)}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-900">
                          {off.enrolledCount} / {off.capacity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                            off.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-900'
                              : off.status === 'DRAFT'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {off.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openAssignModal(off)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title="Assign / Change Instructor"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>

                          {off.status === 'DRAFT' ? (
                            <button
                              onClick={() => handlePublish(off.id)}
                              disabled={publishingId === off.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                            >
                              {publishingId === off.id ? 'Publishing...' : 'Publish'}
                            </button>
                          ) : (
                            <span className="text-xs text-emerald-600 font-bold px-2 py-1">Active</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
          </>
        )}

        {/* Modal: Quick Assign Instructor */}
        {assignModalOffering && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                    <UserCheck className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Assign Instructor</h3>
                    <p className="text-[11px] text-slate-500 font-mono">{assignModalOffering.code}</p>
                  </div>
                </div>
                <button
                  onClick={() => setAssignModalOffering(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {errorMsg && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleAssignSubmit} className="mt-4 space-y-4">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Course:</span>
                    <span className="font-bold text-slate-900">{assignModalOffering.course?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Section & Room:</span>
                    <span className="font-medium text-slate-800">
                      {assignModalOffering.section} • {assignModalOffering.classroom}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">Current Instructor:</span>
                    <span className="font-bold text-emerald-800">
                      {assignModalOffering.teacher?.user?.fullName || 'None (Unassigned)'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Instructor from Directory *
                  </label>
                  <select
                    value={assignTeacherId}
                    onChange={(e) => setAssignTeacherId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                  >
                    <option value="">-- Leave Unassigned / Vacant --</option>
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.user?.fullName} ({t.department} • {t.teacherId})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-400 mt-1">
                    The assigned instructor will see this class in their Teacher Portal dashboard, timetable, roster, and gradebook.
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignModalOffering(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assigning}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-950/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {assigning ? 'Saving...' : 'Save Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Create Course Offering */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-lg font-black text-slate-900">Create Course Offering</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {errorMsg && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
                  {errorMsg}
                </div>
              )}

              <form onSubmit={handleCreateOffering} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Course *</label>
                    <select
                      required
                      value={formCourseId}
                      onChange={(e) => setFormCourseId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                    >
                      <option value="">Select a Course</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Academic Term *</label>
                    <select
                      required
                      value={formTermId}
                      onChange={(e) => setFormTermId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                    >
                      <option value="">Select a Term</option>
                      {terms.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name} ({t.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Section *</label>
                    <input
                      type="text"
                      required
                      value={formSection}
                      onChange={(e) => setFormSection(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      placeholder="e.g. Section A"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Default Classroom *</label>
                    <input
                      type="text"
                      required
                      value={formClassroom}
                      onChange={(e) => setFormClassroom(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      placeholder="e.g. Lab 1"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Max Capacity *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={formCapacity}
                      onChange={(e) => setFormCapacity(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assign Teacher (Optional)</label>
                    <select
                      value={formTeacherId}
                      onChange={(e) => setFormTeacherId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                    >
                      <option value="">Unassigned (Set later)</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.user?.fullName} ({t.department})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Schedules */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-black text-slate-800">
                      Weekly Routine Schedules *
                    </label>
                    <button
                      type="button"
                      onClick={addScheduleSlot}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Day Slot</span>
                    </button>
                  </div>

                  {formSchedules.map((slot, sIdx) => (
                    <div key={sIdx} className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2 items-center">
                      <div>
                        <select
                          value={slot.dayOfWeek}
                          onChange={(e) => updateScheduleSlot(sIdx, 'dayOfWeek', Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs cursor-pointer"
                        >
                          {DAYS.map((d) => (
                            <option key={d.val} value={d.val}>
                              {d.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <input
                          type="time"
                          required
                          value={slot.startTime}
                          onChange={(e) => updateScheduleSlot(sIdx, 'startTime', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                        />
                      </div>

                      <div>
                        <input
                          type="time"
                          required
                          value={slot.endTime}
                          onChange={(e) => updateScheduleSlot(sIdx, 'endTime', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Room"
                          value={slot.classroom}
                          onChange={(e) => updateScheduleSlot(sIdx, 'classroom', e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs"
                        />
                        {formSchedules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeScheduleSlot(sIdx)}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-[#006838] hover:bg-[#00502a] text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Creating Offering...' : 'Save Offering'}
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
