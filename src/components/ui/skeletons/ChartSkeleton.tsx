'use client';

import React from 'react';

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs animate-pulse space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="space-y-2">
          <div className="h-5 bg-slate-200 rounded w-40" />
          <div className="h-3 bg-slate-100 rounded w-60" />
        </div>
        <div className="h-8 bg-slate-100 rounded-lg w-28" />
      </div>

      <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2">
        {[45, 65, 30, 85, 55, 90, 70, 40, 60, 75, 50, 80].map((height, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <div
              className="w-full bg-slate-100 rounded-t transition-all"
              style={{ height: `${height}%` }}
            />
            <div className="h-2.5 bg-slate-200 rounded w-6" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChartSkeleton;
