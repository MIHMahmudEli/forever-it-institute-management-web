'use client';

import React from 'react';

interface DashboardCardSkeletonProps {
  count?: number;
}

export function DashboardCardSkeleton({ count = 4 }: DashboardCardSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between h-32"
        >
          <div className="flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded w-28" />
            <div className="w-10 h-10 rounded-lg bg-slate-100" />
          </div>
          <div className="space-y-2 mt-auto">
            <div className="h-7 bg-slate-200 rounded w-24" />
            <div className="h-3 bg-slate-100 rounded w-36" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default DashboardCardSkeleton;
