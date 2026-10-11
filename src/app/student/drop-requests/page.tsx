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
  AlertTriangle,
  XCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export default function StudentDropRequestsPage() {
  const [requests, setRequests] = useState<DropRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const loadRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.studentPortal.getDropRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch course drop requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancelRequest = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this course drop request? Your enrollment will remain active.')) {
      return;
    }

    setCancellingId(id);
    setError(null);
    setActionSuccess(null);
    try {
      const res = await api.studentPortal.cancelDropRequest(id);
      setActionSuccess(res.message);
      loadRequests();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel drop request.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <DashboardLayout title="Course Drop Requests">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Course Drop Requests</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track and manage formal requests submitted to withdraw from registered courses.
          </p>
        </div>

        <Link
          href="/student/courses"
          className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-50 shadow-xs transition-smooth"
        >
          View My Courses <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
        </Link>
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

      {loading ? (
        <TableSkeleton rows={4} />
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Drop Requests Submitted</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You currently have no pending or completed course drop requests.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const isPending = req.status === 'PENDING';

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition-smooth"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        {req.enrollment?.course?.code || 'CRS'}
                      </span>
                      <h2 className="text-sm font-bold text-slate-900">
                        {req.enrollment?.course?.name || 'Enrolled Program'}
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Submitted on {formatDate(req.requestDate)}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <StatusBadge status={req.status} />
                    {isPending && (
                      <button
                        onClick={() => handleCancelRequest(req.id)}
                        disabled={cancellingId === req.id}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-smooth disabled:opacity-50"
                      >
                        {cancellingId === req.id ? 'Cancelling...' : 'Cancel Request'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 text-xs text-slate-700 mb-3">
                  <span className="font-semibold text-slate-900 block mb-1">Reason for Withdrawal:</span>
                  <p className="leading-relaxed">{req.reason || 'No reason provided.'}</p>
                </div>

                {req.adminNotes && (
                  <div className="bg-amber-50/60 p-3.5 rounded-lg border border-amber-200/80 text-xs text-amber-900">
                    <div className="flex items-center space-x-1.5 font-bold mb-1 text-amber-800">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Institute Review Note:</span>
                    </div>
                    <p className="leading-relaxed">{req.adminNotes}</p>
                    {req.reviewerName && (
                      <p className="text-[10px] text-amber-700 mt-1.5">
                        Reviewed by: {req.reviewerName} {req.reviewedAt && `on ${formatDate(req.reviewedAt)}`}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
