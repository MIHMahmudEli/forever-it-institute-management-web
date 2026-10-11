'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, Course } from '@/lib/api/api-client';
import { formatCurrency, formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { useAuth } from '@/lib/auth/auth-context';
import {
  GraduationCap,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
} from 'lucide-react';

export default function CoursesPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [duration, setDuration] = useState('3 Months');
  const [totalFee, setTotalFee] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const data = await api.courses.getAll();
      setCourses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const openCreateModal = () => {
    setEditingCourse(null);
    setCode('');
    setName('');
    setCategory('General');
    setDuration('3 Months');
    setTotalFee(4000);
    setDescription('');
    setStatus('ACTIVE');
    setModalError(null);
    setModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setCode(c.code);
    setName(c.name);
    setCategory(c.category);
    setDuration(c.duration);
    setTotalFee(Number(c.totalFee));
    setDescription(c.description || '');
    setStatus(c.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE');
    setModalError(null);
    setModalOpen(true);
  };

  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSubmitting(true);

    try {
      const payload = {
        code,
        name,
        category,
        duration,
        totalFee,
        description: description || undefined,
        status,
      };

      if (editingCourse) {
        await api.courses.update(editingCourse.id, payload);
      } else {
        await api.courses.create(payload);
      }

      setModalOpen(false);
      fetchCourses();
    } catch (err: any) {
      setModalError(err.message || 'Failed to save course.');
    } finally {
      setModalSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Course Catalog">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Courses & Programs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Official training tracks, program durations, fee structures, and admissions status.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Course
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
          {error}
        </div>
      )}

      {/* Courses Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-slate-400">
            <div className="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-xs">Loading course catalog...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
            <GraduationCap className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">No courses available.</p>
          </div>
        ) : (
          courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {course.code}
                  </span>
                  <StatusBadge status={course.status} />
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug mb-1">
                  {course.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                  {course.description || 'Professional training program by Forever IT Institute.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs mb-3">
                  <span className="text-slate-500 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {course.duration}
                  </span>
                  <span className="text-base font-extrabold text-emerald-800">
                    {formatCurrency(course.totalFee)}
                  </span>
                </div>

                {isAdmin && (
                  <div className="flex justify-end pt-2 border-t border-slate-50 space-x-2">
                    <button
                      onClick={() => openEditModal(course)}
                      className="px-3 py-1.5 rounded text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center"
                    >
                      <Edit2 className="w-3 h-3 mr-1 text-slate-500" />
                      Edit Course
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Course Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900">
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-xs border border-red-200">
                {modalError}
              </div>
            )}

            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Course Code *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. WD-01"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-mono text-slate-900 uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration *</label>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 6 Months"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Website Development"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Fee (BDT) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={totalFee}
                    onChange={(e) => setTotalFee(parseFloat(e.target.value) || 0)}
                    placeholder="15000"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e: any) => setStatus(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Website Development"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of curriculum..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-900"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalSubmitting}
                  className="px-5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold disabled:opacity-50"
                >
                  {modalSubmitting ? 'Saving...' : 'Save Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
