'use client';

import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  showHeader?: boolean;
}

export function TableSkeleton({ rows = 5, cols = 6, showHeader = true }: TableSkeletonProps) {
  return (
    <div className="w-full bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs animate-pulse">
      {showHeader && (
        <div className="bg-slate-50/80 px-4 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4">
          {Array.from({ length: cols }).map((_, i) => (
            <div
              key={`header-${i}`}
              className="h-3.5 bg-slate-200 rounded"
              style={{ width: `${Math.max(12, 100 / cols - 4)}%` }}
            />
          ))}
        </div>
      )}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={`row-${rowIdx}`} className="px-4 py-3.5 flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, colIdx) => (
              <div
                key={`cell-${rowIdx}-${colIdx}`}
                className="h-4 bg-slate-100 rounded"
                style={{
                  width: `${Math.max(10, (100 / cols) * (colIdx === 0 ? 1.2 : colIdx === cols - 1 ? 0.7 : 0.9))}%`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TableSkeleton;
