'use client';

import React from 'react';

export function StudentDetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-slate-200" />
          <div className="space-y-2">
            <div className="h-6 bg-slate-200 rounded w-48" />
            <div className="h-3.5 bg-slate-100 rounded w-32" />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-9 bg-slate-100 rounded-lg w-28" />
          <div className="h-9 bg-slate-200 rounded-lg w-32" />
        </div>
      </div>

      {/* 2-Column Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="h-5 bg-slate-200 rounded w-36 mb-4" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between py-2 border-b border-slate-50">
              <div className="h-3.5 bg-slate-100 rounded w-24" />
              <div className="h-3.5 bg-slate-200 rounded w-40" />
            </div>
          ))}
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="h-5 bg-slate-200 rounded w-44 mb-4" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                <div className="h-3 bg-slate-200 rounded w-16" />
                <div className="h-5 bg-slate-300 rounded w-20" />
              </div>
            ))}
          </div>
          <div className="pt-2 space-y-2">
            <div className="h-3 bg-slate-100 rounded w-full" />
            <div className="h-3 bg-slate-100 rounded w-3/4" />
          </div>
        </div>
      </div>

      {/* Transaction History Table Skeleton */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex justify-between">
          <div className="h-5 bg-slate-200 rounded w-44" />
          <div className="h-4 bg-slate-100 rounded w-20" />
        </div>
        <div className="p-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50">
              <div className="h-4 bg-slate-100 rounded w-28" />
              <div className="h-4 bg-slate-200 rounded w-20" />
              <div className="h-4 bg-slate-100 rounded w-24" />
              <div className="h-4 bg-slate-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentDetailsSkeleton;
