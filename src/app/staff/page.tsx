'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, User } from '@/lib/api/api-client';
import { useAuth } from '@/lib/auth/auth-context';
import { formatDate } from '@/lib/utils';
import { StaffTableSkeleton } from '@/components/ui/skeletons';
import {
  UserPlus,
  Users,
  UserCheck,
  UserX,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Lock,
  Mail,
  User as UserIcon,
  RefreshCw,
  KeyRound,
  Edit2,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function StaffManagementPage() {
  const { user: currentUser, isAdmin } = useAuth();

  const [staffList, setStaffList] = useState<User[]>([]);
  const [allStaff, setAllStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Notification state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [statusConfirmUser, setStatusConfirmUser] = useState<User | null>(null);
  const [editUser, setEditUser] = useState<User | null>(null);

  // Password visibility toggles
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  // Create form state
  const [createForm, setCreateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    isActive: true,
  });
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: '',
    newPassword: '',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Status toggle state
  const [statusSubmitting, setStatusSubmitting] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.staff.getAll({
        search: search.trim() || undefined,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        limit: 100,
      });
      const staffOnly = (res.data || []).filter((u) => u.role !== 'STUDENT');
      setStaffList(staffOnly);
      if (statusFilter === 'ALL' && !search.trim()) {
        setAllStaff(staffOnly);
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to load staff accounts.',
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  // Initial load for KPI metrics
  useEffect(() => {
    async function loadInitial() {
      try {
        const res = await api.staff.getAll({ limit: 100 });
        setAllStaff((res.data || []).filter((u) => u.role !== 'STUDENT'));
      } catch {
        // fallback
      }
    }
    loadInitial();
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Quick password generator
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pass = '';
    for (let i = 0; i < 10; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCreateForm((prev) => ({ ...prev, password: pass }));
    setShowCreatePassword(true);
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    if (createForm.password.length < 8) {
      setCreateError('Password must contain at least 8 characters.');
      return;
    }

    setCreateSubmitting(true);
    try {
      await api.staff.create({
        fullName: createForm.fullName.trim(),
        email: createForm.email.trim().toLowerCase(),
        password: createForm.password,
        isActive: createForm.isActive,
      });

      setNotification({
        type: 'success',
        message: `Staff account for "${createForm.fullName}" created successfully!`,
      });
      setCreateModalOpen(false);
      setCreateForm({ fullName: '', email: '', password: '', isActive: true });
      setShowCreatePassword(false);
      fetchStaff();
      // refresh KPI list
      const updatedAll = await api.staff.getAll({ limit: 100 });
      setAllStaff(updatedAll.data);
    } catch (err: any) {
      setCreateError(err?.message || 'Failed to create staff account.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!statusConfirmUser) return;
    setStatusSubmitting(true);

    try {
      const newStatus = !statusConfirmUser.isActive;
      await api.staff.updateStatus(statusConfirmUser.id, newStatus);

      setNotification({
        type: 'success',
        message: `Account for "${statusConfirmUser.fullName}" has been ${
          newStatus ? 'activated' : 'deactivated'
        }.`,
      });
      setStatusConfirmUser(null);
      fetchStaff();
      // refresh KPI list
      const updatedAll = await api.staff.getAll({ limit: 100 });
      setAllStaff(updatedAll.data);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to update account status.',
      });
      setStatusConfirmUser(null);
    } finally {
      setStatusSubmitting(false);
    }
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setEditError(null);

    setEditSubmitting(true);
    try {
      const payload: { fullName?: string; password?: string } = {};
      if (editForm.fullName.trim() && editForm.fullName !== editUser.fullName) {
        payload.fullName = editForm.fullName.trim();
      }
      if (editForm.newPassword) {
        if (editForm.newPassword.length < 8) {
          setEditError('New password must be at least 8 characters long.');
          setEditSubmitting(false);
          return;
        }
        payload.password = editForm.newPassword;
      }

      await api.staff.update(editUser.id, payload);

      setNotification({
        type: 'success',
        message: `Staff account "${editUser.fullName}" updated successfully.`,
      });
      setEditUser(null);
      setShowEditPassword(false);
      fetchStaff();
      // refresh KPI list
      const updatedAll = await api.staff.getAll({ limit: 100 });
      setAllStaff(updatedAll.data);
    } catch (err: any) {
      setEditError(err?.message || 'Failed to update staff member.');
    } finally {
      setEditSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <DashboardLayout title="Access Restricted">
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center max-w-lg mx-auto mt-12 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-[#D81A22] flex items-center justify-center mx-auto mb-4 border border-red-100">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Administrator Privileges Required</h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            Staff management and credential administration is strictly restricted to authorized institute
            administrators.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // KPI Calculations
  const statsSource = allStaff.length > 0 ? allStaff : staffList;
  const totalStaffCount = statsSource.length;
  const activeStaffCount = statsSource.filter((s) => s.isActive).length;
  const adminStaffCount = statsSource.filter((s) => s.role === 'ADMIN').length;
  const inactiveStaffCount = statsSource.filter((s) => !s.isActive).length;

  return (
    <DashboardLayout title="Staff Account Management">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-center justify-between transition-all shadow-xs animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2.5 text-xs font-semibold">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Hero Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 mb-2">
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span>Institute Administration</span>
            <span>•</span>
            <span>Role Controls</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage staff credentials, portal access privileges, and account security controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchStaff}
            disabled={loading}
            className="inline-flex items-center px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs"
            title="Refresh staff roster"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setCreateError(null);
              setShowCreatePassword(false);
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center px-4 py-2 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            Create Staff Member
          </button>
        </div>
      </div>

      {/* Executive KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Staff */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total Staff
            </span>
            <span className="text-xl font-black text-slate-900 leading-tight">{totalStaffCount}</span>
          </div>
        </div>

        {/* Active Accounts */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Active Accounts
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-emerald-800 leading-tight">{activeStaffCount}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Administrators */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Administrators
            </span>
            <span className="text-xl font-black text-blue-800 leading-tight">{adminStaffCount}</span>
          </div>
        </div>

        {/* Inactive / Suspended */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <UserX className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Inactive / Suspended
            </span>
            <span className="text-xl font-black text-amber-800 leading-tight">{inactiveStaffCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-6 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Segmented Filter Pills */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200/70">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => {
              const count =
                status === 'ALL'
                  ? totalStaffCount
                  : status === 'ACTIVE'
                  ? activeStaffCount
                  : inactiveStaffCount;

              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                    statusFilter === status
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{status === 'ALL' ? 'All' : status === 'ACTIVE' ? 'Active' : 'Inactive'}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      statusFilter === status
                        ? 'bg-slate-100 text-slate-800'
                        : 'bg-slate-200/80 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Staff Table */}
      {loading ? (
        <StaffTableSkeleton />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          {/* Mobile Card List (< lg) */}
          <div className="block lg:hidden divide-y divide-slate-100 p-2 sm:p-3">
            {staffList.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No staff members found</p>
              </div>
            ) : (
              staffList.map((member) => {
                const isSelf = member.id === currentUser?.id;
                const initials = member.fullName
                  ? member.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()
                  : 'U';

                return (
                  <div key={member.id} className="p-3 space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-2xs shrink-0 ${
                            member.role === 'ADMIN'
                              ? 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white ring-2 ring-emerald-100'
                              : 'bg-gradient-to-br from-slate-700 to-slate-900 text-white ring-2 ring-slate-100'
                          }`}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-sm text-slate-900 flex items-center gap-1.5 truncate">
                            <span className="truncate">{member.fullName}</span>
                            {isSelf && (
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                                You
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono truncate">{member.email}</p>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {member.isActive ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs py-1.5 px-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Role</span>
                        <span className="font-bold text-slate-800 text-xs">
                          {member.role === 'ADMIN' ? 'Administrator' : 'Staff Member'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px] uppercase font-bold">Joined</span>
                        <span className="text-slate-600 text-xs font-medium">
                          {formatDate((member as any).createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50">
                      <button
                        type="button"
                        onClick={() => {
                          setEditUser(member);
                          setEditForm({ fullName: member.fullName, newPassword: '' });
                          setShowEditPassword(false);
                          setEditError(null);
                        }}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-1 text-slate-500" />
                        Edit
                      </button>

                      {!isSelf && (
                        member.isActive ? (
                          <button
                            type="button"
                            onClick={() => setStatusConfirmUser(member)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors shadow-2xs"
                          >
                            <UserX className="w-3.5 h-3.5 mr-1 text-red-600" />
                            Deactivate
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setStatusConfirmUser(member)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors shadow-2xs"
                          >
                            <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-700" />
                            Activate
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Table (hidden on mobile, visible on lg+) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[720px]">
              <thead>
                <tr className="bg-slate-50/80 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200 whitespace-nowrap">
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Role & Access</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      <div className="max-w-xs mx-auto space-y-2">
                        <Users className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-semibold text-slate-700">No staff members found</p>
                        <p className="text-[11px] text-slate-400">
                          {search ? 'Try adjusting your search criteria.' : 'No staff accounts exist under this filter.'}
                        </p>
                        {search && (
                          <button
                            onClick={() => setSearch('')}
                            className="mt-2 text-xs font-semibold text-emerald-700 hover:underline"
                          >
                            Clear search filter
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  staffList.map((member) => {
                    const isSelf = member.id === currentUser?.id;
                    const initials = member.fullName
                      ? member.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()
                      : 'U';

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/70 transition-colors whitespace-nowrap">
                        {/* Member Name & Avatar */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs uppercase shadow-2xs shrink-0 ${
                                member.role === 'ADMIN'
                                  ? 'bg-gradient-to-br from-emerald-600 to-teal-800 text-white ring-2 ring-emerald-100'
                                  : 'bg-gradient-to-br from-slate-700 to-slate-900 text-white ring-2 ring-slate-100'
                              }`}
                            >
                              {initials}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{member.fullName}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-bold border border-emerald-200">
                                    You
                                  </span>
                                )}
                              </p>
                              {member.username && (
                                <p className="text-[10px] text-slate-400 font-mono">@{member.username}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center text-slate-600 font-mono text-[11px]">
                            <Mail className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                            <span>{member.email}</span>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          {member.role === 'ADMIN' ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              ADMIN
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <Shield className="w-3.5 h-3.5 mr-1 text-blue-500" />
                              STAFF
                            </span>
                          )}
                        </td>

                        {/* Account Status */}
                        <td className="py-3.5 px-4">
                          {member.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-600 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                              <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-slate-400" />
                              Inactive
                            </span>
                          )}
                        </td>

                        {/* Joined Date */}
                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {formatDate((member as any).createdAt)}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {/* Edit button */}
                            <button
                              onClick={() => {
                                setEditUser(member);
                                setEditForm({ fullName: member.fullName, newPassword: '' });
                                setShowEditPassword(false);
                                setEditError(null);
                              }}
                              className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shadow-2xs"
                              title="Edit Staff Member"
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
                              <span>Edit</span>
                            </button>

                            {/* Activate / Deactivate button */}
                            {isSelf ? (
                              <span
                                className="px-2.5 py-1.5 text-xs text-slate-400 font-medium select-none"
                                title="Your active session account cannot be deactivated"
                              >
                                —
                              </span>
                            ) : member.isActive ? (
                              <button
                                onClick={() => setStatusConfirmUser(member)}
                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors shadow-2xs"
                                title="Deactivate Account"
                              >
                                <UserX className="w-3.5 h-3.5 mr-1.5 text-red-600" />
                                <span>Deactivate</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => setStatusConfirmUser(member)}
                                className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors shadow-2xs"
                                title="Activate Account"
                              >
                                <UserCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-700" />
                                <span>Activate</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE STAFF MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setCreateModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-4 sm:p-6 max-h-[92vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create Staff Member</h3>
                  <p className="text-xs text-slate-500">Provide user credentials for portal access</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="my-4 rounded-xl bg-red-50 border border-red-200 p-3 flex items-start space-x-2 text-red-800 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    placeholder="e.g. Mahbuba Akter"
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="officer@foreveritbd.com"
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Initial Password *
                  </label>
                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                  >
                    <KeyRound className="w-3 h-3" />
                    Quick Generate
                  </button>
                </div>
                <div className="relative rounded-xl shadow-2xs">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showCreatePassword ? 'text' : 'password'}
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Minimum 8 characters..."
                    className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={showCreatePassword ? 'Hide password' : 'Show password'}
                  >
                    {showCreatePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  The staff member can change their password anytime via My Account.
                </p>
              </div>

              <div className="flex items-center space-x-2.5 pt-1">
                <input
                  type="checkbox"
                  id="create-active"
                  checked={createForm.isActive}
                  onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                  className="rounded text-emerald-700 focus:ring-emerald-600 w-4 h-4"
                />
                <label htmlFor="create-active" className="text-xs text-slate-700 font-medium select-none">
                  Activate account immediately upon creation
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 shadow-xs"
                >
                  {createSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STAFF MODAL */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setEditUser(null)}
          />
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-4 sm:p-6 max-h-[92vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Staff Account</h3>
                  <p className="text-xs text-slate-500 font-mono">{editUser.email}</p>
                </div>
              </div>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* User overview banner */}
            <div className="my-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Role</span>
                <span className="font-bold text-slate-800">{editUser.role}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold uppercase block">Status</span>
                <span className={`font-bold ${editUser.isActive ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {editUser.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {editError && (
              <div className="my-4 rounded-xl bg-red-50 border border-red-200 p-3 flex items-start space-x-2 text-red-800 text-xs">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStaff} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reset Password (Optional)
                </label>
                <div className="relative rounded-xl shadow-2xs">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    placeholder="Leave blank to preserve current password"
                    className="w-full pl-9 pr-10 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:border-emerald-600 font-mono"
                  />
                  {editForm.newPassword && (
                    <button
                      type="button"
                      onClick={() => setShowEditPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      title={showEditPassword ? 'Hide password' : 'Show password'}
                    >
                      {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Leave empty if you only want to update the full name.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 text-xs font-bold rounded-xl text-white bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 shadow-xs"
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRM STATUS TOGGLE MODAL */}
      {statusConfirmUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-2xs transition-opacity"
            onClick={() => setStatusConfirmUser(null)}
          />
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-4 sm:p-6 max-h-[92vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div
              className={`w-14 h-14 rounded-2xl mx-auto mb-3.5 flex items-center justify-center ${
                statusConfirmUser.isActive ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              {statusConfirmUser.isActive ? (
                <UserX className="w-7 h-7" />
              ) : (
                <UserCheck className="w-7 h-7" />
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {statusConfirmUser.isActive ? 'Deactivate Staff Account?' : 'Activate Staff Account?'}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Are you sure you want to {statusConfirmUser.isActive ? 'deactivate' : 'activate'}{' '}
              <strong className="text-slate-800">{statusConfirmUser.fullName}</strong>?{' '}
              {statusConfirmUser.isActive
                ? 'They will immediately lose authentication and cannot log in to the portal.'
                : 'They will immediately regain staff portal access privileges.'}
            </p>

            <div className="flex justify-center gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setStatusConfirmUser(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusSubmitting}
                onClick={handleToggleStatus}
                className={`px-4 py-2 text-xs font-bold rounded-xl text-white shadow-xs disabled:opacity-50 ${
                  statusConfirmUser.isActive
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-700 hover:bg-emerald-800'
                }`}
              >
                {statusSubmitting
                  ? 'Processing...'
                  : statusConfirmUser.isActive
                  ? 'Yes, Deactivate'
                  : 'Yes, Activate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
