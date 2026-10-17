'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { api, DropRequest } from '@/lib/api/api-client';
import { formatDate } from '@/lib/utils';
import StatusBadge from '@/components/ui/StatusBadge';
import { TableSkeleton } from '@/components/ui/skeletons';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  X,
  MessageSquare,
  User,
  GraduationCap,
} from 'lucide-react';

export default function AdminDropRequestsPage() {
  const [requests, setRequests] = useState<DropRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<DropRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.dropRequests.getAll({
        search: search.trim() || undefined,
        status: statusFilter || undefined,
        page,
        limit: 10,
      });
      setRequests(res.data);
      setTotalPages(res.meta.totalPages);
      setTotalCount(res.meta.total);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch course drop requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadRequests();
  };

  const openReviewModal = (req: DropRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(req);
    setReviewAction(action);
    setAdminNotes('');
    setActionError(null);
    setActionSuccess(null);
    setReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setReviewModalOpen(false);
    setSelectedRequest(null);
  };

  const handleExecuteReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setSubmittingReview(true);
    setActionError(null);
    try {
      if (reviewAction === 'approve') {
        const res = await api.dropRequests.approve(selectedRequest.id, {
          adminNotes: adminNotes.trim() || undefined,
        });
        setActionSuccess(res.message);
      } else {
        const res = await api.dropRequests.reject(selectedRequest.id, {
          adminNotes: adminNotes.trim() || undefined,
        });
        setActionSuccess(res.message);
      }

      loadRequests();
      setTimeout(() => {
        closeReviewModal();
      }, 1200);
    } catch (err: any) {
      setActionError(err.message || `Failed to ${reviewAction} request.`);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <DashboardLayout title="Student Drop Requests">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Course Drop Requests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review, approve, or reject student course withdrawal requests.
          </p>
        </div>
      </div>

      {actionSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Status Filter Tabs */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 border border-slate-200/80 text-xs w-full sm:w-auto overflow-x-auto">
          {[
            { label: 'All', value: '' },
            { label: 'Pending', value: 'PENDING' },
            { label: 'Approved', value: 'APPROVED' },
            { label: 'Rejected', value: 'REJECTED' },
            { label: 'Cancelled', value: 'CANCELLED' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-smooth shrink-0 ${
                statusFilter === tab.value
                  ? 'bg-white text-emerald-800 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2 w-full sm:w-72">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student or course..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-2 rounded-lg bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Table */}
      {loading ? (
        <TableSkeleton rows={5} />
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Drop Requests Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            {statusFilter ? `No requests matching status "${statusFilter}".` : 'No drop requests currently registered.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Mobile Card List (< lg) */}
          <div className="block lg:hidden divide-y divide-slate-100 p-2 sm:p-3">
            {requests.map((req) => {
              const isPending = req.status === 'PENDING';
              return (
                <div key={req.id} className="p-3 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Link
                        href={`/students/${req.student?.id}`}
                        className="font-bold text-sm text-slate-900 hover:text-emerald-700 transition-colors"
                      >
                        {req.student?.fullName || 'Student'}
                      </Link>
                      <p className="font-mono text-xs text-slate-500 font-semibold">
                        {req.student?.registrationNumber}
                      </p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="font-mono text-[10px] text-emerald-800 font-bold block">
                      {req.enrollment?.course?.code}
                    </span>
                    <span className="font-bold text-xs text-slate-900 block">
                      {req.enrollment?.course?.name}
                    </span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Requested: {formatDate(req.requestDate)}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                    <span className="font-bold text-slate-700 block mb-0.5">Reason:</span>
                    <p className="italic text-slate-800">{req.reason || 'No reason provided'}</p>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-50">
                    {isPending ? (
                      <>
                        <button
                          type="button"
                          onClick={() => openReviewModal(req, 'reject')}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          onClick={() => openReviewModal(req, 'approve')}
                          className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 transition-colors shadow-xs cursor-pointer"
                        >
                          Approve
                        </button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">
                        Reviewed {req.reviewerName ? `by ${req.reviewerName}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table (hidden on mobile, visible on lg+) */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[760px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 whitespace-nowrap">
                <tr>
                  <th className="px-5 py-3.5">Student</th>
                  <th className="px-5 py-3.5">Registration #</th>
                  <th className="px-5 py-3.5">Course Program</th>
                  <th className="px-5 py-3.5">Request Date</th>
                  <th className="px-5 py-3.5">Reason</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => {
                  const isPending = req.status === 'PENDING';

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors whitespace-nowrap">
                      <td className="px-5 py-4">
                        <Link
                          href={`/students/${req.student?.id}`}
                          className="font-bold text-slate-900 hover:text-emerald-700 transition-colors flex items-center space-x-1.5"
                        >
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{req.student?.fullName || 'Student'}</span>
                        </Link>
                      </td>
                      <td className="px-5 py-4 font-mono font-semibold text-slate-700">
                        {req.student?.registrationNumber}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-800">
                        <span className="font-mono text-emerald-800 text-[11px] mr-1.5">
                          [{req.enrollment?.course?.code}]
                        </span>
                        {req.enrollment?.course?.name}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(req.requestDate)}</td>
                      <td className="px-5 py-4 text-slate-600 max-w-xs truncate" title={req.reason || ''}>
                        {req.reason || '—'}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isPending ? (
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openReviewModal(req, 'approve')}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-smooth cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => openReviewModal(req, 'reject')}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 transition-smooth cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Reviewed {req.reviewerName ? `by ${req.reviewerName}` : ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-3.5 sm:p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <span>
                Showing page {page} of {totalPages} ({totalCount} total requests)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={closeReviewModal}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  reviewAction === 'approve'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {reviewAction === 'approve' ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 capitalize">
                  {reviewAction} Drop Request
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedRequest.student?.fullName} ({selectedRequest.student?.registrationNumber})
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 mb-4">
              <div className="font-semibold text-slate-900 mb-1">
                Course: {selectedRequest.enrollment?.course?.name}
              </div>
              <p className="italic text-slate-600">
                &ldquo;{selectedRequest.reason}&rdquo;
              </p>
            </div>

            {actionSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            ) : (
              <form onSubmit={handleExecuteReview}>
                {actionError && (
                  <div className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {actionError}
                  </div>
                )}

                <div className="mb-4">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Administrative Review Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Provide notes or terms of withdrawal for student and records..."
                    className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-600 resize-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={closeReviewModal}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-xs font-bold text-white shadow-sm transition-smooth disabled:opacity-50 ${
                      reviewAction === 'approve'
                        ? 'bg-[#006838] hover:bg-[#00532d]'
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {submittingReview
                      ? 'Processing...'
                      : reviewAction === 'approve'
                      ? 'Confirm Approval'
                      : 'Confirm Rejection'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
