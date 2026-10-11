'use client';

import React from 'react';

export function StudentDashboardSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Official Student Welcome Banner Skeleton */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#015333] via-[#006838] to-[#015333] p-6 mb-6 shadow-lg border border-emerald-600/40">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D81A22] transform rotate-45 translate-x-16 -translate-y-16 opacity-80 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-bold mb-2 border border-white/20">
              <span>FOREVER IT INSTITUTE</span>
              <span>•</span>
              <span>STUDENT DESK</span>
            </div>
            <div className="h-7 w-64 bg-white/25 rounded-lg mb-2" />
            <div className="h-4 w-96 max-w-full bg-white/15 rounded" />
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <div className="h-9 w-28 bg-white/20 rounded-xl" />
            <div className="h-9 w-24 bg-white/20 rounded-xl" />
          </div>
        </div>
      </div>

      {/* KPI Cards: Exact 4-column layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 bg-slate-200 rounded w-28" />
              <div className="w-9 h-9 rounded-lg bg-slate-100" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-7 bg-slate-200 rounded w-24" />
              <div className="h-3 bg-slate-100 rounded w-36" />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Enrolled Courses (2 cols) & Payment History (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Enrolled Courses (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-4 bg-slate-200 rounded w-36" />
              <div className="h-3 bg-slate-100 rounded w-48" />
            </div>
            <div className="h-3.5 bg-slate-100 rounded w-16" />
          </div>
          <div className="p-4 sm:p-5 space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <div className="h-5 w-16 bg-slate-200 rounded" />
                    <div className="h-4 w-44 bg-slate-200 rounded" />
                  </div>
                  <div className="h-3 w-56 bg-slate-100 rounded mt-2.5" />
                </div>
                <div className="flex items-center space-x-3 shrink-0">
                  <div className="h-6 w-16 bg-slate-200 rounded-full" />
                  <div className="w-8 h-8 rounded-lg bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment History (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-4 bg-slate-200 rounded w-28" />
              <div className="h-3 bg-slate-100 rounded w-36" />
            </div>
            <div className="h-3.5 bg-slate-100 rounded w-10" />
          </div>
          <div className="p-4 sm:p-5 divide-y divide-slate-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div className="space-y-1.5">
                  <div className="h-3.5 bg-slate-200 rounded w-28" />
                  <div className="h-3 bg-slate-100 rounded w-32" />
                </div>
                <div className="space-y-1.5 flex flex-col items-end">
                  <div className="h-4 bg-slate-200 rounded w-16" />
                  <div className="h-5 bg-slate-100 rounded-full w-14" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Support / Campus Contact Card Skeleton */}
      <div className="p-5 rounded-xl bg-slate-100 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-3 bg-slate-300 rounded w-32" />
          <div className="h-4 bg-slate-300 rounded w-64" />
          <div className="flex flex-wrap gap-4 pt-1">
            <div className="h-3 bg-slate-200 rounded w-72" />
            <div className="h-3 bg-slate-200 rounded w-28" />
          </div>
        </div>
        <div className="h-8 w-28 bg-slate-200 rounded-lg shrink-0" />
      </div>
    </div>
  );
}

export default StudentDashboardSkeleton;
