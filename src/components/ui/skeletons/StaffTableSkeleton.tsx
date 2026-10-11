'use client';

import React from 'react';

export function StaffTableSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {/* Search and Filter Controls Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="h-10 bg-slate-200 rounded-lg w-full sm:w-72" />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="h-10 bg-slate-200 rounded-lg w-28" />
          <div className="h-10 bg-slate-200 rounded-lg w-36" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between">
          <div className="h-3.5 bg-slate-200 rounded w-28" />
          <div className="h-3.5 bg-slate-200 rounded w-24" />
          <div className="h-3.5 bg-slate-200 rounded w-16" />
          <div className="h-3.5 bg-slate-200 rounded w-16" />
          <div className="h-3.5 bg-slate-200 rounded w-20" />
        </div>
        <div className="divide-y divide-slate-100">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-4 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-200" />
                <div className="space-y-1.5">
                  <div className="h-3.5 bg-slate-200 rounded w-32" />
                  <div className="h-3 bg-slate-100 rounded w-44" />
                </div>
              </div>
              <div className="h-5 bg-slate-100 rounded w-16" />
              <div className="h-5 bg-slate-100 rounded w-16" />
              <div className="h-3 bg-slate-100 rounded w-24" />
              <div className="h-8 bg-slate-100 rounded-lg w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StaffTableSkeleton;
