'use client';

import React from 'react';

interface SectionPillProps {
  icon?: React.ReactNode;
  title: string;
  className?: string;
}

export default function SectionPill({ icon, title, className = '' }: SectionPillProps) {
  return (
    <div className={`inline-flex items-center gap-2 mb-3 ${className}`}>
      {/* Green Pill Badge */}
      <div className="inline-flex items-center gap-2 bg-[#006838] text-white px-4 py-1.5 rounded-full shadow-sm">
        {icon && <span className="w-4 h-4 shrink-0 flex items-center justify-center">{icon}</span>}
        <span className="font-extrabold text-sm sm:text-base tracking-wide uppercase">
          {title}
        </span>
      </div>

      {/* Signature Angled Red Slash Accent Stripe */}
      <div className="flex items-center gap-1 pl-1">
        <span className="w-1.5 h-6 bg-[#D81A22] transform -skew-x-25 rounded-xs" />
        <span className="w-1 h-6 bg-[#D81A22] transform -skew-x-25 rounded-xs opacity-75" />
      </div>
    </div>
  );
}
