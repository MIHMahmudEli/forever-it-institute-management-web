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
} from 'lucide-react';

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
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [selectedTermId, setSelectedTermId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Modal State
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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

      setIsModalOpen(false);
      await loadOfferings(selectedTermId);
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
      await loadOfferings(selectedTermId);
    } catch (err: any) {
      alert(err.message || 'Failed to publish offering');
    } finally {
      setPublishingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <div className="bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] rounded-3xl p-6 md:p-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold backdrop-blur-md mb-2">
                <Layers className="w-3.5 h-3.5 text-emerald-300" />
                <span>Academic Management • Course Offerings</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight">Course Offerings</h1>
              <p className="text-emerald-100/90 text-sm mt-1">
                Configure scheduled course sections, assign instructors, set weekly routines, and manage capacity
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="self-start md:self-auto px-5 py-2.5 rounded-xl bg-white text-emerald-900 text-xs font-black shadow-md hover:bg-emerald-50 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course Offering</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
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

          <span className="text-xs font-bold text-slate-500">
            Total {offerings.length} offering{offerings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Offerings Table */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
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
                ) : offerings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">No course offerings found for this term.</td>
                  </tr>
                ) : (
                  offerings.map((off) => (
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
                      <td className="py-3.5 px-4 text-slate-700">
                        {off.teacher?.user?.fullName || <span className="text-slate-400 italic">Unassigned</span>}
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
                        {off.status === 'DRAFT' ? (
                          <button
                            onClick={() => handlePublish(off.id)}
                            disabled={publishingId === off.id}
                            className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                          >
                            {publishingId === off.id ? 'Publishing...' : 'Publish'}
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-600 font-bold">Active</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Offering Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-scaleUp my-8">
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

              <form onSubmit={handleCreateOffering} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Course Catalog *</label>
                    <select
                      required
                      value={formCourseId}
                      onChange={(e) => setFormCourseId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
                    >
                      <option value="">Select a Course</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.code}) - {c.duration}
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assign Teacher</label>
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

                {/* Weekly Routine Schedules Builder */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-700 uppercase">
                      Weekly Schedule Routine Slots
                    </span>
                    <button
                      type="button"
                      onClick={addScheduleSlot}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Slot</span>
                    </button>
                  </div>

                  {formSchedules.map((slot, sIdx) => (
                    <div key={sIdx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200">
                      <div className="sm:col-span-2">
                        <select
                          value={slot.dayOfWeek}
                          onChange={(e) => updateScheduleSlot(sIdx, 'dayOfWeek', Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-800"
                        >
                          {DAYS.map((d) => (
                            <option key={d.val} value={d.val}>{d.label}</option>
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
