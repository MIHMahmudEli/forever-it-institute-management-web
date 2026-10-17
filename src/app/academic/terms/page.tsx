'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, AcademicTerm } from '@/lib/api/api-client';
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Search,
  Sparkles,
  Layers,
  ChevronRight,
  Radio,
} from 'lucide-react';

export default function AcademicTermsPage() {
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<AcademicTerm | null>(null);
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formRegStartDate, setFormRegStartDate] = useState('');
  const [formRegEndDate, setFormRegEndDate] = useState('');
  const [formStatus, setFormStatus] = useState<'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED'>('UPCOMING');
  const [formIsCurrent, setFormIsCurrent] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Delete Confirmation Modal
  const [deleteConfirmTerm, setDeleteConfirmTerm] = useState<AcademicTerm | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = async () => {
    try {
      setLoading(true);
      const data = await api.academicTerms.list();
      setTerms(data);
    } catch (err: any) {
      console.error('Failed to load terms:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTerm(null);
    setFormName('');
    setFormCode('');
    const today = new Date().toISOString().split('T')[0];
    setFormStartDate(today);
    setFormEndDate(today);
    setFormRegStartDate(today);
    setFormRegEndDate(today);
    setFormStatus('UPCOMING');
    setFormIsCurrent(false);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (term: AcademicTerm) => {
    setEditingTerm(term);
    setFormName(term.name);
    setFormCode(term.code);
    setFormStartDate(term.startDate.split('T')[0]);
    setFormEndDate(term.endDate.split('T')[0]);
    setFormRegStartDate(term.registrationStartDate.split('T')[0]);
    setFormRegEndDate(term.registrationEndDate.split('T')[0]);
    setFormStatus(term.status);
    setFormIsCurrent(term.isCurrent);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      if (editingTerm) {
        await api.academicTerms.update(editingTerm.id, {
          name: formName.trim(),
          startDate: formStartDate,
          endDate: formEndDate,
          registrationStartDate: formRegStartDate,
          registrationEndDate: formRegEndDate,
          status: formStatus,
          isCurrent: formIsCurrent,
        });
        setSuccessMsg(`Term "${formName}" updated successfully.`);
      } else {
        await api.academicTerms.create({
          name: formName.trim(),
          code: formCode.trim().toUpperCase(),
          startDate: formStartDate,
          endDate: formEndDate,
          registrationStartDate: formRegStartDate,
          registrationEndDate: formRegEndDate,
          status: formStatus,
          isCurrent: formIsCurrent,
        });
        setSuccessMsg(`Term "${formName}" created successfully.`);
      }
      setIsModalOpen(false);
      await loadTerms();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save academic term.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSetCurrent = async (term: AcademicTerm) => {
    try {
      await api.academicTerms.update(term.id, { isCurrent: true, status: 'ACTIVE' });
      setSuccessMsg(`"${term.name}" is now marked as the Current Academic Term.`);
      await loadTerms();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to set current term');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmTerm) return;
    try {
      setDeleting(true);
      await api.academicTerms.delete(deleteConfirmTerm.id);
      setSuccessMsg(`Term "${deleteConfirmTerm.name}" deleted.`);
      setDeleteConfirmTerm(null);
      await loadTerms();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to delete term');
    } finally {
      setDeleting(false);
    }
  };

  const filteredTerms = terms.filter((term) => {
    const matchesSearch =
      term.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || term.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeTerm = terms.find((t) => t.isCurrent);

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Calendar className="w-5 h-5" />
              </span>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                Academic Terms & Sessions
              </h1>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Configure semesters, registration windows, and set the active academic calendar term.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-950/10 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Create New Term</span>
          </button>
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

        {/* Current Term Highlight Banner */}
        {activeTerm && (
          <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-2xl p-5 md:p-6 shadow-md border border-emerald-700/50">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/30 border border-emerald-400/40 text-[11px] font-black uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Current Active Term
                  </span>
                  <span className="text-xs text-emerald-200/80 font-mono">[{activeTerm.code}]</span>
                </div>
                <h2 className="text-2xl font-black">{activeTerm.name}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100/90 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 opacity-80" />
                    Session: {new Date(activeTerm.startDate).toLocaleDateString()} — {new Date(activeTerm.endDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 opacity-80" />
                    Registration: {new Date(activeTerm.registrationStartDate).toLocaleDateString()} — {new Date(activeTerm.registrationEndDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEditModal(activeTerm)}
                  className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by term name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-gray-700 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>
        </div>

        {/* Terms List / Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs animate-pulse space-y-4">
                <div className="h-5 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-8 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredTerms.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-800">No Academic Terms Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria.'
                : 'Get started by creating your first academic term or semester window.'}
            </p>
            {!searchQuery && statusFilter === 'ALL' && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Create First Term
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTerms.map((term) => {
              const isCurrent = term.isCurrent;
              return (
                <div
                  key={term.id}
                  className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between shadow-xs hover:shadow-md ${
                    isCurrent ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-gray-200/80'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-gray-100 text-gray-800">
                            {term.code}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] uppercase">
                              Current
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mt-1">{term.name}</h3>
                      </div>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          term.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : term.status === 'UPCOMING'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : term.status === 'COMPLETED'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}
                      >
                        {term.status}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Semester Period:</span>
                        <span className="font-medium text-gray-800">
                          {new Date(term.startDate).toLocaleDateString()} — {new Date(term.endDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Registration Window:</span>
                        <span className="font-medium text-emerald-700">
                          {new Date(term.registrationStartDate).toLocaleDateString()} —{' '}
                          {new Date(term.registrationEndDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    {!isCurrent && (
                      <button
                        onClick={() => handleSetCurrent(term)}
                        className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                        title="Set this term as current"
                      >
                        <Radio className="w-3 h-3" />
                        <span>Set Current</span>
                      </button>
                    )}

                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => openEditModal(term)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Edit Term"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmTerm(term)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete Term"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Create / Edit Term */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden my-8">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <h3 className="font-extrabold text-gray-900 text-base">
                    {editingTerm ? 'Edit Academic Term' : 'Create Academic Term'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Term Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Spring 2026 or Batch 24"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                {!editingTerm && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Term Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SP-26"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 uppercase font-mono"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">End Date *</label>
                    <input
                      type="date"
                      required
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Reg. Open Date *</label>
                    <input
                      type="date"
                      required
                      value={formRegStartDate}
                      onChange={(e) => setFormRegStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Reg. Close Date *</label>
                    <input
                      type="date"
                      required
                      value={formRegEndDate}
                      onChange={(e) => setFormRegEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Lifecycle Status</label>
                  <select
                    value={formStatus}
                    onChange={(e: any) => setFormStatus(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>

                <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-emerald-950">Active Current Term</p>
                    <p className="text-[11px] text-emerald-800">
                      If checked, this term will automatically become the default for registration.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsCurrent}
                    onChange={(e) => setFormIsCurrent(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-950/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : editingTerm ? 'Save Changes' : 'Create Term'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirm Delete */}
        {deleteConfirmTerm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-gray-900">Delete Academic Term?</h3>
                <p className="text-xs text-gray-500">
                  Are you sure you want to delete <span className="font-bold text-gray-800">{deleteConfirmTerm.name}</span> ({deleteConfirmTerm.code})?
                  This action cannot be undone if offerings are attached.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteConfirmTerm(null)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-950/10 transition-all disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
