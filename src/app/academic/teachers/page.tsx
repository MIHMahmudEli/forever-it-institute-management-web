'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, TeacherProfile } from '@/lib/api/api-client';
import {
  Users2,
  Plus,
  Search,
  Filter,
  Edit2,
  KeyRound,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  X,
  Phone,
  Mail,
  MapPin,
  GraduationCap,
  Calendar,
  Briefcase,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface HandoverDetails {
  teacherId: string;
  fullName: string;
  username: string;
  email: string;
  temporaryPassword: string;
}

export default function TeachersDirectoryPage() {
  const [teachers, setTeachers] = useState<TeacherProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State: Create Teacher
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formFullName, setFormFullName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState('Software Engineering');
  const [formDesignation, setFormDesignation] = useState('Senior Instructor');
  const [formSpecialization, setFormSpecialization] = useState('');
  const [formOfficeLocation, setFormOfficeLocation] = useState('Faculty Room 201');
  const [formBio, setFormBio] = useState('');
  const [formHireDate, setFormHireDate] = useState('');

  // Modal State: Edit Teacher
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<TeacherProfile | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editDepartment, setEditDepartment] = useState('');
  const [editDesignation, setEditDesignation] = useState('');
  const [editSpecialization, setEditSpecialization] = useState('');
  const [editOfficeLocation, setEditOfficeLocation] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'ON_LEAVE' | 'INACTIVE'>('ACTIVE');

  // Modal State: Handover Slip
  const [handoverData, setHandoverData] = useState<HandoverDetails | null>(null);
  const [copied, setCopied] = useState(false);

  // Reset Password State
  const [resettingTeacher, setResettingTeacher] = useState<TeacherProfile | null>(null);
  const [resetting, setResetting] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const data = await api.teachers.list();
      setTeachers(data);
    } catch (err: any) {
      console.error('Failed to load teachers:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setFormFullName('');
    setFormEmail('');
    setFormPhone('');
    setFormDepartment('Software Engineering');
    setFormDesignation('Senior Instructor');
    setFormSpecialization('');
    setFormOfficeLocation('Faculty Room 201');
    setFormBio('');
    setFormHireDate(new Date().toISOString().split('T')[0]);
    setErrorMsg(null);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (teacher: TeacherProfile) => {
    setEditingTeacher(teacher);
    setEditFullName(teacher.user?.fullName || '');
    setEditPhone(teacher.phone || '');
    setEditDepartment(teacher.department || '');
    setEditDesignation(teacher.designation || '');
    setEditSpecialization(teacher.specialization || '');
    setEditOfficeLocation(teacher.officeLocation || '');
    setEditBio(teacher.bio || '');
    setEditStatus(teacher.status);
    setErrorMsg(null);
    setIsEditModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await api.teachers.create({
        fullName: formFullName.trim(),
        email: formEmail.trim().toLowerCase(),
        phone: formPhone.trim(),
        department: formDepartment.trim(),
        designation: formDesignation.trim(),
        specialization: formSpecialization.trim() || undefined,
        officeLocation: formOfficeLocation.trim() || undefined,
        bio: formBio.trim() || undefined,
        hireDate: formHireDate || undefined,
      });

      setIsCreateModalOpen(false);
      await loadTeachers();

      // Show Handover Slip Modal
      if (res.temporaryPassword) {
        setHandoverData({
          teacherId: res.teacherId,
          fullName: res.user?.fullName || formFullName,
          username: res.user?.username || res.teacherId,
          email: res.user?.email || formEmail,
          temporaryPassword: res.temporaryPassword,
        });
      } else {
        setSuccessMsg(`Teacher account for ${formFullName} created.`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create teacher account.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeacher) return;
    setErrorMsg(null);
    setSubmitting(true);

    try {
      await api.teachers.update(editingTeacher.id, {
        fullName: editFullName.trim(),
        phone: editPhone.trim(),
        department: editDepartment.trim(),
        designation: editDesignation.trim(),
        specialization: editSpecialization.trim() || null,
        officeLocation: editOfficeLocation.trim() || null,
        bio: editBio.trim() || null,
        status: editStatus,
      });

      setSuccessMsg(`Teacher profile updated successfully.`);
      setIsEditModalOpen(false);
      await loadTeachers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update teacher profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resettingTeacher) return;
    try {
      setResetting(true);
      const res = await api.teachers.resetPassword(resettingTeacher.id);
      setResettingTeacher(null);

      // Open handover modal with new password
      setHandoverData({
        teacherId: res.teacherId,
        fullName: resettingTeacher.user?.fullName || 'Teacher',
        username: res.username,
        email: res.email,
        temporaryPassword: res.temporaryPassword,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to reset teacher password');
    } finally {
      setResetting(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!handoverData) return;
    const slipText = `================================================
FOREVER IT INSTITUTE — INSTRUCTOR LOGIN CREDENTIALS
================================================
Teacher ID:         ${handoverData.teacherId}
Full Name:          ${handoverData.fullName}
Username:           ${handoverData.username}
Account Email:      ${handoverData.email}
Temporary Password: ${handoverData.temporaryPassword}
Portal URL:         https://portal.foreveritbd.com/login
------------------------------------------------
Note: The instructor will be prompted to set a permanent 
password upon first login.
================================================`;
    navigator.clipboard.writeText(slipText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const filteredTeachers = teachers.filter((t) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.teacherId.toLowerCase().includes(q) ||
      (t.user?.fullName || '').toLowerCase().includes(q) ||
      (t.user?.email || '').toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q) ||
      t.phone.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                <Users2 className="w-5 h-5" />
              </span>
              <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">
                Teachers & Faculty Directory
              </h1>
            </div>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Manage instructors, provision teacher portal credentials, and assign academic responsibilities.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-950/10 transition-all cursor-pointer active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add New Teacher</span>
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

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-100 shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by instructor name, ID (TCH-...), department, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 whitespace-nowrap">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-gray-700 font-medium"
            >
              <option value="ALL">All Faculty</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On Leave</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Teachers List / Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-1/2" />
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-10 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Users2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-800">No Teachers Found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Try adjusting your search criteria.'
                : 'Click "Add New Teacher" to register your first instructor and generate portal login credentials.'}
            </p>
            {!searchQuery && statusFilter === 'ALL' && (
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Add First Teacher
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeachers.map((teacher) => {
              const offeringsCount = teacher.offerings?.length || 0;
              return (
                <div
                  key={teacher.id}
                  className="bg-white rounded-2xl border border-gray-200/80 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                            {teacher.teacherId}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                              teacher.status === 'ACTIVE'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : teacher.status === 'ON_LEAVE'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            {teacher.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mt-1.5 group-hover:text-emerald-700 transition-colors">
                          {teacher.user?.fullName || 'Unnamed Teacher'}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                          {teacher.designation} • {teacher.department}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{teacher.user?.email || 'No email'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span>{teacher.phone}</span>
                      </div>
                      {teacher.officeLocation && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{teacher.officeLocation}</span>
                        </div>
                      )}
                      {teacher.specialization && (
                        <div className="flex items-center gap-2 text-gray-600 pt-1">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="text-[11px] text-gray-700 font-medium line-clamp-1">
                            {teacher.specialization}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 text-xs font-semibold">
                      <Briefcase className="w-3 h-3 text-gray-500" />
                      <span>{offeringsCount} Assigned {offeringsCount === 1 ? 'Class' : 'Classes'}</span>
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(teacher)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Edit Teacher Profile"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setResettingTeacher(teacher)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-amber-700 hover:bg-amber-50 transition-colors cursor-pointer"
                        title="Reset Password & Print Handover"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Add Teacher */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden my-8">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                    <Users2 className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">Add New Teacher</h3>
                    <p className="text-[11px] text-gray-500">
                      Creates teacher profile and auto-generates portal credentials slip.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateSubmit} className="p-5 space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engr. Tanvir Ahmed"
                    value={formFullName}
                    onChange={(e) => setFormFullName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="teacher@example.com"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+8801XXXXXXXXX"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineering"
                      value={formDepartment}
                      onChange={(e) => setFormDepartment(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Designation</label>
                    <input
                      type="text"
                      placeholder="e.g. Lead Instructor"
                      value={formDesignation}
                      onChange={(e) => setFormDesignation(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Specialization / Expertise</label>
                  <input
                    type="text"
                    placeholder="e.g. Full-Stack Web Development, Node.js, Next.js"
                    value={formSpecialization}
                    onChange={(e) => setFormSpecialization(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Office Room / Desk</label>
                    <input
                      type="text"
                      placeholder="e.g. Room 304, Lab 2"
                      value={formOfficeLocation}
                      onChange={(e) => setFormOfficeLocation(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Hire / Join Date</label>
                    <input
                      type="date"
                      value={formHireDate}
                      onChange={(e) => setFormHireDate(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Teacher Bio (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="Brief background or qualifications..."
                    value={formBio}
                    onChange={(e) => setFormBio(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-950/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Creating Teacher...' : 'Create Teacher Account'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Edit Teacher */}
        {isEditModalOpen && editingTeacher && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-gray-100 overflow-hidden my-8">
              <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                    <Edit2 className="w-4 h-4" />
                  </span>
                  <div>
                    <h3 className="font-extrabold text-gray-900 text-base">Edit Teacher Profile</h3>
                    <p className="text-[11px] text-gray-500 font-mono">[{editingTeacher.teacherId}]</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
                {errorMsg && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Faculty Status</label>
                    <select
                      value={editStatus}
                      onChange={(e: any) => setEditStatus(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ON_LEAVE">ON_LEAVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Department</label>
                    <input
                      type="text"
                      value={editDepartment}
                      onChange={(e) => setEditDepartment(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Designation</label>
                    <input
                      type="text"
                      value={editDesignation}
                      onChange={(e) => setEditDesignation(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Specialization</label>
                  <input
                    type="text"
                    value={editSpecialization}
                    onChange={(e) => setEditSpecialization(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Office Location</label>
                  <input
                    type="text"
                    value={editOfficeLocation}
                    onChange={(e) => setEditOfficeLocation(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Bio</label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-gray-600 text-xs font-bold hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-950/10 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Confirm Reset Password */}
        {resettingTeacher && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl border border-gray-100 p-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <KeyRound className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-gray-900">Reset Instructor Password?</h3>
                <p className="text-xs text-gray-500">
                  This will generate a fresh temporary password for{' '}
                  <span className="font-bold text-gray-800">{resettingTeacher.user?.fullName}</span> (
                  {resettingTeacher.teacherId}). You will receive a handover slip immediately.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResettingTeacher(null)}
                  disabled={resetting}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={resetting}
                  className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-950/10 transition-all disabled:opacity-50"
                >
                  {resetting ? 'Resetting...' : 'Yes, Reset'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Instant Credentials Handover Slip */}
        {handoverData && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95">
              <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 relative">
                <div className="flex items-center gap-2 text-emerald-300 text-xs font-black uppercase tracking-widest mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Credential Handover Slip</span>
                </div>
                <h2 className="text-xl font-black text-white">{handoverData.fullName}</h2>
                <p className="text-xs text-emerald-200/90 font-mono mt-0.5">Teacher ID: {handoverData.teacherId}</p>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    Provide these credentials to the instructor. The system will prompt them to set their permanent
                    password on their first login.
                  </span>
                </div>

                <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border border-gray-200/70 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-gray-200/50">
                    <span className="text-gray-500 font-semibold">Teacher ID:</span>
                    <span className="font-mono font-black text-gray-900">{handoverData.teacherId}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-200/50">
                    <span className="text-gray-500 font-semibold">Login Username:</span>
                    <span className="font-mono font-bold text-gray-800">{handoverData.username}</span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-gray-200/50">
                    <span className="text-gray-500 font-semibold">Email:</span>
                    <span className="font-medium text-gray-800">{handoverData.email}</span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="text-gray-500 font-semibold">Temporary Password:</span>
                    <span className="font-mono font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md text-sm select-all">
                      {handoverData.temporaryPassword}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-emerald-950/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-200" />
                        <span>Credentials Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Handover Slip</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setHandoverData(null)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-bold text-xs hover:bg-gray-100 transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
