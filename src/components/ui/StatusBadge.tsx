import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = (status || '').toUpperCase();

  let styles = 'bg-slate-100 text-slate-700 border-slate-200';

  switch (normalized) {
    case 'ACTIVE':
    case 'COMPLETED':
      styles = 'bg-emerald-50 text-emerald-800 border-emerald-300';
      break;
    case 'PENDING':
      styles = 'bg-amber-50 text-amber-800 border-amber-300';
      break;
    case 'REVERSED':
    case 'CANCELLED':
    case 'DROPPED':
    case 'ARCHIVED':
      styles = 'bg-rose-50 text-rose-800 border-rose-300';
      break;
    case 'INACTIVE':
      styles = 'bg-slate-100 text-slate-600 border-slate-300';
      break;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {normalized}
    </span>
  );
}
