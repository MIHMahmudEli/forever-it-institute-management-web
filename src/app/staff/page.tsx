'use client';

import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, User } from '@/lib/api/api-client';
import { useAuth } from '@/lib/auth/auth-context';
import { formatDate } from '@/lib/utils';
import { StaffTableSkeleton } from '@/components/ui/skeletons';
import {
  UserPlus,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Lock,
  Mail,
  User as UserIcon,
  RefreshCw,
  KeyRound,
  Edit2,
} from 'lucide-react';

export default function StaffManagementPage() {
  const { user: currentUser, isAdmin } = useAuth();

  const [staffList, setStaffList] = useState<User[]>([]);
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
      });
      setStaffList(res.data);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err?.message || 'Failed to load staff accounts.',
      });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

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
        fullName: createForm.fullName,
        email: createForm.email,
        password: createForm.password,
        isActive: createForm.isActive,
      });

      setNotification({
        type: 'success',
        message: `Staff account for "${createForm.fullName}" created successfully!`,
      });
      setCreateModalOpen(false);
      setCreateForm({ fullName: '', email: '', password: '', isActive: true });
      fetchStaff();
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
      fetchStaff();
    } catch (err: any) {
      setEditError(err?.message || 'Failed to update staff member.');
    } finally {
      setEditSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <DashboardLayout title="Access Restricted">
        <div className="bg-white rounded-xl border border-red-200 p-8 text-center max-w-lg mx-auto mt-12 shadow-xs">
          <ShieldAlert className="w-12 h-12 text-[#D81A22] mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-800">Administrator Privileges Required</h2>
          <p className="text-xs text-slate-500 mt-2">
            Staff management and credential administration is restricted to authorized institute
            administrators only.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Staff Account Management">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-center justify-between transition-smooth ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2.5 text-xs font-semibold">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#006838] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#D81A22] shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, inspect, and manage staff accounts and role privileges for the institute portal.
          </p>
        </div>

        <button
          onClick={() => {
            setCreateError(null);
            setCreateModalOpen(true);
          }}
          className="inline-flex items-center justify-center px-4 py-2.5 text-xs font-bold rounded-lg text-white bg-[#006838] hover:bg-[#015333] active:bg-[#004225] shadow-xs transition-smooth"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Create Staff Member
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg placeholder-slate-400 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#006838] focus:border-[#006838] transition-smooth-fast"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center text-xs text-slate-500 mr-1">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            <span>Status:</span>
          </div>
          <div className="flex rounded-lg border border-slate-200 p-0.5 bg-slate-50">
            {(['ALL', 'ACTIVE', 'INACTIVE'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-smooth-fast ${
                  statusFilter === status
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {status === 'ALL' ? 'All' : status === 'ACTIVE' ? 'Active' : 'Inactive'}
              </button>
            ))}
          </div>

          <button
            onClick={fetchStaff}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Refresh list"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Staff Table / Skeleton */}
      {loading ? (
        <StaffTableSkeleton />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staffList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No staff accounts found matching your query.
                    </td>
                  </tr>
                ) : (
                  staffList.map((member) => {
                    const isSelf = member.id === currentUser?.id;

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs uppercase shadow-2xs shrink-0">
                              {member.fullName.charAt(0) || 'U'}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{member.fullName}</span>
                                {isSelf && (
                                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-normal">
                                    You
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono text-slate-600">{member.email}</td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                              member.role === 'ADMIN'
                                ? 'bg-emerald-50 text-[#006838] border-emerald-300'
                                : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}
                          >
                            {member.role === 'ADMIN' ? (
                              <ShieldCheck className="w-3 h-3 mr-1 text-[#006838]" />
                            ) : (
                              <Shield className="w-3 h-3 mr-1 text-slate-500" />
                            )}
                            {member.role}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              member.isActive
                                ? 'bg-emerald-50 text-[#006838] border border-emerald-200'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                member.isActive ? 'bg-[#006838]' : 'bg-slate-400'
                              }`}
                            />
                            {member.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500 font-medium">
                          {formatDate((member as any).createdAt)}
                        </td>

                        <td className="py-3.5 px-4 text-right space-x-2">
                          {/* Edit button */}
                          <button
                            onClick={() => {
                              setEditUser(member);
                              setEditForm({ fullName: member.fullName, newPassword: '' });
                              setEditError(null);
                            }}
                            className="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                            title="Edit Staff Member"
                          >
                            <Edit2 className="w-3 h-3 mr-1" />
                            Edit
                          </button>

                          {/* Activate / Deactivate button */}
                          <button
                            disabled={isSelf}
                            onClick={() => setStatusConfirmUser(member)}
                            className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                              isSelf
                                ? 'opacity-40 cursor-not-allowed bg-slate-50 text-slate-400 border-slate-200'
                                : member.isActive
                                ? 'bg-white hover:bg-red-50 text-red-700 border-red-200'
                                : 'bg-white hover:bg-emerald-50 text-[#006838] border-emerald-200'
                            }`}
                            title={isSelf ? 'Cannot deactivate self' : undefined}
                          >
                            {member.isActive ? 'Deactivate' : 'Activate'}
                          </button>
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
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#006838] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Create Staff Member</h3>
                  <p className="text-xs text-slate-500">Provide user credentials for portal access</p>
                </div>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="my-4 rounded-xl bg-red-50 border border-red-200 p-3 flex items-start space-x-2 text-red-800 text-xs">
                <AlertCircle className="w-4 h-4 text-[#D81A22] shrink-0 mt-0.5" />
                <span>{createError}</span>
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={createForm.fullName}
                    onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                    placeholder="e.g. Mahbuba Akter"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#006838] focus:border-[#006838]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    placeholder="officer@foreveritbd.com"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#006838] focus:border-[#006838]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Temporary / Initial Password
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                    placeholder="Minimum 8 characters..."
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#006838] focus:border-[#006838]"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  The staff member can change their password anytime via My Account.
                </p>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="create-active"
                  checked={createForm.isActive}
                  onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                  className="rounded text-[#006838] focus:ring-[#006838] w-4 h-4"
                />
                <label htmlFor="create-active" className="text-xs text-slate-700 font-medium">
                  Activate account immediately upon creation
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-4 py-2 text-xs font-bold rounded-lg text-white bg-[#006838] hover:bg-[#015333] disabled:opacity-50"
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
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Edit Staff Account</h3>
                <p className="text-xs text-slate-500">{editUser.email}</p>
              </div>
              <button onClick={() => setEditUser(null)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="my-4 rounded-xl bg-red-50 border border-red-200 p-3 flex items-start space-x-2 text-red-800 text-xs">
                <AlertCircle className="w-4 h-4 text-[#D81A22] shrink-0 mt-0.5" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateStaff} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#006838] focus:border-[#006838]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Reset Password (Optional)
                </label>
                <div className="relative rounded-lg shadow-2xs">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={editForm.newPassword}
                    onChange={(e) => setEditForm({ ...editForm, newPassword: e.target.value })}
                    placeholder="Leave blank to preserve current password"
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#006838] focus:border-[#006838]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4 py-2 text-xs font-bold rounded-lg text-white bg-[#006838] hover:bg-[#015333] disabled:opacity-50"
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
          <div className="relative bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-150 text-center">
            <div
              className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${
                statusConfirmUser.isActive ? 'bg-red-50 text-[#D81A22]' : 'bg-emerald-50 text-[#006838]'
              }`}
            >
              {statusConfirmUser.isActive ? (
                <XCircle className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900">
              {statusConfirmUser.isActive ? 'Deactivate Staff Member?' : 'Activate Staff Member?'}
            </h3>
            <p className="text-xs text-slate-500 mt-2">
              Are you sure you want to {statusConfirmUser.isActive ? 'deactivate' : 'activate'}{' '}
              <strong className="text-slate-800">{statusConfirmUser.fullName}</strong>?{' '}
              {statusConfirmUser.isActive
                ? 'They will no longer be able to log in to the management system.'
                : 'They will immediately regain portal access.'}
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setStatusConfirmUser(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusSubmitting}
                onClick={handleToggleStatus}
                className={`px-4 py-2 text-xs font-bold rounded-lg text-white disabled:opacity-50 ${
                  statusConfirmUser.isActive
                    ? 'bg-[#D81A22] hover:bg-red-700'
                    : 'bg-[#006838] hover:bg-[#015333]'
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
