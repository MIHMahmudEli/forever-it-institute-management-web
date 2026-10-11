'use client';

import React from 'react';
import TableSkeleton from './TableSkeleton';

export function PageSkeleton({
  title = true,
  tableRows = 6,
}: {
  title?: boolean;
  tableRows?: number;
}) {
  return (
    <div className="space-y-6 animate-pulse">
      {title && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div className="space-y-2">
            <div className="h-7 bg-slate-200 rounded w-48" />
            <div className="h-4 bg-slate-100 rounded w-72" />
          </div>
          <div className="h-9 bg-slate-200 rounded-lg w-32" />
        </div>
      )}
      <TableSkeleton rows={tableRows} />
    </div>
  );
}

export default PageSkeleton;
