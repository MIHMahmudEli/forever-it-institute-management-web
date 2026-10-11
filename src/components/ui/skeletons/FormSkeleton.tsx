'use client';

import React from 'react';

export function FormSkeleton({ fields = 4 }: { fields?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs animate-pulse space-y-5">
      <div className="h-5 bg-slate-200 rounded w-40 mb-2" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: fields }).map((_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="h-3.5 bg-slate-200 rounded w-24" />
            <div className="h-10 bg-slate-100 rounded-lg w-full" />
          </div>
        ))}
      </div>
      <div className="pt-2 flex justify-end">
        <div className="h-10 bg-slate-200 rounded-lg w-28" />
      </div>
    </div>
  );
}

export default FormSkeleton;
